from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4

import pytest
from httpx import AsyncClient

from src.models.chat_message import ChatMessage
from src.models.chat_session import ChatSession


# ====================== FIXTURES ======================

@pytest.fixture
def mock_chat_dependencies():
    """Fixture centralizada para mocks comuns do chat."""
    fake_session_id = uuid4()
    fake_session = ChatSession(id=fake_session_id, student_id=uuid4())

    fake_rag = MagicMock()
    fake_rag.answer = "Resposta mockada da IA"
    fake_rag.sources = ["manual_mec.pdf"]

    with (
        patch("src.api.routers.chat._get_or_create_session", new=AsyncMock(return_value=fake_session)),
        patch("src.api.routers.chat._get_recent_history", new=AsyncMock(return_value=[])),
        patch("src.api.routers.chat.ask", new=AsyncMock(return_value=fake_rag)),
        patch("src.api.routers.chat.AsyncSession") as MockAsyncSession,
    ):
        mock_session = MockAsyncSession.return_value
        mock_session.add = AsyncMock()
        mock_session.commit = AsyncMock()

        yield mock_session, fake_session, fake_rag


# ====================== TESTES ======================

@pytest.mark.asyncio
async def test_chat_grava_user_e_assistant_na_mesma_sessao(
    async_client: AsyncClient, mock_chat_dependencies
):
    """
    Testa o fluxo completo do endpoint /api/chat:
    - Criação da sessão
    - Gravação da mensagem do usuário
    - Gravação da resposta da IA
    """
    mock_session, _, fake_rag = mock_chat_dependencies
    student_id = uuid4()

    response = await async_client.post(
        "/api/chat",
        json={
            "message": "Quais são os pontos fortes do aluno?",
            "student_id": str(student_id),
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["text"] == fake_rag.answer

    # Verifica que foram adicionadas as duas mensagens (user + assistant)
    added_objects = [call.args[0] for call in mock_session.add.call_args_list]

    chat_messages = [obj for obj in added_objects if isinstance(obj, ChatMessage)]
    assert len(chat_messages) == 2

    roles = {msg.role for msg in chat_messages}
    assert roles == {"user", "assistant"}

    # Verificações extras de conteúdo
    user_message = next(msg for msg in chat_messages if msg.role == "user")
    assert user_message.content == "Quais são os pontos fortes do aluno?"
    assert user_message.student_id == student_id


@pytest.mark.asyncio
async def test_chat_grava_apenas_mensagem_do_usuario_quando_falha_ia(
    async_client: AsyncClient, mock_chat_dependencies
):
    """Teste específico: deve salvar a mensagem do usuário mesmo se a IA falhar."""
    mock_session, _, _ = mock_chat_dependencies

    # Simula falha na IA
    with patch("src.api.routers.chat.ask", new=AsyncMock(side_effect=Exception("Erro na IA"))):
        response = await async_client.post(
            "/api/chat",
            json={
                "message": "Teste de erro",
                "student_id": str(uuid4()),
            },
        )

    # Ainda deve ter salvado a mensagem do usuário
    added_messages = [
        call.args[0]
        for call in mock_session.add.call_args_list
        if isinstance(call.args[0], ChatMessage)
    ]

    assert len(added_messages) >= 1
    assert any(msg.role == "user" for msg in added_messages)


def test_history_injetado_no_prompt():
    """Verifica que o histórico é corretamente formatado no prompt."""
    from src.rag.prompt import build_prompt

    history = [
        {"role": "user", "content": "Quais são os pontos fortes dela?"},
        {
            "role": "assistant",
            "content": "Os pontos fortes são liderança e criatividade.",
        },
    ]

    prompt = build_prompt(
        question="E como usar isso em matemática?",
        chunks=[],
        history=history,
    )

    assert "[DOCENTE]: Quais são os pontos fortes dela?" in prompt
    assert "[SUPERDOTT]: Os pontos fortes são liderança e criatividade." in prompt
    assert "E como usar isso em matemática?" in prompt


@pytest.mark.parametrize(
    "history, question, expected_snippets",
    [
        (
            [{"role": "user", "content": "Olá"}, {"role": "assistant", "content": "Oi!"}],
            "Como vai?",
            ["[DOCENTE]: Olá", "[SUPERDOTT]: Oi!", "Como vai?"],
        ),
        ([], "Pergunta direta", ["Pergunta direta"]),
    ],
)
def test_build_prompt_varios_cenarios(history, question, expected_snippets):
    """Testa múltiplos cenários do build_prompt."""
    from src.rag.prompt import build_prompt

    prompt = build_prompt(question=question, chunks=[], history=history)

    for snippet in expected_snippets:
        assert snippet in prompt
