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


@pytest.mark.asyncio
async def test_chat_envia_role_pai_ao_pipeline(async_client: AsyncClient, chat_student_id: str):
    """POST /api/chat deve repassar UserRole.Pai para o pipeline RAG."""
    from src.api.deps import get_current_user
    from src.models.user import User, UserRole
    from src.main import app

    async def override_pai():
        return User(id=9999, email="test@test.com", hashed_password="hashed", role=UserRole.Pai, is_active=True)

    app.dependency_overrides[get_current_user] = override_pai

    # Insere o link no banco
    async with AsyncSession(test_engine) as session:
        await session.exec(
            text("INSERT INTO parent_student_links (parent_id, student_id) VALUES (9999, :student_id) ON CONFLICT DO NOTHING"),
            params={"student_id": chat_student_id},
        )
        await session.commit()

    try:
        with patch(
            "src.api.routers.chat.ask",
            new_callable=AsyncMock,
            return_value=FakeRAGResponse(),
        ) as mock_ask:
            response = await async_client.post(
                "/api/chat",
                json={
                    "message": "Olá",
                    "student_id": chat_student_id,
                },
            )
            assert response.status_code == 200
            mock_ask.assert_called_once()
            kwargs = mock_ask.call_args[1]
            assert kwargs["user_role"] == UserRole.Pai
    finally:
        # Limpar o link
        async with AsyncSession(test_engine) as session:
            await session.exec(
                text("DELETE FROM parent_student_links WHERE parent_id = 9999 AND student_id = :student_id"),
                params={"student_id": chat_student_id},
            )
            await session.commit()
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_chat_envia_role_professor_ao_pipeline(async_client: AsyncClient, chat_student_id: str):
    """POST /api/chat deve repassar UserRole.Professor para o pipeline RAG."""
    from src.api.deps import get_current_user
    from src.models.user import User, UserRole
    from src.main import app

    async def override_teacher():
        return User(id=9999, email="test@test.com", hashed_password="hashed", role=UserRole.Professor, is_active=True)

    app.dependency_overrides[get_current_user] = override_teacher

    try:
        with patch(
            "src.api.routers.chat.ask",
            new_callable=AsyncMock,
            return_value=FakeRAGResponse(),
        ) as mock_ask:
            response = await async_client.post(
                "/api/chat",
                json={
                    "message": "Olá",
                    "student_id": chat_student_id,
                },
            )
            assert response.status_code == 200
            mock_ask.assert_called_once()
            kwargs = mock_ask.call_args[1]
            assert kwargs["user_role"] == UserRole.Professor
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_chat_envia_role_diretor_ao_pipeline(async_client: AsyncClient, chat_student_id: str):
    """POST /api/chat deve repassar UserRole.Diretor para o pipeline RAG."""
    from src.api.deps import get_current_user
    from src.models.user import User, UserRole
    from src.main import app

    async def override_director():
        return User(id=9999, email="test@test.com", hashed_password="hashed", role=UserRole.Diretor, is_active=True)

    app.dependency_overrides[get_current_user] = override_director

    try:
        with patch(
            "src.api.routers.chat.ask",
            new_callable=AsyncMock,
            return_value=FakeRAGResponse(),
        ) as mock_ask:
            response = await async_client.post(
                "/api/chat",
                json={
                    "message": "Olá",
                    "student_id": chat_student_id,
                },
            )
            assert response.status_code == 200
            mock_ask.assert_called_once()
            kwargs = mock_ask.call_args[1]
            assert kwargs["user_role"] == UserRole.Diretor
    finally:
        app.dependency_overrides.clear()
