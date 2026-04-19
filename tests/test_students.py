"""
tests/test_students.py
-----------------------
Testa a rota GET /api/students validando:
  - Contrato da API (formato do JSON)
  - Integração real com o banco de dados de teste

Por que é importante?
  Se alguém mudar o nome de um campo no modelo Student
  (ex: "full_name" → "name"), esse teste vai falhar no CI
  e bloquear o merge — exatamente como a task pede.
"""

import uuid

import pytest
from httpx import AsyncClient
from sqlmodel.ext.asyncio.session import AsyncSession


# ─── Fixture auxiliar: insere um aluno no banco de teste ─────────────────────
async def _criar_aluno(session: AsyncSession) -> dict:
    """Insere um aluno diretamente no banco e retorna seus dados."""
    from src.models.student import Student

    aluno = Student(
        full_name="Ana Beatriz Teste",
        email=f"ana_{uuid.uuid4().hex[:6]}@escola.com",
    )
    session.add(aluno)
    await session.commit()
    await session.refresh(aluno)
    return aluno


# ─── Testes ──────────────────────────────────────────────────────────────────

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
async def test_get_students_contem_aluno_inserido(
    async_client: AsyncClient,
    db_session: AsyncSession,
):
    """
    Insere um aluno no banco de teste e verifica se ele aparece na resposta.

    Este é o teste mais importante:
      - Garante integração real com o banco
      - Valida que o campo 'full_name' existe no contrato da API
      - Se alguém renomear o campo no modelo, esse teste vai falhar
    """
    aluno = await _criar_aluno(db_session)

    response = await async_client.get("/api/students")
    assert response.status_code == 200

    data = response.json()
    assert isinstance(data, list)

    # Verifica se o aluno inserido está na lista
    ids_retornados = [str(item["id"]) for item in data]
    assert str(aluno.id) in ids_retornados

    # Verifica o contrato do JSON — campos obrigatórios devem existir
    aluno_json = next(item for item in data if str(item["id"]) == str(aluno.id))
    assert "id" in aluno_json
    assert "full_name" in aluno_json   # ← se renomear para "name", FALHA aqui
    assert "email" in aluno_json
    assert aluno_json["full_name"] == "Ana Beatriz Teste"
