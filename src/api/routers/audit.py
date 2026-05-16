import uuid
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from src.core.database import get_session
from src.models.audit_log import AuditAction, AuditLog

router = APIRouter(prefix="/api/audit-logs", tags=["Audit"])


@router.get("", response_model=list[AuditLog])
async def list_audit_logs(
    action: Optional[AuditAction] = Query(default=None),
    student_id: Optional[uuid.UUID] = Query(default=None),
    limit: int = Query(default=50, le=200),
    offset: int = Query(default=0),
    session: AsyncSession = Depends(get_session),
    # _: None = Depends(require_role(UserRole.SUPER_ADMIN)),  ← ativar com TASK-014
):
    query = select(AuditLog)

    if action:
        query = query.where(AuditLog.action == action)
    if student_id:
        query = query.where(AuditLog.target_student_id == student_id)

    query = query.order_by(AuditLog.created_at.desc()).offset(offset).limit(limit)
    result = await session.exec(query)
    return result.all()
