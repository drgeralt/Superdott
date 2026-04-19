"""
tests/test_chat.py
------------------
Testa a rota POST /api/chat COM MOCK do Gemini.

Por que usar mock?
  Sem mock, o teste:
    - Precisaria de internet
    - Gastaria cota da API do Google
    - Poderia falhar por instabilidade da rede (flaky test)
    - Levaria segundos em vez de milissegundos

  Com mock, interceptamos a chamada ao Gemini e
  retornamos uma resposta falsa e previsível.
  O teste valida o CONTRATO da API, não a IA em si.

Como o mock funciona:
  unittest.mock.patch substitui temporariamente a função
  'ask' do pipeline RAG por uma função fake que retorna
  uma resposta estática — sem tocar na internet.
"""

import uuid
from unittest.mock import AsyncMock, patch

import pytest
from httpx import AsyncClient
from sqlmodel.ext.asyncio.session import AsyncSession


# ─── Resposta fake que o mock vai retornar ────────────────────────────────────
class FakeRAGResponse:
    """Simula o objeto de resposta do pipeline RAG."""
    answer = "Mocked AI Response: aluno demonstra altas habilidades."
    sources = ["manual_mec.pdf"]


# ─── Fixture: cria um student_id válido no banco de teste ────────────────────
async def _criar_aluno_para_chat(session: AsyncSession) -> uuid.UUID:
    """O endpoint /api/chat exige um student_id válido no banco."""
    from src.models.student import Student

    aluno = Student(
        full_name="Aluno Chat Teste",
        email=f"chat_{uuid.uuid4().hex[:6]}@escola.com",
    )
    session.add(aluno)
    await session.commit()
    await session.refresh(aluno)
    return aluno.id


# ─── Testes ──────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_chat_retorna_200_com_mock(
    async_client: AsyncClient,
    db_session: AsyncSession,
):
    """
    POST /api/chat deve retornar HTTP 200.
    O Gemini é mockado — sem internet, sem cota.
    """
    student_id = await _criar_aluno_para_chat(db_session)

    # patch intercepta 'ask' antes de chamar o Gemini
    with patch(
        "src.api.routers.chat.ask",
        new_callable=AsyncMock,
        return_value=FakeRAGResponse(),
    ):
        response = await async_client.post(
            "/api/chat",
            json={
                "message": "Como identificar altas habilidades?",
                "student_id": str(student_id),
                "student_context": {
                    "name": "Aluno Teste",
                    "scores": {"intelectual": 8, "criatividade": 9},
                },
            },
        )

    assert response.status_code == 200


@pytest.mark.asyncio
async def test_chat_retorna_campo_text(
    async_client: AsyncClient,
    db_session: AsyncSession,
):
    """
    POST /api/chat deve retornar JSON com campo 'text'.
    Valida o contrato da API — se renomear 'text' para 'response', FALHA.
    """
    student_id = await _criar_aluno_para_chat(db_session)

    with patch(
        "src.api.routers.chat.ask",
        new_callable=AsyncMock,
        return_value=FakeRAGResponse(),
    ):
        response = await async_client.post(
            "/api/chat",
            json={
                "message": "Quais atividades recomendar?",
                "student_id": str(student_id),
            },
        )

    data = response.json()
    assert "text" in data        # ← contrato: campo 'text' deve existir
    assert "sources" in data     # ← contrato: campo 'sources' deve existir
    assert isinstance(data["sources"], list)


@pytest.mark.asyncio
async def test_chat_resposta_vem_do_mock(
    async_client: AsyncClient,
    db_session: AsyncSession,
):
    """
    Verifica que o texto retornado é exatamente o que o mock retorna.
    Confirma que o mock está interceptando corretamente.
    """
    student_id = await _criar_aluno_para_chat(db_session)

    with patch(
        "src.api.routers.chat.ask",
        new_callable=AsyncMock,
        return_value=FakeRAGResponse(),
    ):
        response = await async_client.post(
            "/api/chat",
            json={
                "message": "Teste de mock",
                "student_id": str(student_id),
            },
        )

    data = response.json()
    assert data["text"] == FakeRAGResponse.answer
