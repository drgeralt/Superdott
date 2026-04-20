import os

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool
from sqlmodel import SQLModel
from sqlmodel.ext.asyncio.session import AsyncSession

from src.main import app

_raw_url = os.getenv(
    "DATABASE_URL", "postgresql://admin:admin@localhost:5432/superdott"
)
TEST_DATABASE_URL = (
    _raw_url.replace("postgresql://", "postgresql+asyncpg://").rsplit("/", 1)[0]
    + "/superdott_test"
)


@pytest_asyncio.fixture(autouse=True, scope="session")
async def setup_test_database():
    """Cria as tabelas antes dos testes e apaga depois."""
    import src.models  # noqa: F401

    engine = create_async_engine(TEST_DATABASE_URL, poolclass=NullPool)
    async with engine.begin() as conn:
        # --> A LINHA MÁGICA QUE SALVA O CI ESTÁ AQUI:
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))

        await conn.run_sync(SQLModel.metadata.create_all)

    await engine.dispose()

    yield

    engine = create_async_engine(TEST_DATABASE_URL, poolclass=NullPool)
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)
    await engine.dispose()


@pytest_asyncio.fixture()
async def db_session() -> AsyncSession:
    """Sessão exclusiva para inserir dados de teste diretamente no banco."""
    engine = create_async_engine(TEST_DATABASE_URL, poolclass=NullPool)
    factory = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    session = factory()
    try:
        yield session
    finally:
        try:
            await session.close()
        except Exception:  # noqa: S110
            pass
        try:
            await engine.dispose()
        except Exception:  # noqa: S110
            pass


@pytest.fixture
async def async_client() -> AsyncClient:
    """
    Cliente HTTP que usa sua PRÓPRIA sessão de banco — separada do db_session.
    Isso evita o erro 'another operation is in progress' do asyncpg.
    """
    from src.core.database import get_session

    async def override_get_session():
        engine = create_async_engine(TEST_DATABASE_URL, poolclass=NullPool)
        factory = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
        async with factory() as session:
            yield session
        await engine.dispose()

    app.dependency_overrides[get_session] = override_get_session

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        yield client


@pytest.fixture
async def db_session() -> AsyncSession:
    """Fixture que fornece uma sessão de banco de dados para testes."""
    engine = create_async_engine(TEST_DATABASE_URL, poolclass=NullPool)
    factory = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with factory() as session:
        yield session
    await engine.dispose()
