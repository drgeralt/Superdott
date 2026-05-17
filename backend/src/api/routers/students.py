import uuid
import logging
from fastapi import APIRouter, Depends, status, HTTPException
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from src.core.database import get_session
from src.models.student import Student
from src.models.user import User, UserRole
from src.models.links import ParentStudentLink, SchoolStudentLink
from src.api.services.audit_service import create_audit_log, AuditAction
from src.api.deps import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/students", tags=["Students"])


@router.get("", response_model=list[Student])
async def get_students(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    query = select(Student)
    if current_user.role == UserRole.Pai:
        query = query.join(ParentStudentLink).where(ParentStudentLink.parent_id == current_user.id)
    result = await session.exec(query)
    return result.all()


@router.post("/{student_id}/link", status_code=status.HTTP_200_OK)
async def link_student(
    student_id: uuid.UUID,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    result = await session.exec(select(Student).where(Student.id == student_id))
    student = result.first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Aluno não encontrado.")

    if current_user.role == UserRole.Pai:
        existing = await session.exec(select(ParentStudentLink).where(
            ParentStudentLink.parent_id == current_user.id,
            ParentStudentLink.student_id == student_id
        ))
        if not existing.first():
            link = ParentStudentLink(parent_id=current_user.id, student_id=student_id)
            session.add(link)

    await session.commit()

    await create_audit_log(
        session=session,
        user_id=uuid.UUID(int=current_user.id),
        action=AuditAction.STUDENT_LINKED,
        student_id=student_id,
    )

    return {"ok": True}


@router.delete("/{student_id}/link", status_code=status.HTTP_200_OK)
async def unlink_student(
    student_id: uuid.UUID,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    result = await session.exec(select(Student).where(Student.id == student_id))
    if not result.first():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Aluno não encontrado.")

    if current_user.role == UserRole.Pai:
        existing = await session.exec(select(ParentStudentLink).where(
            ParentStudentLink.parent_id == current_user.id,
            ParentStudentLink.student_id == student_id
        ))
        link = existing.first()
        if link:
            await session.delete(link)
    else:
        # Simplificação para Escola desvinculando (remove todos os SchoolStudentLink)
        existing = await session.exec(select(SchoolStudentLink).where(
            SchoolStudentLink.student_id == student_id
        ))
        for link in existing.all():
            await session.delete(link)

    await session.commit()

    await create_audit_log(
        session=session,
        user_id=uuid.UUID(int=current_user.id),
        action=AuditAction.STUDENT_UNLINKED,
        student_id=student_id,
    )

    return {"ok": True}
