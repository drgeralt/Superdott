from dataclasses import dataclass
from sqlalchemy import text
from src.rag.embedder import embed_query


@dataclass
class RetrievedChunk:
    id: int
    content: str
    source: str
    similarity: float


def retrieve(
    question: str,
    top_k: int = 5,
    similarity_threshold: float = 0.5,
) -> list[RetrievedChunk]:
    from src.core.database import get_session
    from sqlmodel import Session

    query_vector = embed_query(question)
    vector_str = "[" + ",".join(str(v) for v in query_vector) + "]"

    sql = text("""
        SELECT
            id,
            content,
            source,
            1 - (embedding <=> :query_vector::vector) AS similarity
        FROM knowledge_base
        WHERE 1 - (embedding <=> :query_vector::vector) >= :threshold
        ORDER BY embedding <=> :query_vector::vector
        LIMIT :top_k;
    """)

    from src.core.database import engine
    with Session(engine) as session:
        rows = session.execute(
            sql,
            {
                "query_vector": vector_str,
                "threshold": similarity_threshold,
                "top_k": top_k,
            },
        ).fetchall()

    return [
        RetrievedChunk(
            id=row.id,
            content=row.content,
            source=row.source,
            similarity=round(float(row.similarity), 4),
        )
        for row in rows
    ]