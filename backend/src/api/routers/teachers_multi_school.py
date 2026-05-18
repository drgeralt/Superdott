from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from uuid import UUID

from src.core.database import get_session
from src.api.deps import get_current_user
from src.models.user import User, UserRole
from src.models.school import School
from src.models.links import TeacherSchoolLink

router = APIRouter(prefix="/api/teachers", tags=["teachers_multi_school"])

class SchoolBasicResponse(BaseModel):
    id: UUID
    name: str

class SwitchSchoolRequest(BaseModel):
    school_id: UUID

class LinkSchoolRequest(BaseModel):
    school_id: UUID

@router.get("/my-schools", response_model=list[SchoolBasicResponse])
async def get_my_schools(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    if current_user.role != UserRole.Professor:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso restrito a professores."
        )

    # Fetch all linked schools for this teacher
    query = (
        select(School)
        .join(TeacherSchoolLink, TeacherSchoolLink.school_id == School.id)
        .where(TeacherSchoolLink.teacher_id == current_user.id)
    )
    result = await session.exec(query)
    schools = result.all()

    return [SchoolBasicResponse(id=s.id, name=s.name) for s in schools]

@router.post("/active-school")
async def set_active_school(
    payload: SwitchSchoolRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    if current_user.role != UserRole.Professor:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso restrito a professores."
        )

    # Verify if teacher is linked to this school
    link_query = select(TeacherSchoolLink).where(
        TeacherSchoolLink.teacher_id == current_user.id,
        TeacherSchoolLink.school_id == payload.school_id
    )
    link_res = await session.exec(link_query)
    if not link_res.first():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não possui vínculo com esta escola."
        )

    # Update active school
    current_user.school_id = payload.school_id
    session.add(current_user)
    await session.commit()

    return {"message": "Escola ativa alterada com sucesso.", "active_school_id": str(payload.school_id)}

@router.post("/link-school", status_code=status.HTTP_201_CREATED)
async def link_to_school(
    payload: LinkSchoolRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    if current_user.role != UserRole.Professor:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso restrito a professores."
        )

    # Check if school exists
    school = await session.get(School, payload.school_id)
    if not school:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Escola não encontrada."
        )

    # Check if link already exists
    link_query = select(TeacherSchoolLink).where(
        TeacherSchoolLink.teacher_id == current_user.id,
        TeacherSchoolLink.school_id == payload.school_id
    )
    link_res = await session.exec(link_query)
    if link_res.first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Você já está vinculado a esta escola."
        )

    # Create link
    new_link = TeacherSchoolLink(teacher_id=current_user.id, school_id=payload.school_id)
    session.add(new_link)

    # If they have no active school, set this one as active
    if not current_user.school_id:
        current_user.school_id = payload.school_id
        session.add(current_user)

    await session.commit()

    return {"message": "Vinculado à escola com sucesso.", "school_id": str(payload.school_id)}
