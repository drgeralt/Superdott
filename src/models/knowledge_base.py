from datetime import datetime
from typing import Any
from uuid import UUID, uuid4

from pgvector.sqlalchemy import Vector
from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSON
from sqlmodel import Field, SQLModel


class KnowledgeBase(SQLModel, table=True):
    __tablename__ = "knowledge_base"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    content: str
    # Vector(3072) definido no sa_column
    embedding: Any | None = Field(sa_column=Column(Vector(3072)))
    metadata_: Any | None = Field(default=None, sa_column=Column("metadata", JSON))
    source: str | None = None
    chunk_index: int | None = None
    created_at: datetime | None = Field(default_factory=datetime.utcnow)
