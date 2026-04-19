from datetime import UTC, datetime
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel


class School(SQLModel, table=True):
    __tablename__ = "schools"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str
    address: str | None = None
    created_at: datetime | None = Field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime | None = Field(default_factory=lambda: datetime.now(UTC))
