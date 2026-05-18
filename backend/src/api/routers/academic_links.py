from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from src.core.database import get_session
from src.api.deps import get_current_user
from src.models.user import User, UserRole
from src.models.student import Student
from src.models.links import ParentStudentLink, SchoolStudentLink
from src.models.student_link_code import StudentLinkCode
from uuid import UUID

router = APIRouter(prefix="/api/academic-links", tags=["academic_links"])

class ActiveLinkResponse(BaseModel):
    parent_id: int
    parent_email: str
    student_id: UUID
    student_name: str

class LinkCodeResponse(BaseModel):
    id: UUID
    code: str
    student_name: str
    email_responsavel: str
    nome_responsavel: str
    is_used: bool

class AcademicLinksResponse(BaseModel):
    active_links: list[ActiveLinkResponse]
    link_codes: list[LinkCodeResponse]

@router.get("", response_model=AcademicLinksResponse)
async def list_academic_links(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    if current_user.role not in (UserRole.Diretor, UserRole.SuperAdmin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso exclusivo para Diretores e Administradores."
        )

    school_id = current_user.school_id
    if not school_id:
        return AcademicLinksResponse(active_links=[], link_codes=[])

    # 1. Fetch all student IDs in this school
    school_students_res = await session.exec(
        select(SchoolStudentLink.student_id).where(SchoolStudentLink.school_id == school_id)
    )
    student_ids = school_students_res.all()
    if not student_ids:
        return AcademicLinksResponse(active_links=[], link_codes=[])

    # 2. Fetch active Parent Student Links
    active_links_query = (
        select(ParentStudentLink, User, Student)
        .join(User, ParentStudentLink.parent_id == User.id)
        .join(Student, ParentStudentLink.student_id == Student.id)
        .where(ParentStudentLink.student_id.in_(student_ids))
    )
    active_links_res = await session.exec(active_links_query)
    active_links_data = active_links_res.all()

    active_links = [
        ActiveLinkResponse(
            parent_id=link.parent_id,
            parent_email=user.email,
            student_id=link.student_id,
            student_name=student.full_name
        )
        for link, user, student in active_links_data
    ]

    # 3. Fetch Student Link Codes
    codes_query = (
        select(StudentLinkCode, Student)
        .join(Student, StudentLinkCode.student_id == Student.id)
        .where(StudentLinkCode.student_id.in_(student_ids))
    )
    codes_res = await session.exec(codes_query)
    codes_data = codes_res.all()

    link_codes = [
        LinkCodeResponse(
            id=code.id,
            code=code.code,
            student_name=student.full_name,
            email_responsavel=code.email_responsavel,
            nome_responsavel=code.nome_responsavel,
            is_used=code.is_used
        )
        for code, student in codes_data
    ]

    return AcademicLinksResponse(active_links=active_links, link_codes=link_codes)

@router.delete("/{parent_id}/{student_id}")
async def revoke_academic_link(
    parent_id: int,
    student_id: UUID,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    if current_user.role not in (UserRole.Diretor, UserRole.SuperAdmin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso exclusivo para Diretores e Administradores."
        )

    # Verify student is in director's school
    school_id = current_user.school_id
    verify_res = await session.exec(
        select(SchoolStudentLink).where(
            SchoolStudentLink.school_id == school_id,
            SchoolStudentLink.student_id == student_id
        )
    )
    if not verify_res.first():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aluno não encontrado na sua escola."
        )

    # Fetch and delete ParentStudentLink
    link_res = await session.exec(
        select(ParentStudentLink).where(
            ParentStudentLink.parent_id == parent_id,
            ParentStudentLink.student_id == student_id
        )
    )
    link = link_res.first()
    if not link:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vínculo não encontrado."
        )

    await session.delete(link)
    await session.commit()
    return {"message": "Vínculo acadêmico revogado com sucesso!"}
