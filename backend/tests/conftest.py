import importlib
import os
import sys
import uuid
from pathlib import Path

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

root_dir = str(Path(__file__).parent.parent)
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

import src.models
importlib.reload(src.models)

from src.core.database import get_session
from src.main import app
from src.models.user import User, UserRole


_raw_url = os.getenv(
    "DATABASE_URL", "postgresql://admin:admin@localhost:5432/superdott"
)
TEST_DATABASE_URL = (
    _raw_url.replace("postgresql://", "postgresql+asyncpg://").rsplit("/", 1)[0]
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
        raise

    try:
        try:
            await conn.execute(f'CREATE DATABASE "{url.database}"')
        except asyncpg.DuplicateDatabaseError:
            pass
    finally:
        await conn.close()


@pytest_asyncio.fixture(autouse=True, scope="session")
async def setup_test_database(request):
    """Cria as tabelas antes dos testes e apaga depois.
    Pulado automaticamente para testes marcados com no_db ou que não usam banco.
    """
    # Se TODOS os testes da sessão são no_db, pula
    if all(
        item.get_closest_marker("no_db")
        for item in request.session.items
    ):
        yield
        return

    import src.models  # noqa: F401
    await ensure_test_database_exists(TEST_DATABASE_URL)

    engine = create_async_engine(TEST_DATABASE_URL, poolclass=NullPool)
    async with engine.begin() as conn:
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
    """Sessão de banco para testes."""
    engine = create_async_engine(TEST_DATABASE_URL, poolclass=NullPool)
    factory = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with factory() as session:
        yield session

    await engine.dispose()


@pytest.fixture
async def async_client() -> AsyncClient:
    """Cliente HTTP assíncrono para testes de API."""

    async def override_get_session():
        engine = create_async_engine(TEST_DATABASE_URL, poolclass=NullPool)
        factory = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
        async with factory() as session:
            yield session
        await engine.dispose()

    async def override_get_current_user():
        return User(
            id=9999,
            email="test@test.com",
            hashed_password="hashed",
            role=UserRole.SuperAdmin,
            is_active=True,
        )

    app.dependency_overrides[get_session] = override_get_session
    app.dependency_overrides[get_current_user] = override_get_current_user

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        yield client


@pytest_asyncio.fixture()
async def chat_student_id():
    """Cria um aluno isolado para testes de chat."""
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

    # Limpeza
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
