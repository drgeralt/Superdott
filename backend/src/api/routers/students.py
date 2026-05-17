import uuid
import logging
from fastapi import APIRouter, Depends, status, HTTPException, Response
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from datetime import datetime, timezone
from typing import Optional

from src.core.database import get_session
from src.models.student import Student
from src.models.user import User, UserRole
from src.models.links import ParentStudentLink, SchoolStudentLink
from src.api.services.audit_service import create_audit_log, AuditAction
from src.api.services.pdi_service import PdiService
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


@router.delete("/{student_id}/unlink", status_code=status.HTTP_200_OK)
async def unlink_student(
    student_id: uuid.UUID,
    school_id: uuid.UUID, 
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    student = await session.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Aluno não encontrado.")

    if current_user.role == UserRole.Pai:
        parent_link = await session.exec(
            select(ParentStudentLink).where(
                ParentStudentLink.parent_id == current_user.id,
                ParentStudentLink.student_id == student_id
            )
        )
        if not parent_link.first():
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acesso negado a este aluno.")

    school_link = await session.exec(
        select(SchoolStudentLink).where(
            SchoolStudentLink.student_id == student_id,
            SchoolStudentLink.school_id == school_id
        )
    )
    link = school_link.first()

    if not link:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vínculo com a instituição não existe.")

    await session.delete(link)
    await session.commit()

    await create_audit_log(
        session=session,
        user_id=uuid.UUID(int=current_user.id),
        action=AuditAction.STUDENT_UNLINKED,
        student_id=student_id,
        details={"school_id": str(school_id)}
    )

    return {"ok": True}


@router.get("/{student_id}/export-pdi")
async def export_student_pdi(
    student_id: uuid.UUID,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    include_curriculum: bool = True,
    include_methodologies: bool = True,
    omit_informal: bool = True,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    # 1. Access control validation
    if current_user.role == UserRole.Pai:
        result = await session.exec(select(ParentStudentLink).where(
            ParentStudentLink.parent_id == current_user.id,
            ParentStudentLink.student_id == student_id
        ))
        if not result.first():
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acesso negado ao aluno.")
    
    # 2. Parse dates
    start_dt = None
    end_dt = None
    if start_date:
        try:
            start_dt = datetime.strptime(start_date, "%Y-%m-%d").replace(tzinfo=timezone.utc if hasattr(datetime, 'timezone') else None)
        except ValueError:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Formato de data inicial inválido. Use YYYY-MM-DD.")
    if end_date:
        try:
            end_dt = datetime.strptime(end_date, "%Y-%m-%d").replace(hour=23, minute=59, second=59, tzinfo=timezone.utc if hasattr(datetime, 'timezone') else None)
        except ValueError:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Formato de data final inválido. Use YYYY-MM-DD.")

    try:
        pdf_bytes = await PdiService.export_and_cache_pdi(
            session=session,
            student_id=student_id,
            user_id=current_user.id,
            emissor_name=current_user.email,
            start_date=start_dt,
            end_date=end_dt,
            include_curriculum=include_curriculum,
            include_methodologies=include_methodologies,
            omit_informal=omit_informal
        )
        
        # Retrieve student to give an elegant filename
        student_res = await session.exec(select(Student).where(Student.id == student_id))
        student = student_res.one()
        sanitized_name = student.full_name.lower().replace(" ", "_")
        filename = f"pdi_{sanitized_name}.pdf"
        
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Access-Control-Expose-Headers": "Content-Disposition"
            }
        )
    except ValueError as val_err:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(val_err))
    except Exception as exc:
        logger.error("Failed to export PDI: %s", exc, exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erro interno ao gerar PDI: {str(exc)}")
