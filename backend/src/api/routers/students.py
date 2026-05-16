import uuid
from fastapi import APIRouter, Depends, BackgroundTasks, status, HTTPException
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from src.core.database import get_session
from src.models.student import Student
from src.api.services.audit_service import create_audit_log, AuditAction

router = APIRouter(prefix="/api/students", tags=["Students"])


@router.get("", response_model=list[Student])
async def get_students(session: AsyncSession = Depends(get_session)):
    """Retorna a lista de alunos utilizando SQLModel e PostgreSQL assíncrono."""
    result = await session.exec(select(Student))
    return result.all()


@router.post("/{student_id}/link", status_code=status.HTTP_200_OK)
async def link_student(
    student_id: uuid.UUID,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_session),
    # current_user: User = Depends(get_current_user),  # <- descomentar quando tiver auth
):
    """Cria um vínculo com o aluno e registra a ação na trilha de auditoria."""
    result = await session.exec(select(Student).where(Student.id == student_id))
    student = result.first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aluno não encontrado.",
        )
    
     # TODO: substituir uuid fixo pelo current_user.id após implementar auth (TASK-014)
    acting_user_id = uuid.UUID("00000000-0000-0000-0000-000000000001")
 
    background_tasks.add_task(
        _audit_link,
        user_id=acting_user_id,
        student_id=student_id,
        action=AuditAction.STUDENT_LINKED,
    )
    return {"ok": True}
 
 
@router.delete("/{student_id}/link", status_code=status.HTTP_200_OK)
async def unlink_student(
    student_id: uuid.UUID,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_session),
    # current_user: User = Depends(get_current_user),  # <- descomentar quando tiver auth
):
    """Remove o vínculo com o aluno e registra a ação na trilha de auditoria."""
    result = await session.exec(select(Student).where(Student.id == student_id))
    student = result.first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aluno não encontrado.",
        )
 
    acting_user_id = uuid.UUID("00000000-0000-0000-0000-000000000001")
 
    background_tasks.add_task(
        _audit_link,
        user_id=acting_user_id,
        student_id=student_id,
        action=AuditAction.STUDENT_UNLINKED,
    )
    return {"ok": True}
 
 
async def _audit_link(
    user_id: uuid.UUID,
    student_id: uuid.UUID,
    action: AuditAction,
) -> None:
    """
    Tarefa de background para persistir logs de vínculo/desvínculo.
    Cria sua própria sessão pois BackgroundTasks roda fora do ciclo de request.
    Reutiliza o engine global — não cria pool novo a cada chamada.
    """
    from sqlalchemy.orm import sessionmaker
    from src.core.database import engine  

    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as session:
        await create_audit_log(
            session=session,
            user_id=user_id,
            action=action,
            student_id=student_id,
        )

