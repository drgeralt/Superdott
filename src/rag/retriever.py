from dataclasses import dataclass

import asyncpg

from src.core.config import settings
from src.rag.embedder import embed_query


@dataclass
class RetrievedChunk:
    id: str
    content: str
    source: str
    similarity: float


async def retrieve(question: str, top_k: int = 5, similarity_threshold: float = 0.5):
    query_vector = embed_query(question)
    vector_str = "[" + ",".join(str(x) for x in query_vector) + "]"

    conn = await asyncpg.connect(settings.DATABASE_URL)

    try:
        rows = await conn.fetch(
            """
            SELECT id::text, content, source,
                1 - (embedding <=> $1::vector) AS similarity
            FROM knowledge_base
            WHERE 1 - (embedding <=> $1::vector) >= $2
            ORDER BY embedding <=> $1::vector LIMIT $3
            """,
            vector_str,
            similarity_threshold,
            top_k,
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
