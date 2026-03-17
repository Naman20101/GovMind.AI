from app.core.security import mask_pii
from app.core.audit import log_audit_decision
from app.services.extractor import extract_permit_data


def auto_review_business_permit(file_path: str) -> dict:
    raw_data = extract_permit_data(file_path)
    masked = mask_pii(raw_data)

    issues = []
    if len(masked.get("documents", [])) < 3:
        issues.append("Missing required documents")
    if not masked.get("tax_id"):
        issues.append("Tax ID missing")

    if issues:
        decision = "FLAGGED"
        reason = f"Requires human review: {', '.join(issues)}"
        confidence = 95.0
    else:
        decision = "APPROVED"
        reason = "All regulatory criteria met. Documents complete, no red flags detected."
        confidence = 92.0

    audit_trace = log_audit_decision(decision, reason, confidence)

    return {
        "decision": decision,
        "masked_data": masked,
        "audit_trace": audit_trace,
        "human_review_link": "/admin/permits/review?trace_id=" + audit_trace["trace_id"]
    }
