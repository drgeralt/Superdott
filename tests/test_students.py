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
    data = response.json()
    assert isinstance(data, list)


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
