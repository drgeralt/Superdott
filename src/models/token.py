"""
src/models/token.py
-------------------
Define o modelo Token que mapeia a tabela `tokens` no PostgreSQL.

SQLModel funciona assim:
  - table=True  → é uma tabela real no banco (como um Model do Django)
  - sem table=True → é apenas um schema Pydantic (usado para request/response)
"""

import uuid
from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class Token(SQLModel, table=True):
    """
    Tabela: tokens
    Representa um link de acesso único enviado a pais/professores
    para que eles respondam a triagem de um aluno específico.
    """

    __tablename__ = "tokens"

    # UUID gerado pelo banco (server_default para respeitar gen_random_uuid())
    id: Optional[uuid.UUID] = Field(
        default=None,
        primary_key=True,
        sa_column_kwargs={"server_default": "gen_random_uuid()"},
    )

    # O token em si (ex: "abc123xyz...") — único na tabela
    token: str = Field(max_length=64, unique=True, index=True)

    # FK para a tabela students
    student_id: uuid.UUID = Field(foreign_key="students.id")

    # FK para a tabela assessments
    assessment_id: uuid.UUID = Field(foreign_key="assessments.id")

    # FALSE = disponível para uso; TRUE = já foi utilizado (invalidado)
    is_used: bool = Field(default=False)

    # Data de expiração (opcional — definida no momento da criação do token)
    expires_at: Optional[datetime] = Field(default=None)

    # Quando o token foi efetivamente utilizado para submissão
    used_at: Optional[datetime] = Field(default=None)

    created_at: Optional[datetime] = Field(default=None)