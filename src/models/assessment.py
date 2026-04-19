from datetime import UTC, datetime
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel


class Assessment(SQLModel, table=True):
    __tablename__ = "assessments"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    title: str
    subject: str | None = None
    created_at: datetime | None = Field(default_factory=lambda: datetime.now(UTC))
