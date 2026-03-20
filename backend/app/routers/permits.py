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


def send_decision_email(
    to_email: str,
    business_name: str,
    decision: str,
    reason: str,
    permit_id: str,
    reviewed_by: str = "GovMind.AI"
):
    """Send email when admin approves or rejects."""
    if not to_email or '@' not in to_email:
        print(f"No valid email to notify — skipping")
        return

    try:
        resend_key = os.getenv("RESEND_API_KEY")
        if not resend_key:
            print(f"No RESEND_API_KEY — skipping email to {to_email}")
            return

        import resend
        resend.api_key = resend_key

        is_approved = decision == "APPROVED"
        emoji = "✅" if is_approved else "❌"
        color = "#27AE60" if is_approved else "#E74C3C"
        bg_color = "#F0FFF4" if is_approved else "#FFF5F5"
        status_text = "Approved" if is_approved else "Rejected"

        resend.Emails.send({
            "from": "GovMind.AI <decisions@govmind.ai>",
            "to": to_email,
            "subject": f"{emoji} Permit Application {status_text} — {business_name}",
            "html": f"""
            <!DOCTYPE html>
            <html>
            <body style="margin:0;padding:0;background:#F4F6F9;font-family:'DM Sans',Arial,sans-serif;">
              <div style="max-width:600px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

                <!-- Header -->
                <div style="background:#1B4F72;padding:32px;text-align:center;">
                  <h1 style="color:white;margin:0;font-size:24px;font-weight:700;">
                    🏛️ GovMind.AI
                  </h1>
                  <p style="color:rgba(255,255,255,0.7);margin:8px 0 0;font-size:14px;">
                    Government Services, Automated with AI
                  </p>
                </div>

                <!-- Status badge -->
                <div style="background:{bg_color};padding:32px;text-align:center;border-bottom:1px solid #E5E7EB;">
                  <div style="font-size:48px;margin-bottom:12px;">{emoji}</div>
                  <h2 style="color:{color};margin:0;font-size:28px;font-weight:700;">
                    Application {status_text}
                  </h2>
                  <p style="color:#6B7280;margin:8px 0 0;font-size:14px;">
                    Your permit application has been reviewed
                  </p>
                </div>

                <!-- Content -->
                <div style="padding:32px;">
                  <p style="color:#374151;font-size:16px;margin:0 0 24px;">
                    Your permit application for <strong style="color:#1B4F72;">{business_name}</strong> has been <strong style="color:{color};">{status_text.lower()}</strong> by a government officer.
                  </p>

                  <!-- Reason box -->
                  <div style="background:#F4F6F9;border-left:4px solid {color};border-radius:8px;padding:16px;margin-bottom:24px;">
                    <p style="color:#6B7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 8px;">
                      Decision Reason
                    </p>
                    <p style="color:#374151;font-size:15px;margin:0;line-height:1.6;">
                      {reason}
                    </p>
                  </div>

                  <!-- Details -->
                  <div style="background:#F9FAFB;border-radius:8px;padding:16px;margin-bottom:24px;">
                    <table style="width:100%;border-collapse:collapse;">
                      <tr>
                        <td style="color:#6B7280;font-size:13px;padding:4px 0;">Application ID</td>
                        <td style="color:#1B4F72;font-size:13px;font-family:monospace;text-align:right;">APP-{permit_id[:8].upper()}</td>
                      </tr>
                      <tr>
                        <td style="color:#6B7280;font-size:13px;padding:4px 0;">Decision By</td>
                        <td style="color:#374151;font-size:13px;text-align:right;">{reviewed_by}</td>
                      </tr>
                      <tr>
                        <td style="color:#6B7280;font-size:13px;padding:4px 0;">Date</td>
                        <td style="color:#374151;font-size:13px;text-align:right;">{datetime.utcnow().strftime('%B %d, %Y')}</td>
                      </tr>
                    </table>
                  </div>

                  <!-- CTA -->
                  {"<p style='color:#374151;font-size:14px;margin:0 0 16px;'>Your permit has been approved. You may proceed with your business operations.</p>" if is_approved else "<p style='color:#374151;font-size:14px;margin:0 0 16px;'>You may address the issues mentioned above and submit a new application.</p>"}

                  <a href="https://gov-mind-ai-wd4n.vercel.app/apply"
                    style="display:inline-block;background:#1B4F72;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
                    {"View Approval →" if is_approved else "Submit New Application →"}
                  </a>
                </div>

                <!-- Footer -->
                <div style="background:#F4F6F9;padding:24px;text-align:center;border-top:1px solid #E5E7EB;">
                  <p style="color:#9CA3AF;font-size:12px;margin:0;">
                    🔒 All decisions are auditable and human-reversible.<br/>
                    GovMind.AI — Government Services, Automated with AI
                  </p>
                </div>

              </div>
            </body>
            </html>
            """
        })
        print(f"✅ Decision email sent to {to_email} — {decision}")
    except Exception as e:
        print(f"❌ Email send failed: {repr(e)}")


# ✅ /all MUST come before /{application_id}
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

    masked = mask_pii({
        "owner_name": owner_name,
        "tax_id": tax_id,
        "address": address
    })

    # Save to DB first
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
            "trace_id": str(uuid.uuid4()),
            "applicant_email": applicant_email
        }
    )
    db.add(permit)
    db.commit()
    db.refresh(permit)

    # AI review after commit
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

    # Append to audit trace — immutable
    trace = permit.audit_trace or []
    if isinstance(trace, dict):
        applicant_email = trace.get("applicant_email", "")
        trace = [trace]
    else:
        applicant_email = ""
        if trace:
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

    # ✅ Send email notification to applicant
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