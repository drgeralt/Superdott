import time
from pathlib import Path

from sqlalchemy import text
from sqlmodel import Session

from src.core.database import engine
from src.ingestion.loader import load_documents
from src.rag.embedder import embed_document

BATCH_SIZE = 50
RATE_LIMIT_DELAY = 0.5


def index_documents(docs_dir: str | Path, reset: bool = False) -> int:
    print("=" * 50)
    print("Superdott — Ingestão de Documentos")
    print("=" * 50)

    # Carrega e faz chunking
    chunks = load_documents(docs_dir)

    if not chunks:
        print("Nenhum chunk gerado. Verifique a pasta.")
        return 0

    # Limpa o banco se solicitado
    if reset:
        _reset_knowledge_base()

    # Vetoriza e salva em lotes
    indexed = 0
    failed = 0
    batch = []

    for i, chunk in enumerate(chunks):
        print(
            f"[{i+1}/{len(chunks)}] Vetorizando chunk "
            f"#{chunk.chunk_index} de '{chunk.source}'"
        )

        try:
            embedding = embed_document(chunk.content)

            batch.append({
                "content": chunk.content,
                "source": chunk.source,
                "chunk_index": chunk.chunk_index,
                "embedding": "[" + ",".join(str(v) for v in embedding) + "]",
            })

            if len(batch) >= BATCH_SIZE:
                _insert_batch(batch)
                indexed += len(batch)
                print(f"  → Lote de {len(batch)} chunks salvo.")
                batch = []

            time.sleep(RATE_LIMIT_DELAY)

        except Exception as e:
            failed += 1
            print(f"  ERRO no chunk {i+1}: {e}")
            continue

    # Salva o restante
    if batch:
        _insert_batch(batch)
        indexed += len(batch)

    print("=" * 50)
    print(f"✓ Indexados: {indexed}")
    print(f"✗ Falhas:    {failed}")
    print("=" * 50)

    return indexed


def _insert_batch(batch: list[dict]) -> None:
    sql = text("""
        INSERT INTO knowledge_base (content, source, chunk_index, embedding)
        VALUES (:content, :source, :chunk_index, :embedding::vector)
        ON CONFLICT DO NOTHING;
    """)

    with Session(engine) as session:
        session.execute(sql, batch)
        session.commit()


def _reset_knowledge_base() -> None:
    print("Limpando knowledge_base...")
    with Session(engine) as session:
        session.execute(text("TRUNCATE TABLE knowledge_base RESTART IDENTITY;"))
        session.commit()
    print("Banco limpo.")


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument("--docs-dir", default="docs/knowledge")
    parser.add_argument("--reset", action="store_true")
    args = parser.parse_args()

    index_documents(docs_dir=args.docs_dir, reset=args.reset)
