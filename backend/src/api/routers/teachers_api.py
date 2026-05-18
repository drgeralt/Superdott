from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from src.core.database import get_session
from src.api.deps import get_current_user
from src.models.user import User, UserRole
from src.core.security import get_password_hash

router = APIRouter(prefix="/api/teachers", tags=["teachers"])

class TeacherInviteRequest(BaseModel):
    email: str
    password: str | None = None

class TeacherResponse(BaseModel):
    id: int
    email: str
    is_active: bool

@router.get("", response_model=list[TeacherResponse])
async def list_teachers(
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
        return []

    from src.models.links import TeacherSchoolLink

    result = await session.exec(
        select(User)
        .join(TeacherSchoolLink, TeacherSchoolLink.teacher_id == User.id)
        .where(TeacherSchoolLink.school_id == school_id, User.role == UserRole.Professor)
    )
    teachers = result.all()
    
    # Deduplicate
    unique_teachers = {t.id: t for t in teachers}.values()
    
    return [
        TeacherResponse(id=t.id, email=t.email, is_active=t.is_active)
        for t in unique_teachers
    ]

@router.post("/invite", status_code=status.HTTP_201_CREATED)
async def invite_teacher(
    payload: TeacherInviteRequest,
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
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="O usuário logado não possui escola vinculada."
        )

    from src.models.links import TeacherSchoolLink

    # Check if teacher email already exists
    existing_user_res = await session.exec(select(User).where(User.email == payload.email))
    existing_user = existing_user_res.first()
    
    if existing_user:
        if existing_user.role != UserRole.Professor:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="E-mail já cadastrado com outro perfil."
            )
        
        # Check if already linked
        existing_link_res = await session.exec(
            select(TeacherSchoolLink).where(
                TeacherSchoolLink.teacher_id == existing_user.id,
                TeacherSchoolLink.school_id == school_id
            )
        )
        if existing_link_res.first():
            return {"message": "Professor já estava vinculado a esta escola.", "id": existing_user.id}
        
        # Link silently
        new_link = TeacherSchoolLink(teacher_id=existing_user.id, school_id=school_id)
        session.add(new_link)
        await session.commit()
        return {"message": "Professor vinculado com sucesso!", "id": existing_user.id}

    import secrets
    import string
    pwd = payload.password if payload.password else "".join(secrets.choice(string.ascii_letters + string.digits) for _ in range(16))
    
    teacher = User(
        email=payload.email,
        hashed_password=get_password_hash(pwd),
        role=UserRole.Professor,
        school_id=school_id,
        is_active=True,
        accepted_tcle=True
    )
    session.add(teacher)
    await session.flush()
    
    # Also add the link
    new_link = TeacherSchoolLink(teacher_id=teacher.id, school_id=school_id)
    session.add(new_link)

    await session.commit()
    await session.refresh(teacher)
    return {"message": "Professor cadastrado e vinculado com sucesso!", "id": teacher.id}

@router.delete("/{teacher_id}")
async def revoke_teacher(
    teacher_id: int,
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
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="O usuário logado não possui escola vinculada."
        )

    from src.models.links import TeacherSchoolLink
    
    link_res = await session.exec(
        select(TeacherSchoolLink).where(
            TeacherSchoolLink.teacher_id == teacher_id,
            TeacherSchoolLink.school_id == school_id
        )
    )
    link = link_res.first()
    if not link:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Professor não possui vínculo ativo com esta escola."
        )

    await session.delete(link)
    await session.commit()
    return {"message": "Vínculo com o professor revogado com sucesso!"}
