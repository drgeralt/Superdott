"""
tests/test_students.py
-----------------------
Testa a rota GET /api/students validando:
  - Contrato da API (formato do JSON)
  - Integração real com o banco de dados de teste
"""

import uuid

import pytest
from httpx import AsyncClient
from sqlmodel.ext.asyncio.session import AsyncSession

from src.models.student import Student

CAMPOS_OBRIGATORIOS = {"id", "full_name", "email"}


async def _criar_aluno(session: AsyncSession) -> Student:
    """Insere um aluno no banco de teste e retorna a instância."""
    aluno = Student(
        full_name="Ana Beatriz Teste",
        email=f"ana_{uuid.uuid4().hex[:6]}@escola.com",
    )
    session.add(aluno)
    await session.commit()
    await session.refresh(aluno)
    return aluno


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
async def test_get_students_contem_aluno_inserido(
    async_client: AsyncClient,
    db_session: AsyncSession,
):
    """
    Insere um aluno no banco e verifica se aparece na resposta.
    Valida o contrato do JSON — se renomear 'full_name', esse teste falha.
    """
    aluno = await _criar_aluno(db_session)
    aluno_id = str(aluno.id)

    response = await async_client.get("/api/students")
    assert response.status_code == 200

    data = response.json()
    assert isinstance(data, list)

    ids_retornados = {str(item["id"]) for item in data}
    assert aluno_id in ids_retornados, f"Aluno {aluno_id} não encontrado na resposta"

    aluno_json = next(item for item in data if str(item["id"]) == aluno_id)

    campos_ausentes = CAMPOS_OBRIGATORIOS - aluno_json.keys()
    assert not campos_ausentes, f"Campos ausentes no contrato: {campos_ausentes}"

    assert aluno_json["full_name"] == aluno.full_name
    assert aluno_json["email"] == aluno.email