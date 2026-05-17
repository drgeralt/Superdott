import pytest
from httpx import AsyncClient
from sqlmodel.ext.asyncio.session import AsyncSession
from src.models.user import User, UserRole
from src.core.security import get_password_hash
from src.main import app
from src.api.deps import get_current_user

from sqlmodel import select

@pytest.fixture
async def setup_users(db_session: AsyncSession):
    # Verifica se já existem
    admin = (await db_session.exec(select(User).where(User.email == "admin@test.com"))).first()
    if not admin:
        admin = User(
            email="admin@test.com",
            hashed_password=get_password_hash("password123"),
            role=UserRole.SuperAdmin
        )
        db_session.add(admin)
        
    pai = (await db_session.exec(select(User).where(User.email == "pai@test.com"))).first()
    if not pai:
        pai = User(
            email="pai@test.com",
            hashed_password=get_password_hash("password123"),
            role=UserRole.Pai
        )
        db_session.add(pai)
        
    await db_session.commit()
    await db_session.refresh(admin)
    await db_session.refresh(pai)
    return {"admin": admin, "pai": pai}

@pytest.mark.asyncio
async def test_login_success(async_client: AsyncClient, setup_users):
    # Remover o override para testar o fluxo real de auth
    app.dependency_overrides.pop(get_current_user, None)
    
    response = await async_client.post(
        "/api/auth/token",
        data={"username": "admin@test.com", "password": "password123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

@pytest.mark.asyncio
async def test_login_failure(async_client: AsyncClient, setup_users):
    app.dependency_overrides.pop(get_current_user, None)
    
    response = await async_client.post(
        "/api/auth/token",
        data={"username": "admin@test.com", "password": "wrongpassword"}
    )
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_missing_token_returns_401(async_client: AsyncClient):
    app.dependency_overrides.pop(get_current_user, None)
    
    # Rota protegida sem token
    response = await async_client.get("/api/audit-logs")
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_role_restriction_returns_403(async_client: AsyncClient, setup_users):
    app.dependency_overrides.pop(get_current_user, None)
    
    # Fazer login como Pai
    login_response = await async_client.post(
        "/api/auth/token",
        data={"username": "pai@test.com", "password": "password123"}
    )
    token = login_response.json()["access_token"]
    
    # Tentar acessar rota de auditoria que exige SuperAdmin
    response = await async_client.get(
        "/api/audit-logs",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 403
