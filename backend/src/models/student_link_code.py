import secrets
import string
from datetime import datetime, timedelta, timezone
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel


def _gerar_codigo() -> str:
    """Gera código alfanumérico legível. Ex: SUP-X7B9-K2"""
    alfabeto = string.ascii_uppercase + string.digits
    parte1 = "".join(secrets.choice(alfabeto) for _ in range(4))
    parte2 = "".join(secrets.choice(alfabeto) for _ in range(2))
    return f"SUP-{parte1}-{parte2}"


def _expiracao_padrao() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(hours=48)


class StudentLinkCode(SQLModel, table=True):
    __tablename__ = "student_link_codes"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    code: str = Field(default_factory=_gerar_codigo, unique=True, index=True)
    student_id: UUID = Field(foreign_key="students.id")
    created_by: int | None = Field(default=None, foreign_key="user.id", nullable=True)
    email_responsavel: str | None = Field(default=None, nullable=True)
    nome_responsavel: str | None = Field(default=None, nullable=True)
    expires_at: datetime = Field(default_factory=_expiracao_padrao)
    is_used: bool = Field(default=False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc).replace(tzinfo=None))