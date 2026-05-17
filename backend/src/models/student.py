from datetime import datetime
from uuid import UUID, uuid4
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from src.models.school import School
    from src.models.user import User

from src.models.links import SchoolStudentLink, ParentStudentLink

from sqlmodel import Field, SQLModel, Relationship

class Student(SQLModel, table=True):
    __tablename__ = "students"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    full_name: str
    email: str = Field(unique=True)
    created_at: datetime | None = Field(default_factory=datetime.now)

    schools: list["School"] = Relationship(
        back_populates="students", link_model=SchoolStudentLink
    )
    parents: list["User"] = Relationship(
        back_populates="students", link_model=ParentStudentLink
    )
