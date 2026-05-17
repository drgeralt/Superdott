from enum import Enum
from typing import Optional
from sqlmodel import Field, SQLModel

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
