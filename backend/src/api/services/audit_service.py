import logging
import uuid
from typing import Optional
from sqlmodel.ext.asyncio.session import AsyncSession
from src.models.audit_log import AuditAction, AuditLog

logger = logging.getLogger(__name__)

async def create_audit_log(
    session: AsyncSession,
    user_id: uuid.UUID,
    action: AuditAction,
    student_id: Optional[uuid.UUID] = None,
    details: Optional[dict] = None,
) -> None:
    """
    Persiste um registro de auditoria de forma assíncrona.
    Chamado via BackgroundTasks — não bloqueia a resposta HTTP.
    Erros são silenciosos para não derrubar a operação principal.
    """
    try:
        log_entry = AuditLog(
            user_id=user_id,
            action=action,
            target_student_id=student_id,
            details=details,
        )
        session.add(log_entry)
        await session.commit()
        logger.info(
            "audit_log.created action=%s user=%s student=%s",
            action, user_id, student_id,
        )
    except Exception as exc:
        logger.error("audit_log.failed: %s", exc, exc_info=True)
        await session.rollback()
