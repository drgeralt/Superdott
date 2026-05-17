import uuid
from datetime import datetime
from sqlmodel import Field, SQLModel

class StudentLinkCode(SQLModel, table=True):
    __tablename__ = "student_link_codes"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    code: str = Field(unique=True, index=True)
    student_id: uuid.UUID = Field(foreign_key="students.id")
    email_responsavel: str
    nome_responsavel: str
    is_used: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime | None = Field(default=None)
