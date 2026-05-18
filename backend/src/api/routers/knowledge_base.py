import logging
import uuid
from typing import List
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlmodel import select, func
from sqlmodel.ext.asyncio.session import AsyncSession

from src.core.database import get_session
from src.models.user import User, UserRole
from src.models.document import Document, DocumentChunk
from src.api.deps import require_role
from src.api.services.ingestion_service import IngestionService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/admin/knowledge-base", tags=["KnowledgeBaseAdmin"])

@router.post("/upload", status_code=status.HTTP_200_OK)
async def upload_document(
    file: UploadFile = File(...),
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_role(["SuperAdmin"]))
):
    """
    Recebe um PDF, extrai texto, divide em chunks, gera embeddings
    e salva nas tabelas documents e document_chunks. Exclusivo para SuperAdmins.
    """
    if file.content_type != "application/pdf" or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Formato não suportado. Apenas arquivos PDF são permitidos."
        )

    try:
        file_bytes = await file.read()
        MAX_FILE_SIZE = 10 * 1024 * 1024
        if len(file_bytes) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="O arquivo excede o limite máximo permitido de 10MB."
            )

        service = IngestionService(session)
        document, chunks_count = await service.process_admin_document(file_bytes, file.filename)

        return {
            "success": True,
            "message": "Documento ingerido e vetorizado com sucesso.",
            "id": str(document.id),
            "nome": document.nome,
            "data_upload": document.data_upload.isoformat(),
            "chunks_created": chunks_count
        }

    except ValueError as ve:
        logger.warning(f"Upload falhou para {file.filename}: {str(ve)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve)
        ) from ve
    except RuntimeError as re:
        logger.error(f"Falha na integração para {file.filename}: {str(re)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao processar o documento no motor de inteligência artificial."
        ) from re
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception(f"Erro inesperado no upload de {file.filename}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro inesperado no servidor durante o processamento do arquivo."
        ) from exc


@router.get("", status_code=status.HTTP_200_OK)
async def list_documents(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_role(["SuperAdmin"]))
):
    """
    Lista todos os documentos inseridos na base de conhecimento. Exclusivo para SuperAdmins.
    """
    try:
        # Fetch documents and count how many chunks each has
        documents_res = await session.exec(select(Document).order_by(Document.data_upload.desc()))
        documents = documents_res.all()

        results = []
        for doc in documents:
            # Query count of chunks
            chunks_count_res = await session.exec(
                select(func.count(DocumentChunk.id)).where(DocumentChunk.document_id == doc.id)
            )
            chunks_count = chunks_count_res.first() or 0

            results.append({
                "id": str(doc.id),
                "nome": doc.nome,
                "data_upload": doc.data_upload.isoformat(),
                "chunks_count": chunks_count
            })

        return results
    except Exception as exc:
        logger.exception("Falha ao listar documentos")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno ao listar documentos."
        )


@router.delete("/{document_id}", status_code=status.HTTP_200_OK)
async def delete_document(
    document_id: uuid.UUID,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_role(["SuperAdmin"]))
):
    """
    Remove um documento específico e todos os seus vetores/chunks associados (em cascata).
    """
    try:
        doc = await session.get(Document, document_id)
        if not doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Documento não encontrado."
            )

        # Deleting the document triggers cascading deletes of chunks at SQLAlchemy level
        await session.delete(doc)
        await session.commit()

        return {
            "success": True,
            "message": f"Documento '{doc.nome}' excluído com sucesso da base de conhecimento da IA."
        }
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception(f"Erro ao deletar documento {document_id}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao excluir documento do banco de dados."
        )
