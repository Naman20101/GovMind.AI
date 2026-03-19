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


def send_email_notification(
    to_email: str,
    business_name: str,
    decision: str,
    reason: str,
    permit_id: str
):
    """Send email notification - uses Resend if API key available"""
    try:
        resend_key = os.getenv("RESEND_API_KEY")
        if not resend_key:
            print(f"No RESEND_API_KEY — skipping email to {to_email}")
            return

        import resend
        resend.api_key = resend_key

        status_emoji = "✅" if decision == "APPROVED" else "❌"
        status_text = "Approved" if decision == "APPROVED" else "Rejected/Flagged"
        color = "#27AE60" if decision == "APPROVED" else "#E74C3C"

        resend.Emails.send({
            "from": "GovMind.AI <decisions@govmind.ai>",
            "to": to_email,
            "subject": f"{status_emoji} Your Permit Application: {status_text}",
            "html": f"""
            <div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: #1B4F72; padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">GovMind.AI</h1>
                <p style="color: rgba(255,255,255,0.7); margin: 8px 0 0;">Government Services, Automated with AI</p>
              </div>
              <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px; border: 1px solid #e5e7eb;">
                <div style="text-align: center; margin-bottom: 24px;">
                  <span style="font-size: 48px;">{status_emoji}</span>
                  <h2 style="color: {color}; margin: 8px 0;">{status_text}</h2>
                </div>
                <p style="color: #374151;">Your permit application for <strong>{business_name}</strong> has been reviewed.</p>
                <div style="background: #F4F6F9; padding: 16px; border-radius: 12px; margin: 16px 0;">
                  <p style="color: #6B7280; font-size: 14px; margin: 0 0 8px;"><strong>Decision Reason:</strong></p>
                  <p style="color: #374151; margin: 0;">{reason}</p>
                </div>
                <div style="background: #F4F6F9; padding: 16px; border-radius: 12px; margin: 16px 0;">
                  <p style="color: #6B7280; font-size: 12px; margin: 0;">Application ID: APP-{permit_id[:8].upper()}</p>
                </div>
                <p style="color: #6B7280; font-size: 12px; margin-top: 24px; text-align: center;">
                  🔒 All decisions are auditable and human-reversible.<br/>
                  If you disagree with this decision, you can request human review.
                </p>
              </div>
            </div>
            """
        })
        print(f"✅ Email sent to {to_email}")
    except Exception as e:
        print(f"❌ Email failed: {repr(e)}")


# ✅ /all MUST be before /{application_id}
@router.get("/all", response_model=list[PermitListItem])
def list_permits(
    status: str = None,
    limit: int = 500,  # ✅ Increased from 50
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
    applicant_email: str = Form(default=""),
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

    # ✅ Save to DB FIRST before AI review
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
    db.commit()
    db.refresh(permit)

    # ✅ AI review after commit — won't lose record if it fails
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
        permit.status = "PENDING"
        permit.ai_decision = "PENDING"
        permit.ai_reason = "Application received. Manual review in progress."
        permit.ai_confidence = 85.0
        db.commit()
        db.refresh(permit)

    return permit


@router.get("/{application_id}", response_model=PermitResponse)
def get_permit(application_id: str, db: Session = Depends(get_db)):
    permit = db.get(PermitApplication, application_id)
    if not permit:
        raise HTTPException(status_code=404, detail="Application not found.")
    return permit


@router.post("/{application_id}/review", response_model=PermitResponse)
def review_permit(
    application_id: str,
    body: HumanReviewRequest,
    db: Session = Depends(get_db)
):
    permit = db.get(PermitApplication, application_id)
    if not permit:
        raise HTTPException(status_code=404, detail="Application not found.")

    permit.status = body.decision
    permit.reviewed_by = body.reviewed_by
    permit.reviewed_at = datetime.utcnow()
    permit.human_override_reason = body.reason

    trace = permit.audit_trace or []
    if isinstance(trace, dict):
        trace = [trace]

    trace.append({
        "type": "human_override",
        "decision": body.decision,
        "reason": body.reason,
        "reviewed_by": body.reviewed_by,
        "timestamp": datetime.utcnow().isoformat(),
        "reversible_by": "admin"
    })

    permit.audit_trace = trace
    flag_modified(permit, "audit_trace")

    db.commit()
    db.refresh(permit)

    return permit