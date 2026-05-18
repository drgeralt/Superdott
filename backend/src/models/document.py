import uuid
from datetime import datetime
from typing import Any
from pgvector.sqlalchemy import Vector
from sqlalchemy import Column
from sqlmodel import Field, SQLModel, Relationship

class Document(SQLModel, table=True):
    __tablename__ = "documents"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    nome: str
    data_upload: datetime = Field(default_factory=datetime.utcnow)
    school_id: uuid.UUID | None = Field(default=None, foreign_key="schools.id", nullable=True)

    chunks: list["DocumentChunk"] = Relationship(
        back_populates="document",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )

class DocumentChunk(SQLModel, table=True):
    __tablename__ = "document_chunks"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    document_id: uuid.UUID = Field(foreign_key="documents.id")
    conteudo_texto: str
    embedding: Any | None = Field(sa_column=Column(Vector(3072)))

    document: Document = Relationship(back_populates="chunks")
