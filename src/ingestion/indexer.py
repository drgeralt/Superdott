import asyncio
import time
from pathlib import Path

from src.ingestion.loader import load_documents
from src.rag.embedder import embed_document

BATCH_SIZE = 1
RATE_LIMIT_DELAY = 3.0


async def index_documents(docs_dir: str | Path, reset: bool = False) -> int:
    print("=" * 50)
    print("Superdott — Ingestão de Documentos (via Prisma)")
    print("=" * 50)

    # 1. Inicializa o Prisma
    db = Prisma()
    await db.connect()

    try:
        # Carrega e faz chunking
        chunks = load_documents(docs_dir)
        if not chunks:
            print("Nenhum chunk gerado. Verifique a pasta.")
            return 0

        # Limpa o banco se solicitado
        if reset:
            print("Limpando knowledge_base...")
            await db.execute_raw("TRUNCATE TABLE knowledge_base RESTART IDENTITY;")
            print("Banco limpo.")

        indexed = 0
        failed = 0

        for i, chunk in enumerate(chunks):
            print(
                f"[{i + 1}/{len(chunks)}] Vetorizando chunk #{chunk.chunk_index} de \
                {chunk.source}'"
            )

            try:
                embedding = embed_document(chunk.content)

                # Como 'embedding' é um tipo Unsupported(vector) no Prisma,
                # usamos execute_raw para garantir que o PG localize o tipo correto
                await db.execute_raw(
                    "INSERT INTO knowledge_base (id, content, source, chunk_index, \
                        embedding, created_at) "
                    "VALUES (gen_random_uuid(), $1, $2, $3, $4::vector, now())",
                    chunk.content,
                    chunk.source,
                    chunk.chunk_index,  # Adicionado
                    str(embedding),
                )

                indexed += 1
                time.sleep(RATE_LIMIT_DELAY)

            except Exception as e:
                failed += 1
                print(f"ERRO no chunk {i + 1}: {e}")
                continue

        print("=" * 50)
        print(f"✓ Indexados: {indexed}")
        print(f"✗ Falhas:    {failed}")
        print("=" * 50)
        return indexed

    finally:
        await db.disconnect()


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument("--docs-dir", default="docs/knowledge")
    parser.add_argument("--reset", action="store_true")
    args = parser.parse_args()

    # Roda o loop assíncrono
    asyncio.run(index_documents(docs_dir=args.docs_dir, reset=args.reset))
