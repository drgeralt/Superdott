import logging
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from src.core.database import get_session
from src.models.chat_message import ChatMessage
from src.models.chat_session import ChatSession
from src.models.user import User, UserRole
from src.models.student import Student
from src.models.links import ParentStudentLink, SchoolStudentLink
from src.api.deps import get_current_user
from src.rag.pipeline import ask, ask_stream

from src.api.services.anonymization_service import AnonymizationService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/chat", tags=["Chat AI"])

HISTORY_WINDOW = 5

class ChatRequest(BaseModel):
    message: str
    student_context: dict | None = None
    student_id: UUID

async def _check_student_access(student_id: UUID, current_user: User, session: AsyncSession):
    if current_user.role == UserRole.Pai:
        result = await session.exec(select(ParentStudentLink).where(
            ParentStudentLink.parent_id == current_user.id,
            ParentStudentLink.student_id == student_id
        ))
        if not result.first():
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acesso negado ao aluno.")

async def _get_or_create_session(
    student_id: UUID, current_user: User, session: AsyncSession
) -> ChatSession:
    await _check_student_access(student_id, current_user, session)
    
    result = await session.exec(
        select(ChatSession).where(
            ChatSession.student_id == student_id,
            ChatSession.user_id == current_user.id
        )
    )
    chat_session = result.first()
    if not chat_session:
        chat_session = ChatSession(student_id=student_id, user_id=current_user.id)
        session.add(chat_session)
        await session.commit()
        await session.refresh(chat_session)
    return chat_session

async def _get_recent_history(session_id: UUID, session: AsyncSession) -> list[dict]:
    result = await session.exec(
        select(ChatMessage)
        .where(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at.desc())
        .limit(HISTORY_WINDOW * 2)
    )
    messages = list(reversed(result.all()))
    return [{"role": m.role, "content": m.content} for m in messages]

async def _stream_deanonymizer(stream, first_name: str):
    buffer = ""
    target = "[ALUNO]"
    target_len = len(target)
    
    async for chunk in stream:
        buffer += chunk
        while True:
            idx = buffer.find(target)
            if idx != -1:
                yield buffer[:idx] + first_name
                buffer = buffer[idx + target_len:]
                continue
                
            partial_match_len = 0
            for i in range(1, target_len):
                sub = target[:i]
                if buffer.endswith(sub):
                    partial_match_len = i
                    break
            
            if partial_match_len > 0:
                yield buffer[:-partial_match_len]
                buffer = buffer[-partial_match_len:]
            else:
                yield buffer
                buffer = ""
            break
            
    if buffer:
        yield buffer.replace(target, first_name)

@router.post("")
async def chat_pedagogico(
    payload: ChatRequest,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    try:
        # Obter dados do aluno
        student_result = await session.exec(select(Student).where(Student.id == payload.student_id))
        student = student_result.first()
        if not student:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Aluno não encontrado.")

        chat_session = await _get_or_create_session(payload.student_id, current_user, session)
        history = await _get_recent_history(chat_session.id, session)

        # Anonimizar mensagem, contexto e histórico
        msg_anon = AnonymizationService.anonymize(payload.message, student.full_name)
        
        ctx_anon = None
        if payload.student_context:
            import copy
            ctx_anon = copy.deepcopy(payload.student_context)
            if "name" in ctx_anon:
                ctx_anon["name"] = AnonymizationService.anonymize(ctx_anon["name"], student.full_name)
        else:
            ctx_anon = {
                "name": "[ALUNO]",
                "scores": {"intelectual": 0, "criatividade": 0, "liderança": 0},
            }

        history_anon = [
            {
                "role": h["role"],
                "content": AnonymizationService.anonymize(h["content"], student.full_name)
            }
            for h in history
        ]

        # Salvar a mensagem do usuário (real)
        user_msg = ChatMessage(
            session_id=chat_session.id,
            role="user",
            content=payload.message,
        )
        session.add(user_msg)
        await session.commit()

        # Consultar o RAG com dados anonimizados
        rag_response = await ask(
            msg_anon,
            student_context=ctx_anon,
            history=history_anon,
        )

        # Reverter resposta
        real_first_name = student.full_name.split()[0]
        answer_real = AnonymizationService.deanonymize(rag_response.answer, real_first_name)

        # Salvar a resposta da IA (real)
        assistant_msg = ChatMessage(
            session_id=chat_session.id,
            role="assistant",
            content=answer_real,
        )
        session.add(assistant_msg)
        await session.commit()

        return {"text": answer_real, "sources": rag_response.sources}
    except HTTPException:
        raise
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
    current_user: User = Depends(get_current_user)
):
    student_result = await session.exec(select(Student).where(Student.id == payload.student_id))
    student = student_result.first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Aluno não encontrado.")

    chat_session = await _get_or_create_session(payload.student_id, current_user, session)
    history = await _get_recent_history(chat_session.id, session)

    # Anonimizar mensagem, contexto e histórico
    msg_anon = AnonymizationService.anonymize(payload.message, student.full_name)
    
    ctx = payload.student_context or {
        "name": "Aluno Padrão",
        "scores": {"intelectual": 0, "criatividade": 0, "liderança": 0},
    }
    import copy
    ctx_anon = copy.deepcopy(ctx)
    if "name" in ctx_anon:
        ctx_anon["name"] = AnonymizationService.anonymize(ctx_anon["name"], student.full_name)

    history_anon = [
        {
            "role": h["role"],
            "content": AnonymizationService.anonymize(h["content"], student.full_name)
        }
        for h in history
    ]

    # Salvar a mensagem do usuário (real)
    user_msg = ChatMessage(
        session_id=chat_session.id,
        role="user",
        content=payload.message,
    )
    session.add(user_msg)
    await session.commit()

    accumulated: list[str] = []
    real_first_name = student.full_name.split()[0]

    async def event_generator():
        try:
            raw_stream = ask_stream(
                msg_anon, student_context=ctx_anon, history=history_anon
            )
            async for token in _stream_deanonymizer(raw_stream, real_first_name):
                accumulated.append(token)
                yield token
        finally:
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
    current_user: User = Depends(get_current_user)
):
    await _check_student_access(student_id, current_user, session)
    
    result = await session.exec(
        select(ChatSession).where(
            ChatSession.student_id == student_id,
            ChatSession.user_id == current_user.id
        )
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
