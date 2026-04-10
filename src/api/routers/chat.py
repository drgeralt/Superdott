import logging

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from src.rag.pipeline import ask, ask_stream

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/chat", tags=["Chat AI"])


class ChatRequest(BaseModel):
    message: str
    student_context: dict | None = None


@router.post("")
async def chat_pedagogico(payload: ChatRequest):
    try:
        rag_response = await ask(
            payload.message, student_context=payload.student_context
        )
        return {"text": rag_response.answer, "sources": rag_response.sources}
    except Exception as e:
        logger.error(f"Erro no Pipeline RAG: {e}")
        return {
            "text": "Tive um problema ao consultar minha base de documentos.",
            "detail": str(e),
            "sources": [],
        }


@router.post("/stream")
async def chat_stream(payload: ChatRequest):
    # Fallback para contexto padrão se o frontend não enviar
    ctx = payload.student_context or {
        "name": "Aluno Padrão",
        "scores": {"intelectual": 0, "criatividade": 0, "liderança": 0},
    }

    async def event_generator():
        async for token in ask_stream(payload.message, student_context=ctx):
            yield token

    return StreamingResponse(event_generator(), media_type="text/plain")
