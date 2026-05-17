from enum import Enum
from typing import Optional, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from src.models.student import Student

from src.models.links import ParentStudentLink

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

    students: list["Student"] = Relationship(
        back_populates="parents", link_model=ParentStudentLink
    )
