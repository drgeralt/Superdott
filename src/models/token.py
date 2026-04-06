import uuid
from datetime import datetime

from sqlmodel import Field, SQLModel


class Token(SQLModel, table=True):
    __tablename__ = "tokens"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
    )
    token: str = Field(max_length=64, unique=True, index=True)
    student_id: uuid.UUID = Field()
    assessment_id: uuid.UUID = Field()
    is_used: bool = Field(default=False)
    expires_at: datetime | None = Field(default=None)
    used_at: datetime | None = Field(default=None)
    created_at: datetime | None = Field(default=None)
