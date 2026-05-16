import uuid
from datetime import datetime, timezone
from enum import Enum
from typing import Optional

from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSON
from sqlmodel import Field, SQLModel


class AuditAction(str, Enum):
    PDI_GENERATED           = "PDI_GENERATED"
    STUDENT_LINKED          = "STUDENT_LINKED"
    STUDENT_UNLINKED        = "STUDENT_UNLINKED"
    SENSITIVE_DATA_ACCESSED = "SENSITIVE_DATA_ACCESSED"


class AuditLog(SQLModel, table=True):
    __tablename__ = "audit_logs"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(nullable=False, index=True)
    action: AuditAction = Field(nullable=False, index=True)
    target_student_id: Optional[uuid.UUID] = Field(
        default=None, nullable=True, index=True
    )
    details: Optional[dict] = Field(
        default=None, sa_column=Column(JSON)
    )
    created_at: datetime = Field(
    default_factory=lambda: datetime.utcnow(),
    nullable=False,
    index=True,
    )

