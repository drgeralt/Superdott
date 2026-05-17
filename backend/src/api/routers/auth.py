from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from datetime import timedelta

from src.core.database import get_session
from src.core.security import verify_password, create_access_token
from src.core.config import settings
from src.models.user import User

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/token")
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: Annotated[AsyncSession, Depends(get_session)]
):
    result = await session.exec(select(User).where(User.email == form_data.username))
    user = result.first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role.value},
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


from pydantic import BaseModel
from src.core.security import get_password_hash
from datetime import datetime, UTC
from src.models.user import UserRole

class UserRegister(BaseModel):
    email: str
    password: str
    role: UserRole = UserRole.Pai
    accepted_tcle: bool

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_user(
    payload: UserRegister,
    session: Annotated[AsyncSession, Depends(get_session)]
):
    if not payload.accepted_tcle:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="O aceite do TCLE e da Política de Privacidade é obrigatório."
        )

    # Check if email exists
    result = await session.exec(select(User).where(User.email == payload.email))
    if result.first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email já cadastrado.")

    user = User(
        email=payload.email,
        hashed_password=get_password_hash(payload.password),
        role=payload.role,
        accepted_tcle=True,
        tcle_accepted_at=datetime.now(UTC).replace(tzinfo=None)
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)

    return {"message": "Usuário criado com sucesso", "id": user.id}
