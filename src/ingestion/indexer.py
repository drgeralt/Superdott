import asyncio
import time
import uuid
from pathlib import Path

from sqlmodel.ext.asyncio.session import AsyncSession

from src.core.database import engine
from src.ingestion.loader import load_documents
from src.models.knowledge_base import KnowledgeBase
from src.rag.embedder import embed_document

BATCH_SIZE = 1
RATE_LIMIT_DELAY = 3.0


async def index_documents(docs_dir: str | Path, reset: bool = False) -> int:
    print("=" * 50)
    print("Superdott — Ingestão de Documentos (via SQLAlchemy)")
    print("=" * 50)

    async with AsyncSession(engine) as session:
        try:
            # Carrega e faz chunking
            chunks = load_documents(docs_dir)
            if not chunks:
                print("Nenhum chunk gerado. Verifique a pasta.")
                return 0

            # Limpa o banco se solicitado
            if reset:
                print("Limpando knowledge_base...")
                await session.exec("DELETE FROM knowledge_base")
                await session.commit()
                print("Banco limpo.")

            indexed = 0
            failed = 0

            for i, chunk in enumerate(chunks):
                print(
                    f"[{i + 1}/{len(chunks)}] Vetorizando chunk #{chunk.chunk_index} de {chunk.source}"
                )

                try:
                    embedding = embed_document(chunk.content)

                    kb_record = KnowledgeBase(
                        id=uuid.uuid4(),
                        content=chunk.content,
                        source=chunk.source,
                        chunk_index=chunk.chunk_index,
                        embedding=embedding,
                    )
                    session.add(kb_record)
                    await session.commit()

                    indexed += 1
                    time.sleep(RATE_LIMIT_DELAY)

                except Exception as e:
                    failed += 1
                    print(f"ERRO no chunk {i + 1}: {e}")
                    await session.rollback()
                    continue

            print("=" * 50)
            print(f"✓ Indexados: {indexed}")
            print(f"✗ Falhas:    {failed}")
            print("=" * 50)
            return indexed

        except Exception as e:
            print(f"Erro ao conectar ao banco: {e}")
            raise


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument("--docs-dir", default="docs/knowledge")
    parser.add_argument("--reset", action="store_true")
    args = parser.parse_args()

    # Roda o loop assíncrono
    asyncio.run(index_documents(docs_dir=args.docs_dir, reset=args.reset))
