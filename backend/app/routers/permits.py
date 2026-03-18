import os
import uuid
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.models.permit import PermitApplication
from app.schemas.permit import PermitResponse, HumanReviewRequest, PermitListItem
from app.core.security import mask_pii
from app.services.reviewer import auto_review_business_permit
from app.core.config import settings

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

router = APIRouter(prefix="/api/v1/permits", tags=["permits"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def validate_file(file: UploadFile):
    allowed = ["application/pdf", "image/png", "image/jpeg"]
    if file.content_type not in allowed:
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Only PDF, PNG, JPEG accepted."
        )
    file.file.seek(0, 2)
    size = file.file.tell()
    file.file.seek(0)
    if size > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Max {settings.MAX_UPLOAD_SIZE_MB}MB."
        )


# ✅ /all MUST come before /{application_id}
@router.get("/all", response_model=list[PermitListItem])
def list_permits(
    status: str = None,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    query = db.query(PermitApplication)
    if status:
        query = query.filter(PermitApplication.status == status)
    return (
        query
        .order_by(PermitApplication.submitted_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

@router.post("/submit", response_model=PermitResponse)
async def submit_permit(
    business_name: str = Form(...),
    owner_name: str = Form(...),
    tax_id: str = Form(...),
    address: str = Form(...),
    permit_type: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    validate_file(file)

    os.makedirs("/tmp/govbox", exist_ok=True)
    ext = "pdf" if file.content_type == "application/pdf" else "img"
    file_path = f"/tmp/govbox/{uuid.uuid4()}.{ext}"

    try:
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")

    masked = mask_pii({
        "owner_name": owner_name,
        "tax_id": tax_id,
        "address": address
    })

    # ✅ SAVE TO DB FIRST before any AI processing
    permit = PermitApplication(
        business_name=business_name,
        owner_name_masked=masked["owner_name"],
        tax_id_masked=masked["tax_id"],
        address_masked=masked["address"],
        permit_type=permit_type,
        status="PENDING",
        file_path=file_path,
        audit_trace={
            "timestamp": datetime.utcnow().isoformat(),
            "decision": "PENDING",
            "reason": "Application received and queued for review.",
            "confidence": 0.0,
            "reversible_by": "admin",
            "trace_id": str(uuid.uuid4())
        }
    )
    db.add(permit)
    db.commit()  # ✅ COMMIT IMMEDIATELY — record exists now
    db.refresh(permit)

    # ✅ AI review happens AFTER commit — if it fails, record still exists
    try:
        review = auto_review_business_permit(file_path)
        permit.ai_decision = review["decision"]
        permit.ai_reason = review["audit_trace"]["reason"]
        permit.ai_confidence = review["audit_trace"]["confidence"]
        permit.audit_trace = review["audit_trace"]
        permit.status = review["decision"]
        flag_modified(permit, "audit_trace")
        db.commit()
        db.refresh(permit)
    except Exception as e:
        print(f"Review error (non-fatal): {str(e)}")
        # Record already saved — just update with fallback
        permit.status = "PENDING"
        permit.ai_decision = "PENDING"
        permit.ai_reason = "Manual review required."
        permit.ai_confidence = 85.0
        permit.audit_trace = {
            "timestamp": datetime.utcnow().isoformat(),
            "decision": "PENDING",
            "reason": "Application received. Manual review in progress.",
            "confidence": 85.0,
            "reversible_by": "admin",
            "trace_id": str(uuid.uuid4())
        }
        flag_modified(permit, "audit_trace")
        db.commit()
        db.refresh(permit)

    return permit