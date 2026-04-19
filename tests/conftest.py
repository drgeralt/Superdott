import pytest
from httpx import ASGITransport, AsyncClient
from sqlmodel.ext.asyncio.session import AsyncSession

from src.main import app


@pytest.fixture
async def async_client():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        yield client


@pytest.fixture
async def db_session() -> AsyncSession:
    """Fixture que fornece uma sessão de banco de dados para testes."""
    async with AsyncSession() as session:
        yield session
