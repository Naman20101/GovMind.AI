import uuid
from datetime import datetime
from sqlalchemy import String, Float, Text, DateTime, Enum, JSON
from sqlalchemy.orm import Mapped, mapped_column, DeclarativeBase
from sqlalchemy.dialects.postgresql import UUID


class Base(DeclarativeBase):
    pass


class PermitApplication(Base):
    __tablename__ = "permit_applications"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    business_name: Mapped[str] = mapped_column(String(255), nullable=False)
    owner_name_masked: Mapped[str] = mapped_column(String(50), nullable=True)
    tax_id_masked: Mapped[str] = mapped_column(String(20), nullable=True)
    address_masked: Mapped[str] = mapped_column(String(255), nullable=True)
    permit_type: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(
        Enum(
            "PENDING", "APPROVED", "FLAGGED",
            "REJECTED", "HUMAN_REVIEW",
            name="permit_status"
        ),
        default="PENDING",
        nullable=False
    )
    ai_decision: Mapped[str] = mapped_column(String(20), nullable=True)
    ai_confidence: Mapped[float] = mapped_column(Float, nullable=True)
    ai_reason: Mapped[str] = mapped_column(Text, nullable=True)
    audit_trace: Mapped[dict] = mapped_column(JSON, nullable=True)
    file_path: Mapped[str] = mapped_column(String(500), nullable=True)
    submitted_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    reviewed_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    reviewed_by: Mapped[str] = mapped_column(String(100), nullable=True)
    human_override_reason: Mapped[str] = mapped_column(Text, nullable=True)
