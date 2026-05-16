from datetime import datetime
from decimal import Decimal
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel


class Answer(SQLModel, table=True):
    __tablename__ = "answers"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    student_id: UUID | None = Field(default=None, foreign_key="students.id")
    assessment_id: UUID | None = Field(default=None, foreign_key="assessments.id")
    content_text: str
    score: Decimal | None = Field(default=None, max_digits=5, decimal_places=2)
    created_at: datetime | None = Field(default_factory=datetime.utcnow)
