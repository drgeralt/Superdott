import uuid
import logging
from fastapi import APIRouter, Depends, BackgroundTasks, status, HTTPException
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from src.core.database import get_session
from src.models.student import Student
from src.api.services.audit_service import create_audit_log, AuditAction

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/students", tags=["Students"])


@router.get("", response_model=list[Student])
async def get_students(session: AsyncSession = Depends(get_session)):
    result = await session.exec(select(Student))
    return result.all()


@router.post("/{student_id}/link", status_code=status.HTTP_200_OK)
async def link_student(
    student_id: uuid.UUID,
    session: AsyncSession = Depends(get_session),
):
    result = await session.exec(select(Student).where(Student.id == student_id))
    if not result.first():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Aluno não encontrado.")

    acting_user_id = uuid.UUID("00000000-0000-0000-0000-000000000001")

    # Audit direto na sessão da requisição — sem engine separado
    await create_audit_log(
        session=session,
        user_id=acting_user_id,
        action=AuditAction.STUDENT_LINKED,
        student_id=student_id,
    )

    return {"ok": True}


@router.delete("/{student_id}/link", status_code=status.HTTP_200_OK)
async def unlink_student(
    student_id: uuid.UUID,
    session: AsyncSession = Depends(get_session),
):
    result = await session.exec(select(Student).where(Student.id == student_id))
    if not result.first():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Aluno não encontrado.")

    acting_user_id = uuid.UUID("00000000-0000-0000-0000-000000000001")

    await create_audit_log(
        session=session,
        user_id=acting_user_id,
        action=AuditAction.STUDENT_UNLINKED,
        student_id=student_id,
    )

    return {"ok": True}
