import logging
import uuid
import time
import asyncio

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
            # Helper recursivo robusto para extrair floats de respostas do SDK (Pydantic, dict ou list)
            def extract_floats(obj):
                if hasattr(obj, "values"):
                    yield from extract_floats(obj.values)
                elif isinstance(obj, dict):
                    for value in obj.values():
                        yield from extract_floats(value)
                elif isinstance(obj, list):
                    for item in obj:
                        yield from extract_floats(item)
                elif isinstance(obj, (float, int)):
                    yield float(obj)

            # Loteamentos (Batching) de 100 com delay para respeitar o limite do plano gratuito do Gemini
            BATCH_SIZE = 100
            for start_idx in range(0, len(chunks), BATCH_SIZE):
                # Se for a partir do segundo lote, dorme para evitar 429
                if start_idx > 0:
                    logger.info("Respeitando limite de cota da API. Aguardando 60 segundos antes de enviar o próximo lote...")
                    await asyncio.sleep(60)

                batch_chunks = chunks[start_idx : start_idx + BATCH_SIZE]
                response = await run_in_threadpool(
                    client.models.embed_content,
                    model="gemini-embedding-001",
                    contents=batch_chunks,
                )

                for i, emb in enumerate(response.embeddings):
                    chunk_index = start_idx + i
                    chunk = batch_chunks[i]
                    embedding_vector = list(extract_floats(emb))
                    if len(embedding_vector) < 3072:
                        embedding_vector += [0.0] * (3072 - len(embedding_vector))
                    elif len(embedding_vector) > 3072:
                        embedding_vector = embedding_vector[:3072]

                    kb_record = KnowledgeBase(
                        id=uuid.uuid4(),
                        content=chunk,
                        embedding=embedding_vector,
                        source=filename,
                        chunk_index=chunk_index,
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
                f"Erro na ingestão do documento {filename}. Rollback executado. Causa: {str(e)}"
            )
            raise RuntimeError(f"Falha na vetorização/persistência: {str(e)}") from e

    async def process_admin_document(self, file_bytes: bytes, filename: str, school_id: uuid.UUID | None = None):
        """
        Orquestra o pipeline de ingestão para tabelas Document e DocumentChunk
        Garante Atomicidade (ACID) - Salva o documento e todos os chunks ou nenhum.
        """
        from src.models.document import Document, DocumentChunk

        full_text = await run_in_threadpool(extract_text_from_pdf, file_bytes)

        if not full_text:
            raise ValueError("O documento está vazio ou não contém texto legível.")

        chunks = await run_in_threadpool(
            chunk_text, full_text, chunk_size=1000, overlap=200
        )

        document = Document(nome=filename, school_id=school_id)
        self.db.add(document)
        await self.db.flush()

        db_records = []
        try:
            # Helper recursivo robusto para extrair floats de respostas do SDK (Pydantic, dict ou list)
            def extract_floats(obj):
                if hasattr(obj, "values"):
                    yield from extract_floats(obj.values)
                elif isinstance(obj, dict):
                    for value in obj.values():
                        yield from extract_floats(value)
                elif isinstance(obj, list):
                    for item in obj:
                        yield from extract_floats(item)
                elif isinstance(obj, (float, int)):
                    yield float(obj)

            # Loteamentos (Batching) de 100 com delay para respeitar o limite do plano gratuito do Gemini
            BATCH_SIZE = 100
            for start_idx in range(0, len(chunks), BATCH_SIZE):
                if start_idx > 0:
                    logger.info("Respeitando limite de cota da API. Aguardando 60 segundos antes de enviar o próximo lote...")
                    await asyncio.sleep(60)

                batch_chunks = chunks[start_idx : start_idx + BATCH_SIZE]
                response = await run_in_threadpool(
                    client.models.embed_content,
                    model="gemini-embedding-001",
                    contents=batch_chunks,
                )

                for i, emb in enumerate(response.embeddings):
                    chunk = batch_chunks[i]
                    embedding_vector = list(extract_floats(emb))
                    if len(embedding_vector) < 3072:
                        embedding_vector += [0.0] * (3072 - len(embedding_vector))
                    elif len(embedding_vector) > 3072:
                        embedding_vector = embedding_vector[:3072]

                    chunk_record = DocumentChunk(
                        id=uuid.uuid4(),
                        document_id=document.id,
                        conteudo_texto=chunk,
                        embedding=embedding_vector,
                    )
                    db_records.append(chunk_record)

            self.db.add_all(db_records)
            await self.db.commit()

            logger.info(
                f"Sucesso: {len(chunks)} chunks ingeridos para o documento {filename}"
            )
            return document, len(chunks)

        except Exception as e:
            await self.db.rollback()
            logger.error(
                f"Erro na ingestão do documento {filename}. Rollback executado. Causa: {str(e)}"
            )
            import traceback
            try:
                with open("/app/backend/error_trace.txt", "w") as f:
                    traceback.print_exc(file=f)
            except Exception:
                pass
            raise RuntimeError(f"Falha na vetorização/persistência: {str(e)}") from e

    async def process_student_document(self, file_bytes: bytes, filename: str, student_document_id: uuid.UUID) -> int:
        """
        Orquestra o pipeline de ingestão de documentos de alunos (laudos, portfólios, etc.)
        Suporta PDF, DOCX e TXT.
        """
        import io
        import zipfile
        import xml.etree.ElementTree as ET
        from src.models.student_document import StudentDocumentChunk

        filename_lower = filename.lower()
        if filename_lower.endswith(".pdf"):
            full_text = await run_in_threadpool(extract_text_from_pdf, file_bytes)
        elif filename_lower.endswith(".docx"):
            try:
                def _extract_docx():
                    with io.BytesIO(file_bytes) as docx_file:
                        with zipfile.ZipFile(docx_file) as zip_ref:
                            xml_content = zip_ref.read("word/document.xml")
                            tree = ET.fromstring(xml_content)
                            ns = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
                            paragraphs = []
                            for p in tree.findall(".//w:p", ns):
                                p_text = "".join(t.text for t in p.findall(".//w:t", ns) if t.text)
                                if p_text:
                                    paragraphs.append(p_text)
                            return "\n".join(paragraphs)
                full_text = await run_in_threadpool(_extract_docx)
            except Exception as e:
                logger.error(f"Falha ao ler arquivo DOCX {filename}: {e}")
                raise ValueError(f"Falha ao ler arquivo DOCX: {e}")
        else:
            try:
                full_text = file_bytes.decode("utf-8", errors="ignore")
            except Exception as e:
                logger.error(f"Falha ao ler arquivo de texto {filename}: {e}")
                raise ValueError(f"Falha ao ler arquivo de texto: {e}")

        if not full_text or not full_text.strip():
            raise ValueError("O documento está vazio ou não contém texto legível.")

        chunks = await run_in_threadpool(
            chunk_text, full_text, chunk_size=1000, overlap=200
        )

        db_records = []
        try:
            def extract_floats(obj):
                if hasattr(obj, "values"):
                    yield from extract_floats(obj.values)
                elif isinstance(obj, dict):
                    for value in obj.values():
                        yield from extract_floats(value)
                elif isinstance(obj, list):
                    for item in obj:
                        yield from extract_floats(item)
                elif isinstance(obj, (float, int)):
                    yield float(obj)

            BATCH_SIZE = 100
            for start_idx in range(0, len(chunks), BATCH_SIZE):
                if start_idx > 0:
                    logger.info("Respeitando limite de cota da API. Aguardando 60 segundos antes de enviar o próximo lote...")
                    await asyncio.sleep(60)

                batch_chunks = chunks[start_idx : start_idx + BATCH_SIZE]
                response = await run_in_threadpool(
                    client.models.embed_content,
                    model="gemini-embedding-001",
                    contents=batch_chunks,
                )

                for i, emb in enumerate(response.embeddings):
                    chunk = batch_chunks[i]
                    embedding_vector = list(extract_floats(emb))
                    if len(embedding_vector) < 3072:
                        embedding_vector += [0.0] * (3072 - len(embedding_vector))
                    elif len(embedding_vector) > 3072:
                        embedding_vector = embedding_vector[:3072]

                    chunk_record = StudentDocumentChunk(
                        id=uuid.uuid4(),
                        student_document_id=student_document_id,
                        conteudo_texto=chunk,
                        embedding=embedding_vector,
                    )
                    db_records.append(chunk_record)

            self.db.add_all(db_records)
            await self.db.commit()

            logger.info(
                f"Sucesso: {len(chunks)} chunks ingeridos para o documento de aluno {filename}"
            )
            return len(chunks)

        except Exception as e:
            await self.db.rollback()
            logger.error(
                f"Erro na ingestão do documento {filename}. Rollback executado. Causa: {str(e)}"
            )
            raise RuntimeError(f"Falha na vetorização/persistência: {str(e)}") from e
