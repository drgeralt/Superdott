import logging
from uuid import UUID

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from src.core.database import get_session
from src.models.chat_message import ChatMessage
from src.models.chat_session import ChatSession
from src.rag.pipeline import ask, ask_stream

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/chat", tags=["Chat AI"])

HISTORY_WINDOW = 5  # Número de mensagens anteriores a considerar no contexto


class ChatRequest(BaseModel):
    message: str
    student_context: dict | None = None
    student_id: UUID


async def _get_or_create_session(
    student_id: UUID, session: AsyncSession
) -> ChatSession:
    """Busca sessão ativa ou cria uma nova sessão."""
    result = await session.exec(
        select(ChatSession).where(ChatSession.student_id == student_id)
    )
    chat_session = result.first()
    if not chat_session:
        chat_session = ChatSession(student_id=student_id)
        session.add(chat_session)
        await session.commit()
        await session.refresh(chat_session)
    return chat_session


async def _get_recent_history(session_id: UUID, session: AsyncSession) -> list[dict]:
    """Retorna  as últimas mensagens (HISTORY_WINDOW) do chat para contexto."""
    result = await session.exec(
        select(ChatMessage)
        .where(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at.desc())
        .limit(
            HISTORY_WINDOW * 2
        )  # Considera mensagens do aluno e respostas do sistema
    )
    messages = list(reversed(result.all()))
    return [{"role": m.role, "content": m.content} for m in messages]


@router.post("")
async def chat_pedagogico(
    payload: ChatRequest,
    session: AsyncSession = Depends(get_session),
):
    try:
        chat_session = await _get_or_create_session(payload.student_id, session)
        history = await _get_recent_history(chat_session.id, session)

        # Adiciona a nova mensagem ao histórico
        user_msg = ChatMessage(
            session_id=chat_session.id,
            role="user",
            content=payload.message,
        )
        session.add(user_msg)
        await session.commit()

        # chama ia com historico
        rag_response = await ask(
            payload.message,
            student_context=payload.student_context,
            history=history,
        )

        assistant_msg = ChatMessage(
            session_id=chat_session.id,
            role="assistant",
            content=rag_response.answer,
        )
        session.add(assistant_msg)
        await session.commit()

        return {"text": rag_response.answer, "sources": rag_response.sources}
    except Exception as e:
        logger.error(f"Erro no Pipeline RAG: {e}")
        return {
            "text": "Tive um problema ao consultar minha base de documentos.",
            "detail": str(e),
            "sources": [],
        }


@router.post("/stream")
async def chat_stream(
    payload: ChatRequest,
    session: AsyncSession = Depends(get_session),
):

    # Fallback para contexto padrão se o frontend não enviar
    ctx = payload.student_context or {
        "name": "Aluno Padrão",
        "scores": {"intelectual": 0, "criatividade": 0, "liderança": 0},
    }

    chat_session = await _get_or_create_session(payload.student_id, session)
    history = await _get_recent_history(chat_session.id, session)

    # grava msg usuario antes do stream
    user_msg = ChatMessage(
        session_id=chat_session.id,
        role="user",
        content=payload.message,
    )
    session.add(user_msg)
    await session.commit()

    accumulated: list[str] = []

    async def event_generator():
        try:
            async for token in ask_stream(
                payload.message, student_context=ctx, history=history
            ):
                accumulated.append(token)
                yield token
        finally:
            # grava resposta completa após o stream
            if accumulated:
                full_response = "".join(accumulated)
                assistant_msg = ChatMessage(
                    session_id=chat_session.id,
                    role="assistant",
                    content=full_response,
                )
                session.add(assistant_msg)
                await session.commit()

    return StreamingResponse(event_generator(), media_type="text/plain")


@router.get("/history/{student_id}", response_model=None)
async def get_chat_history(
    student_id: UUID,
    session: AsyncSession = Depends(get_session),
):
    """Retorna o histórico de mensagens de um aluno para o frontend reconstruir o chat."""
    result = await session.exec(
        select(ChatSession).where(ChatSession.student_id == student_id)
    )
    chat_session = result.first()
    if not chat_session:
        return {"messages": []}

    msgs_result = await session.exec(
        select(ChatMessage)
        .where(ChatMessage.session_id == chat_session.id)
        .order_by(ChatMessage.created_at.asc())
    )
    messages = msgs_result.all()
    return {
        "session_id": str(chat_session.id),
        "messages": [
            {"role": m.role, "content": m.content, "created_at": m.created_at}
            for m in messages
        ],
    }
