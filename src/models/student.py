from datetime import UTC, datetime
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel


class Student(SQLModel, table=True):
    __tablename__ = "students"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    school_id: UUID | None = Field(default=None, foreign_key="schools.id")
    full_name: str
    email: str = Field(unique=True)
    created_at: datetime | None = Field(default_factory=lambda: datetime.now(UTC))
