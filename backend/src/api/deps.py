from typing import Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError
import jwt
from sqlmodel.ext.asyncio.session import AsyncSession

from src.core.config import settings
from src.core.database import get_session
from src.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")

async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    session: Annotated[AsyncSession, Depends(get_session)]
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Não foi possível validar as credenciais",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except InvalidTokenError:
        raise credentials_exception

    if user_id == "superadmin":
        from src.models.user import UserRole
        return User(
            id=9999,
            email=settings.SUPERADMIN_EMAIL,
            hashed_password="",
            role=UserRole.SuperAdmin,
            is_active=True,
            accepted_tcle=True
        )

    try:
        db_user_id = int(user_id)
    except ValueError:
        raise credentials_exception

    user = await session.get(User, db_user_id)
    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Usuário inativo")
    return user

def require_role(allowed_roles: list[str]):
    def role_checker(current_user: Annotated[User, Depends(get_current_user)]):
        if current_user.role.value not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Você não tem permissão para realizar esta ação"
            )
        return current_user
    return role_checker
