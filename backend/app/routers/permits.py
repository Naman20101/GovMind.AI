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
        raise HTTPException(status_code=400, detail="Invalid file type.")
    file.file.seek(0, 2)
    size = file.file.tell()
    file.file.seek(0)
    if size > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"File too large. Max {settings.MAX_UPLOAD_SIZE_MB}MB.")


def send_decision_email(to_email, business_name, decision, reason, permit_id, reviewed_by="GovMind.AI"):
    if not to_email or '@' not in to_email:
        return
    try:
        resend_key = os.getenv("RESEND_API_KEY")
        if not resend_key:
            print(f"No RESEND_API_KEY — skipping email")
            return
        import resend
        resend.api_key = resend_key
        is_approved = decision == "APPROVED"
        emoji = "✅" if is_approved else "❌"
        color = "#27AE60" if is_approved else "#E74C3C"
        status_text = "Approved" if is_approved else "Rejected"
        resend.Emails.send({
            "from": "GovMind.AI <decisions@govmind.ai>",
            "to": to_email,
            "subject": f"{emoji} Permit {status_text} — {business_name}",
            "html": f"""
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
              <div style="background:#1B4F72;padding:24px;border-radius:12px 12px 0 0;text-align:center;">
                <h1 style="color:white;margin:0;">🏛️ GovMind.AI</h1>
              </div>
              <div style="background:white;padding:32px;border:1px solid #e5e7eb;border-radius:0 0 12px 12px;">
                <h2 style="color:{color};text-align:center;">{emoji} Application {status_text}</h2>
                <p>Your permit application for <strong>{business_name}</strong> has been <strong style="color:{color};">{status_text.lower()}</strong>.</p>
                <div style="background:#f4f6f9;border-left:4px solid {color};padding:16px;border-radius:8px;margin:16px 0;">
                  <strong>Reason:</strong><br/>{reason}
                </div>
                <p style="color:#6b7280;font-size:12px;">
                  Application ID: APP-{permit_id[:8].upper()}<br/>
                  Reviewed by: {reviewed_by}<br/>
                  Date: {datetime.utcnow().strftime('%B %d, %Y')}
                </p>
                <a href="https://gov-mind-ai-wd4n.vercel.app/apply"
                  style="display:inline-block;background:#1B4F72;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
                  {"View Details →" if is_approved else "Submit New Application →"}
                </a>
                <p style="color:#9ca3af;font-size:11px;margin-top:24px;">
                  🔒 All decisions are auditable and human-reversible. GovMind.AI
                </p>
              </div>
            </div>
            """
        })
        print(f"✅ Email sent to {to_email} — {decision}")
    except Exception as e:
        print(f"❌ Email failed: {repr(e)}")


@router.get("/all", response_model=list[PermitListItem])
def list_permits(
    status: str = None,
    limit: int = 500,
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

    masked = mask_pii({"owner_name": owner_name, "tax_id": tax_id, "address": address})

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
            "reason": "Application received.",
            "confidence": 0.0,
            "reversible_by": "admin",
            "trace_id": str(uuid.uuid4()),
            "applicant_email": applicant_email
        }
    )
    db.add(permit)
    db.commit()
    db.refresh(permit)

    try:
        review = auto_review_business_permit(file_path)
        permit.ai_decision = review["decision"]
        permit.ai_reason = review["audit_trace"]["reason"]
        permit.ai_confidence = review["audit_trace"]["confidence"]
        audit = review["audit_trace"]
        audit["applicant_email"] = applicant_email
        permit.audit_trace = audit
        permit.status = review["decision"]
        flag_modified(permit, "audit_trace")
        db.commit()
        db.refresh(permit)
    except Exception as e:
        print(f"Review error: {str(e)}")
        permit.status = "PENDING"
        permit.ai_decision = "PENDING"
        permit.ai_reason = "Manual review in progress."
        permit.ai_confidence = 85.0
        db.commit()
        db.refresh(permit)

    return permit


@router.get("/{application_id}", response_model=PermitResponse)
def get_permit(application_id: str, db: Session = Depends(get_db)):
    # ✅ Use query instead of db.get — more reliable
    permit = db.query(PermitApplication).filter(
        PermitApplication.id == application_id
    ).first()
    if not permit:
        raise HTTPException(status_code=404, detail="Application not found.")
    return permit


@router.post("/{application_id}/review", response_model=PermitResponse)
def review_permit(
    application_id: str,
    body: HumanReviewRequest,
    db: Session = Depends(get_db)
):
    # ✅ Use query instead of db.get — more reliable
    permit = db.query(PermitApplication).filter(
        PermitApplication.id == application_id
    ).first()
    if not permit:
        raise HTTPException(status_code=404, detail="Application not found.")

    permit.status = body.decision
    permit.reviewed_by = body.reviewed_by
    permit.reviewed_at = datetime.utcnow()
    permit.human_override_reason = body.reason

    trace = permit.audit_trace or []
    applicant_email = ""

    if isinstance(trace, dict):
        applicant_email = trace.get("applicant_email", "")
        trace = [trace]
    elif isinstance(trace, list):
        for entry in trace:
            if isinstance(entry, dict) and entry.get("applicant_email"):
                applicant_email = entry["applicant_email"]
                break

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

    # ✅ Send email on approve or reject
    if applicant_email and body.decision in ["APPROVED", "REJECTED"]:
        send_decision_email(
            to_email=applicant_email,
            business_name=permit.business_name,
            decision=body.decision,
            reason=body.reason,
            permit_id=str(permit.id),
            reviewed_by=body.reviewed_by
        )

    return permit
