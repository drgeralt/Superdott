import logging
import uuid

from fastapi.concurrency import run_in_threadpool
from google import genai
from sqlmodel import Session

from src.core.config import settings
from src.models.knowledge_base import KnowledgeBase

from .pdf_parser import chunk_text, extract_text_from_pdf

logger = logging.getLogger(__name__)


client = genai.Client(api_key=settings.GEMINI_API_KEY)


class IngestionService:
    def __init__(self, db: Session):
        self.db = db

    async def process_document(self, file_bytes: bytes, filename: str) -> int:
        """
        Orquestra o pipeline de ingestão
        Garante Atomicidade (ACID) - Salva todos os chunks ou nenhum.
        """

        full_text = await run_in_threadpool(extract_text_from_pdf, file_bytes)

        if not full_text:
            raise ValueError("O documento está vazio ou não contém texto legível.")

        chunks = await run_in_threadpool(
            chunk_text, full_text, chunk_size=1000, overlap=200
        )

        db_records = []
        try:
            for i, chunk in enumerate(chunks):
                response = await run_in_threadpool(
                    client.models.embed_content,
                    model="gemini-embedding-001",
                    contents=chunk,
                )

                def extract_floats(obj):
                    if hasattr(obj, "values"):
                        yield from extract_floats(obj.values)
                    elif isinstance(obj, list):
                        for item in obj:
                            yield from extract_floats(item)
                    elif isinstance(obj, (float, int)):
                        yield float(obj)

                # Achata qualquer estrutura que a SDK retornar
                embedding_vector = list(extract_floats(response.embeddings))

                # Trava de segurança para garantir o tamanho antes de bater no banco
                if len(embedding_vector) != 3072:
                    raise ValueError(
                        f"O modelo gerou um vetor de {len(embedding_vector)} posições,\
                            mas o banco exige 3072."
                    )

                kb_record = KnowledgeBase(
                    id=uuid.uuid4(),
                    content=chunk,
                    embedding=embedding_vector,
                    source=filename,
                    chunk_index=i,
                    metadata_={"total_chunks": len(chunks)},
                )
                db_records.append(kb_record)

            self.db.add_all(db_records)
            await self.db.commit()

            logger.info(
                f"Sucesso: {len(chunks)} chunks ingeridos do ficheiro {filename}"
            )
            return len(chunks)

        except Exception as e:
            await self.db.rollback()
            logger.error(
                f"Erro na ingestão do documento {filename}. Rollback executado. \
                    Causa: {str(e)}"
            )
            raise RuntimeError(f"Falha na vetorização/persistência: {str(e)}") from e
