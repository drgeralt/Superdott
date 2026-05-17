"""
tests/test_students.py
-----------------------
Testa a rota GET /api/students.
Versão refatorada com isolamento de sessão assíncrona.
"""

import uuid

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.pool import NullPool
from sqlmodel import text
from sqlmodel.ext.asyncio.session import AsyncSession

from tests.conftest import TEST_DATABASE_URL

# Motor exclusivo para os testes
test_engine = create_async_engine(TEST_DATABASE_URL, poolclass=NullPool)


@pytest.fixture()
async def sample_student_id():
    """Insere um aluno isolado no banco e limpa após o teste."""
    student_id = str(uuid.uuid4())
    async with AsyncSession(test_engine) as session:
        await session.exec(
            text("INSERT INTO students (id, full_name, email) VALUES (:id, :name, :email)"),
            params={
                "id": student_id,
                "name": "Ana Beatriz Teste",
                "email": f"ana_{student_id[:8]}@escola.com",
            },
        )
        await session.commit()

    yield student_id

    # Limpeza (Teardown)
    async with AsyncSession(test_engine) as session:
        try:
            await session.exec(text("DELETE FROM students WHERE id = :id"), params={"id": student_id})
            await session.commit()
        except Exception:
            pass


@pytest.mark.asyncio
async def test_get_students_retorna_200(async_client: AsyncClient):
    """GET /api/students deve retornar HTTP 200."""
    response = await async_client.get("/api/students")
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_get_students_retorna_lista(async_client: AsyncClient):
    """GET /api/students deve retornar uma lista (mesmo que vazia)."""
    response = await async_client.get("/api/students")
    assert isinstance(response.json(), list)


@pytest.mark.asyncio
async def test_get_students_contem_aluno_inserido(async_client: AsyncClient, sample_student_id: str):
    """
    Insere um aluno no banco de teste e verifica se ele aparece na resposta
    com os campos obrigatórios do contrato (id, full_name, email).
    """
    response = await async_client.get("/api/students")
    assert response.status_code == 200

    data = response.json()
    assert isinstance(data, list)

    # Verifica se o aluno da fixture está na lista retornada pela API
    ids_retornados = [str(item["id"]) for item in data]
    assert sample_student_id in ids_retornados

    # Verifica o contrato do JSON — campos obrigatórios devem existir
    aluno_json = next(item for item in data if str(item["id"]) == sample_student_id)
    assert "id" in aluno_json
    assert "full_name" in aluno_json  # Se renomear para "name" na API, este teste vai barrar!
    assert "email" in aluno_json
    assert aluno_json["full_name"] == "Ana Beatriz Teste"


@pytest.mark.asyncio
async def test_get_students_isolamento_pai(async_client: AsyncClient, sample_student_id: str):
    """Garante que o Pai só vê seus próprios alunos via tabela de Link"""
    from src.api.deps import get_current_user
    from src.models.user import User, UserRole
    from src.main import app

    async def override_get_current_user_pai():
        return User(id=999, email="pai999@test.com", hashed_password="hashed", role=UserRole.Pai, is_active=True)

    app.dependency_overrides[get_current_user] = override_get_current_user_pai

    # Sem vínculo
    response = await async_client.get("/api/students")
    assert response.status_code == 200
    assert len(response.json()) == 0

    # Cria o vínculo do Pai com o Aluno (precisa criar o User 999 no banco antes)
    async with AsyncSession(test_engine) as session:
        await session.exec(
            text("INSERT INTO \"user\" (id, email, hashed_password, role, is_active, accepted_tcle) VALUES (999, 'pai999@test.com', 'hashed', 'Pai', true, true)")
        )
        await session.exec(
            text("INSERT INTO parent_student_links (parent_id, student_id) VALUES (999, :id)"),
            params={"id": sample_student_id},
        )
        await session.commit()

    # Com vínculo, deve ver 1 aluno
    response = await async_client.get("/api/students")
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["id"] == sample_student_id

    # Teardown
    async with AsyncSession(test_engine) as session:
        await session.exec(text("DELETE FROM parent_student_links WHERE parent_id = 999"))
        await session.exec(text("DELETE FROM \"user\" WHERE id = 999"))
        await session.commit()
