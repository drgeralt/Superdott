"""
tests/test_chat.py
------------------
Testa a rota POST /api/chat COM MOCK do Gemini.
Versão refatorada com isolamento de sessão assíncrona.
"""

import uuid
from unittest.mock import AsyncMock, patch

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.pool import NullPool
from sqlmodel import text
from sqlmodel.ext.asyncio.session import AsyncSession

from tests.conftest import TEST_DATABASE_URL

# Motor exclusivo para os testes, sem pool de conexões para evitar conflitos
test_engine = create_async_engine(TEST_DATABASE_URL, poolclass=NullPool)


class FakeRAGResponse:
    """Simula o objeto de resposta do pipeline RAG."""
    answer = "Mocked AI Response: aluno demonstra altas habilidades."
    sources = ["manual_mec.pdf"]


@pytest.fixture()
async def chat_student_id():
    """Cria um aluno isolado no banco e limpa após o teste."""
    student_id = str(uuid.uuid4())
    async with AsyncSession(test_engine) as session:
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
    async with AsyncSession(test_engine) as session:
        try:
            # Tenta apagar o aluno. Se o chat salvou histórico vinculado a ele, 
            # o banco impedirá a exclusão (Foreign Key). O except ignora a falha pro teste não quebrar.
            await session.exec(text("DELETE FROM students WHERE id = :id"), params={"id": student_id})
            await session.commit()
        except Exception:
            pass


@pytest.mark.asyncio
async def test_chat_retorna_200_com_mock(async_client: AsyncClient, chat_student_id: str):
    """POST /api/chat deve retornar HTTP 200 com Gemini mockado."""
    with patch(
        "src.api.routers.chat.ask",
        new_callable=AsyncMock,
        return_value=FakeRAGResponse(),
    ):
        response = await async_client.post(
            "/api/chat",
            json={
                "message": "Como identificar altas habilidades?",
                "student_id": chat_student_id,
                "student_context": {
                    "name": "Aluno Teste",
                    "scores": {"intelectual": 8, "criatividade": 9},
                },
            },
        )

    assert response.status_code == 200


@pytest.mark.asyncio
async def test_chat_retorna_campo_text(async_client: AsyncClient, chat_student_id: str):
    """Valida o contrato da API — campo 'text' e 'sources' devem existir."""
    with patch(
        "src.api.routers.chat.ask",
        new_callable=AsyncMock,
        return_value=FakeRAGResponse(),
    ):
        response = await async_client.post(
            "/api/chat",
            json={
                "message": "Quais atividades recomendar?",
                "student_id": chat_student_id,
            },
        )

    data = response.json()
    assert "text" in data
    assert "sources" in data
    assert isinstance(data["sources"], list)


@pytest.mark.asyncio
async def test_chat_resposta_vem_do_mock(async_client: AsyncClient, chat_student_id: str):
    """Verifica que o texto retornado é exatamente o que o mock configurou."""
    with patch(
        "src.api.routers.chat.ask",
        new_callable=AsyncMock,
        return_value=FakeRAGResponse(),
    ):
        response = await async_client.post(
            "/api/chat",
            json={
                "message": "Teste de mock",
                "student_id": chat_student_id,
            },
        )

    data = response.json()
    assert data["text"] == FakeRAGResponse.answer
