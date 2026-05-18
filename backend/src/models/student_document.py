from datetime import datetime
from uuid import UUID, uuid4
from typing import Any
from pgvector.sqlalchemy import Vector
from sqlalchemy import Column
from sqlmodel import Field, SQLModel, Relationship

class StudentDocument(SQLModel, table=True):
    __tablename__ = "student_documents"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    student_id: UUID = Field(foreign_key="students.id")
    parent_id: int = Field(foreign_key="user.id")
    filename: str
    file_path: str
    shared_with_school: bool = Field(default=False)
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)

    # Optional ORM relationships (if needed elsewhere)
    student: "Student" = Relationship(back_populates="documents")
    parent: "User" = Relationship(back_populates="uploaded_documents")
    
    chunks: list["StudentDocumentChunk"] = Relationship(
        back_populates="student_document",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )

class StudentDocumentChunk(SQLModel, table=True):
    __tablename__ = "student_document_chunks"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    student_document_id: UUID = Field(foreign_key="student_documents.id")
    conteudo_texto: str
    embedding: Any | None = Field(sa_column=Column(Vector(3072)))

    student_document: StudentDocument = Relationship(back_populates="chunks")
