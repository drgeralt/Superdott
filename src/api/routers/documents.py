import logging

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlmodel import Session

from src.api.services.ingestion_service import IngestionService
from src.core.database import get_session

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/documents", tags=["Documents"])


@router.post("/upload", status_code=status.HTTP_200_OK)
async def upload_document(
    file: UploadFile = File(...), db: Session = Depends(get_session)
):
    """
    Recebe um ficheiro PDF, extrai o texto, converte em embeddings
    e salva na base de dados.
    """
    if file.content_type != "application/pdf" or not file.filename.lower().endswith(
        ".pdf"
    ):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Formato não suportado. Apenas ficheiros PDF são permitidos.",
        )

    try:
        file_bytes = await file.read()

        MAX_FILE_SIZE = 10 * 1024 * 1024
        if len(file_bytes) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="O ficheiro excede o limite máximo permitido de 10MB.",
            )

        service = IngestionService(db)
        total_chunks = await service.process_document(file_bytes, file.filename)

        return {
            "message": "Documento ingerido e vetorizado com sucesso.",
            "filename": file.filename,
            "chunks_created": total_chunks,
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
            detail="Erro ao processar o documento no motor de inteligência artificial.",
        ) from re
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception(f"Erro inesperado no upload de {file.filename}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro inesperado no servidor durante o processamento do ficheiro.",
        ) from exc
