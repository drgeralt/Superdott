from datetime import datetime
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel, Relationship
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from src.models.student import Student

from src.models.links import SchoolStudentLink

class School(SQLModel, table=True):
    __tablename__ = "schools"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str
    address: str | None = None
    created_at: datetime | None = Field(default_factory=datetime.now)
    updated_at: datetime | None = Field(default_factory=datetime.now)

    students: list["Student"] = Relationship(
        back_populates="schools", link_model=SchoolStudentLink
    )
