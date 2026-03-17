from datetime import datetime
import uuid


def log_audit_decision(
    decision: str,
    reason: str,
    confidence: float,
    user_id: int = None
) -> dict:
    return {
        "timestamp": datetime.utcnow().isoformat(),
        "decision": decision,
        "reason": reason,
        "confidence": confidence,
        "reversible_by": "admin",
        "trace_id": str(uuid.uuid4()),
        "user_id": user_id
    }
