from dataclasses import dataclass
from uuid import UUID
import asyncpg

from src.core.config import settings
from src.rag.embedder import embed_query


@dataclass
class RetrievedChunk:
    id: str
    content: str
    source: str
    similarity: float


async def retrieve(
    question: str,
    top_k: int = 5,
    similarity_threshold: float = 0.5,
    school_id: UUID | None = None,
    student_id: UUID | None = None,
    user_role: str | None = None,
):
    query_vector = embed_query(question)
    vector_str = "[" + ",".join(str(x) for x in query_vector) + "]"

    conn = await asyncpg.connect(settings.DATABASE_URL)
    is_parent = (user_role == "Pai")

    try:
        query = """
        SELECT id::text, content, source, similarity FROM (
            SELECT id::text, content, source,
                1 - (embedding <=> $1::vector) AS similarity
            FROM knowledge_base
            UNION ALL
            SELECT dc.id::text, dc.conteudo_texto AS content, d.nome AS source,
                1 - (dc.embedding <=> $1::vector) AS similarity
            FROM document_chunks dc
            JOIN documents d ON dc.document_id = d.id
            WHERE d.school_id IS NULL OR ($4::uuid IS NOT NULL AND d.school_id = $4::uuid)
            UNION ALL
            SELECT sdc.id::text, sdc.conteudo_texto AS content, sd.filename AS source,
                1 - (sdc.embedding <=> $1::vector) AS similarity
            FROM student_document_chunks sdc
            JOIN student_documents sd ON sdc.student_document_id = sd.id
            WHERE ($5::uuid IS NOT NULL AND sd.student_id = $5::uuid) AND (sd.shared_with_school = TRUE OR $6::boolean = TRUE)
        ) AS unified_chunks
        WHERE similarity >= $2
        ORDER BY similarity DESC
        LIMIT $3
        """
        
        rows = await conn.fetch(
            query,
            vector_str,
            similarity_threshold,
            top_k,
            school_id,
            student_id,
            is_parent,
        )

        return [
            RetrievedChunk(
                id=row["id"],
                content=row["content"],
                source=row["source"],
                similarity=round(float(row["similarity"]), 4),
            )
            for row in rows
        ]
    finally:
        await conn.close()
