from dataclasses import dataclass

from src.generated.prisma import Prisma
from src.rag.embedder import embed_query


@dataclass
class RetrievedChunk:
    id: str
    content: str
    source: str
    similarity: float


async def retrieve(question: str, top_k: int = 5, similarity_threshold: float = 0.5):
    db = Prisma()
    await db.connect()

    try:
        query_vector = embed_query(question)
        # SQL puro via Prisma para busca vetorial
        sql = """
            SELECT id, content, source, 1 - (embedding <=> $1::vector) AS similarity
            FROM knowledge_base
            WHERE 1 - (embedding <=> $1::vector) >= $2
            ORDER BY embedding <=> $1::vector LIMIT $3
        """
        rows = await db.query_raw(sql, str(query_vector), similarity_threshold, top_k)

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
        await db.disconnect()
