from uuid import UUID
from enum import Enum
from typing import Optional, TYPE_CHECKING, List
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from src.models.student import Student
    from src.models.student_document import StudentDocument

from src.models.links import ParentStudentLink

from datetime import datetime

class UserRole(str, Enum):
    SuperAdmin = "SuperAdmin"
    Diretor = "Diretor"
    Professor = "Professor"
    Pai = "Pai"

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    hashed_password: str
    is_active: bool = Field(default=True)
    role: UserRole = Field(default=UserRole.Professor)
    accepted_tcle: bool = Field(default=False)
    tcle_accepted_at: datetime | None = Field(default=None)
    school_id: Optional[UUID] = Field(default=None, foreign_key="schools.id")
    avatar_url: Optional[str] = Field(default=None)

    # Relationship to students (parents)
    students: List["Student"] = Relationship(back_populates="parents", link_model=ParentStudentLink)
    # Relationship to uploaded documents (RAG)
    uploaded_documents: List["StudentDocument"] = Relationship(back_populates="parent")

