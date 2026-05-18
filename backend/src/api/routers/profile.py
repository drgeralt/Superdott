from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from src.core.database import get_session
from src.api.deps import get_current_user
from src.models.user import User
from src.models.school import School
from src.core.security import verify_password, get_password_hash
from datetime import datetime

router = APIRouter(prefix="/api/profile", tags=["profile"])

class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str

from fastapi import UploadFile, File
import os
import shutil

class ProfileResponse(BaseModel):
    id: int
    email: str
    role: str
    accepted_tcle: bool
    tcle_accepted_at: datetime | None = None
    school_name: str | None = None
    school_address: str | None = None
    school_id: str | None = None
    avatar_url: str | None = None

@router.get("", response_model=ProfileResponse)
async def get_profile(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    school_name = None
    school_address = None
    if current_user.school_id:
        school = await session.get(School, current_user.school_id)
        if school:
            school_name = school.name
            school_address = school.address
    elif current_user.role.value == "SuperAdmin":
        school_name = "Super Admin Global"

    return ProfileResponse(
        id=current_user.id,
        email=current_user.email,
        role=current_user.role.value,
        accepted_tcle=current_user.accepted_tcle,
        tcle_accepted_at=current_user.tcle_accepted_at,
        school_name=school_name,
        school_address=school_address,
        school_id=str(current_user.school_id) if current_user.school_id else None,
        avatar_url=current_user.avatar_url
    )

UPLOAD_AVATAR_DIR = "uploads/avatars"
os.makedirs(UPLOAD_AVATAR_DIR, exist_ok=True)

@router.post("/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    file_ext = file.filename.split('.')[-1].lower()
    if file_ext not in ['jpg', 'jpeg', 'png']:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Formato não suportado")

    file_path = os.path.join(UPLOAD_AVATAR_DIR, f"user_{current_user.id}.{file_ext}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    current_user.avatar_url = f"/{file_path}"
    session.add(current_user)
    await session.commit()
    return {"message": "Avatar atualizado", "avatar_url": current_user.avatar_url}

@router.put("/change-password")
async def change_password(
    payload: PasswordChangeRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    if not current_user.hashed_password:
         raise HTTPException(
             status_code=status.HTTP_400_BAD_REQUEST,
             detail="O usuário SuperAdmin virtual não pode alterar sua senha por esta rota."
         )

    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Senha atual incorreta."
        )

    current_user.hashed_password = get_password_hash(payload.new_password)
    session.add(current_user)
    await session.commit()
    return {"message": "Senha atualizada com sucesso!"}

@router.post("/revoke-consent")
async def revoke_consent(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    if current_user.role.value == "SuperAdmin":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="O SuperAdmin não pode revogar seu consentimento."
        )

    current_user.accepted_tcle = False
    current_user.is_active = False # Deactivate user account on consent revocation
    session.add(current_user)
    await session.commit()
    return {"message": "Consentimento revogado e conta desativada com sucesso."}

from uuid import UUID
from src.models.student import Student
from src.models.links import ParentStudentLink

@router.post("/student/{student_id}/avatar")
async def upload_student_avatar(
    student_id: UUID,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    # Verify if parent is linked to the student
    if current_user.role.value == "Pai":
        link_query = select(ParentStudentLink).where(
            ParentStudentLink.parent_id == current_user.id,
            ParentStudentLink.student_id == student_id
        )
        link_res = await session.exec(link_query)
        if not link_res.first():
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acesso negado.")
    elif current_user.role.value not in ["Diretor", "SuperAdmin"]:
         raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acesso negado.")
         
    student = await session.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Aluno não encontrado")

    file_ext = file.filename.split('.')[-1].lower()
    if file_ext not in ['jpg', 'jpeg', 'png']:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Formato não suportado")

    file_path = os.path.join(UPLOAD_AVATAR_DIR, f"student_{student_id}.{file_ext}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    student.avatar_url = f"/{file_path}"
    session.add(student)
    await session.commit()
    return {"message": "Avatar do estudante atualizado", "avatar_url": student.avatar_url}
