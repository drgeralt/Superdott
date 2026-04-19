"""
tests/conftest.py
-----------------
Fixtures compartilhadas por todos os testes da Task 12.

O que este arquivo faz:
  1. Cria um banco de dados PostgreSQL SEPARADO só para testes
     (para não sujar o banco de desenvolvimento)
  2. Cria todas as tabelas antes dos testes e apaga depois
  3. Fornece um AsyncClient que faz requisições HTTP falsas
     (sem precisar subir o uvicorn na porta 8000)
  4. Faz override da injeção de dependência do banco
     (substitui o banco real pelo banco de teste)
"""

import asyncio
import os
from collections.abc import AsyncGenerator

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel
from sqlmodel.ext.asyncio.session import AsyncSession

# ─── URL do banco de teste ───────────────────────────────────────────────────
# Usa a mesma URL do banco de dev, mas troca o nome do banco para "superdott_test"
# Em CI, a variável TEST_DATABASE_URL pode ser definida diretamente.
_raw_url = os.getenv(
    "TEST_DATABASE_URL",
    os.getenv("DATABASE_URL", "postgresql://admin:admin@localhost:5432/superdott"),
)

# Garante que usa o driver assíncrono (asyncpg)
TEST_DATABASE_URL = _raw_url.replace(
    "postgresql://", "postgresql+asyncpg://"
).replace(
    "postgresql+psycopg2://", "postgresql+asyncpg://"
)

# Substitui o nome do banco por "superdott_test"
# Ex: ...@localhost:5432/superdott → ...@localhost:5432/superdott_test
if "/superdott_test" not in TEST_DATABASE_URL:
    TEST_DATABASE_URL = TEST_DATABASE_URL.rsplit("/", 1)[0] + "/superdott_test"


# ─── Engine de teste (criado uma vez por sessão de teste) ────────────────────
test_engine = create_async_engine(TEST_DATABASE_URL, echo=False)


# ─── Fixture: cria e destrói as tabelas do banco de teste ───────────────────
@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_test_database():
    """
    Roda UMA VEZ antes de todos os testes:
      - Cria todas as tabelas no banco superdott_test
    Roda UMA VEZ depois de todos os testes:
      - Apaga todas as tabelas (deixa o banco limpo)

    'autouse=True' significa que roda automaticamente sem precisar
    declarar essa fixture nos testes.
    """
    # Importa os models para que o SQLModel saiba quais tabelas criar
    import src.models  # noqa: F401

    async with test_engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

    yield  # ← aqui os testes rodam

    async with test_engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)


# ─── Fixture: sessão de banco para cada teste ────────────────────────────────
@pytest_asyncio.fixture()
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Abre uma sessão de banco de teste para cada teste individual.
    Cada teste começa com o banco limpo.
    """
    async_session = sessionmaker(
        test_engine, class_=AsyncSession, expire_on_commit=False
    )
    async with async_session() as session:
        yield session


# ─── Fixture: cliente HTTP assíncrono ────────────────────────────────────────
@pytest_asyncio.fixture()
async def async_client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """
    Cria um cliente HTTP falso que faz requisições diretamente ao FastAPI
    sem precisar subir o uvicorn.

    Também faz o OVERRIDE da injeção de dependência do banco:
    substitui o banco real (superdott) pelo banco de teste (superdott_test).
    """
    from src.core.database import get_session
    from src.main import app

    # Substitui get_session pelo banco de teste
    async def override_get_session():
        yield db_session

    app.dependency_overrides[get_session] = override_get_session

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        yield client

    # Limpa o override após o teste
    app.dependency_overrides.clear()
