import os

import asyncpg
import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import text
from sqlalchemy.engine.url import make_url
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool
from sqlmodel import SQLModel
from sqlmodel.ext.asyncio.session import AsyncSession

from src.main import app

_raw_url = os.getenv(
    "DATABASE_URL", "postgresql://admin:admin@localhost:5432/superdott"
)
_formatted_url = _raw_url
if _formatted_url.startswith("postgresql://"):
    _formatted_url = _formatted_url.replace("postgresql://", "postgresql+asyncpg://", 1)

TEST_DATABASE_URL = (
    _formatted_url.rsplit("/", 1)[0]
    + "/superdott_test"
)


async def ensure_test_database_exists(database_url: str) -> None:
    url = make_url(database_url)
    if not url.database or not url.drivername.startswith("postgresql"):
        return

    admin_db = "postgres"
    try:
        conn = await asyncpg.connect(
            user=url.username,
            password=url.password,
            database=admin_db,
            host=url.host or "localhost",
            port=url.port or 5432,
        )
    except Exception:
        # If the admin connection fails, let the test framework raise the correct error.
        raise

    try:
        try:
            await conn.execute(f'CREATE DATABASE "{url.database}"')
        except asyncpg.DuplicateDatabaseError:
            pass
    finally:
        await conn.close()


@pytest_asyncio.fixture(autouse=True, scope="session")
async def setup_test_database():
    """Cria as tabelas antes dos testes e apaga depois."""
    import src.models  # noqa: F401

    await ensure_test_database_exists(TEST_DATABASE_URL)

    engine = create_async_engine(TEST_DATABASE_URL, poolclass=NullPool)
    async with engine.begin() as conn:
        # --> A LINHA MÁGICA QUE SALVA O CI ESTÁ AQUI:
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))

        await conn.run_sync(SQLModel.metadata.create_all)
        
        # Insere usuário mock (id=9999) usado pelo override_get_current_user
        await conn.execute(text("INSERT INTO \"user\" (id, email, hashed_password, role, is_active, accepted_tcle) VALUES (9999, 'test@test.com', 'hashed', 'SuperAdmin', true, true) ON CONFLICT DO NOTHING"))

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
    from src.api.deps import get_current_user
    from src.models.user import User, UserRole

    async def override_get_session():
        engine = create_async_engine(TEST_DATABASE_URL, poolclass=NullPool)
        factory = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
        async with factory() as session:
            yield session
        await engine.dispose()

    async def override_get_current_user():
        return User(id=9999, email="test@test.com", hashed_password="hashed", role=UserRole.SuperAdmin, is_active=True)

    app.dependency_overrides[get_session] = override_get_session
    app.dependency_overrides[get_current_user] = override_get_current_user

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


import uuid

@pytest_asyncio.fixture()
async def chat_student_id():
    """Cria um aluno isolado no banco e limpa após o teste."""
    engine = create_async_engine(TEST_DATABASE_URL, poolclass=NullPool)
    student_id = str(uuid.uuid4())
    async with AsyncSession(engine) as session:
        await session.exec(
            text("INSERT INTO students (id, full_name, email) VALUES (:id, :name, :email)"),
            params={
                "id": student_id,
                "name": "Aluno Chat Teste",
                "email": f"chat_{student_id[:8]}@escola.com",
            },
        )
        await session.commit()

    yield student_id

    # Limpeza (Teardown)
    async with AsyncSession(engine) as session:
        try:
            await session.exec(
                text("DELETE FROM students WHERE id = :id"),
                params={"id": student_id},
            )
            await session.commit()
        except Exception:
            pass
    await engine.dispose()
