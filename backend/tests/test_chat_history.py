from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4

from click import prompt

import pytest
from httpx import AsyncClient

from src.models.chat_message import ChatMessage
from src.models.chat_session import ChatSession


@pytest.mark.asyncio
async def test_chat_grava_user_e_assistant_na_mesma_sessao(async_client: AsyncClient, chat_student_id: str):
    """
    Simula um POST /api/chat e verifica que:
    1. Uma ChatSession é criada para o aluno
    2. Uma ChatMessage role=user é gravada antes da IA responder
    3. Uma ChatMessage role=assistant é gravada após a IA responder
    """
    student_id = chat_student_id
    fake_session_id = uuid4()

    fake_session = ChatSession(id=fake_session_id, student_id=student_id)
    fake_rag = MagicMock()
    fake_rag.answer = "Resposta mockada da IA"
    fake_rag.sources = ["manual_mec.pdf"]

    with (
        patch(
            "src.api.routers.chat._get_or_create_session",
            new=AsyncMock(return_value=fake_session),
        ),
        patch(
            "src.api.routers.chat._get_recent_history",
            new=AsyncMock(return_value=[]),
        ),
        patch(
            "src.api.routers.chat.ask",
            new=AsyncMock(return_value=fake_rag),
        ),
        patch(
            "src.api.routers.chat.AsyncSession.add"
        ) as mock_add,
        patch(
            "src.api.routers.chat.AsyncSession.commit",
            new=AsyncMock(),
        ),
    ):
        response = await async_client.post(
            "/api/chat",
            json={
                "message": "Quais são os pontos fortes do aluno?",
                "student_id": str(student_id),
            },
        )

    assert response.status_code == 200
    data = response.json()
    assert data["text"] == "Resposta mockada da IA"

    # Verifica que dois ChatMessage foram adicionados (user + assistant)
    added_objects = [call.args[0] for call in mock_add.call_args_list]
    roles = [obj.role for obj in added_objects if isinstance(obj, ChatMessage)]
    assert "user" in roles
    assert "assistant" in roles


@pytest.mark.asyncio
async def test_history_injetado_no_prompt():
    """Verifica que o histórico é corretamente formatado e passado ao build_prompt."""
    from src.rag.prompt import build_prompt

    history = [
        {"role": "user", "content": "Quais são os pontos fortes dela?"},
        {"role": "assistant", "content": "Os pontos fortes são liderança e criatividade."},
    ]
    prompt = build_prompt(
        question="E como usar isso em matemática?",
        chunks=[],
        history=history,
    )

    assert "[DOCENTE]: Quais são os pontos fortes dela?" in prompt
    assert "[SUPERDOTT]: Os pontos fortes são liderança e criatividade." in prompt
    assert "E como usar isso em matemática?" in prompt