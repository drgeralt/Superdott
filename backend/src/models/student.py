from datetime import datetime
from uuid import UUID, uuid4
from typing import List, Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from src.models.school import School
    from src.models.user import User
    from src.models.student_document import StudentDocument

from src.models.links import SchoolStudentLink, ParentStudentLink

from sqlmodel import Field, SQLModel, Relationship

class Student(SQLModel, table=True):
    __tablename__ = "students"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    full_name: str
    email: str = Field(unique=True)
    turma: Optional[str] = Field(default=None)
    score_intelectual: Optional[float] = Field(default=None)
    score_criativo: Optional[float] = Field(default=None)
    score_lideranca: Optional[float] = Field(default=None)
    triage_completed: bool = Field(default=False)
    avatar_url: Optional[str] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.now)

    # Relationships
    schools: List["School"] = Relationship(back_populates="students", link_model=SchoolStudentLink)
    parents: List["User"] = Relationship(back_populates="students", link_model=ParentStudentLink)
    documents: List["StudentDocument"] = Relationship(back_populates="student")
