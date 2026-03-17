from pydantic import BaseModel, Field, ConfigDict
from typing import Literal, Optional, Any
from datetime import datetime
from uuid import UUID


class PermitSubmitRequest(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    business_name: str = Field(..., min_length=2, max_length=255)
    owner_name: str = Field(..., min_length=2, max_length=100)
    tax_id: str = Field(..., min_length=4, max_length=50)
    address: str = Field(..., min_length=5, max_length=255)
    permit_type: str = Field(..., min_length=3, max_length=100)


class PermitResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    business_name: str
    owner_name_masked: Optional[str] = None
    tax_id_masked: Optional[str] = None
    address_masked: Optional[str] = None
    permit_type: str
    status: str
    ai_decision: Optional[str] = None
    ai_confidence: Optional[float] = None
    ai_reason: Optional[str] = None
    audit_trace: Optional[Any] = None
    submitted_at: datetime
    reviewed_at: Optional[datetime] = None
    reviewed_by: Optional[str] = None
    human_override_reason: Optional[str] = None


class HumanReviewRequest(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    decision: Literal["APPROVED", "REJECTED", "HUMAN_REVIEW"]
    reason: str = Field(..., min_length=10)
    reviewed_by: str


class PermitListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    business_name: str
    permit_type: str
    status: str
    ai_decision: Optional[str] = None
    ai_confidence: Optional[float] = None
    submitted_at: datetime
