import uuid
from datetime import datetime, timezone, timedelta
from unittest.mock import AsyncMock, MagicMock, patch
import pytest
from httpx import AsyncClient
from sqlmodel import select, text
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.pool import NullPool

from tests.conftest import TEST_DATABASE_URL
from src.models.chat_message import ChatMessage
from src.models.chat_session import ChatSession
from src.models.audit_log import AuditLog, AuditAction

test_engine = create_async_engine(TEST_DATABASE_URL, poolclass=NullPool)

@pytest.fixture()
async def populate_chat_messages(chat_student_id):
    """Insere sessão e mensagens no banco de testes para o aluno."""
    session_id = uuid.uuid4()
    
    async with AsyncSession(test_engine) as session:
        # Criar sessão de chat
        # User 9999 é o SuperAdmin mockado injetado em conftest.py
        chat_session = ChatSession(
            id=session_id,
            student_id=uuid.UUID(chat_student_id),
            user_id=9999,
            created_at=datetime.utcnow() - timedelta(days=5)
        )
        session.add(chat_session)
        await session.commit()
        
        # Criar mensagens
        msg1 = ChatMessage(
            session_id=session_id,
            role="user",
            content="Olá, gostaria de saber quais adaptações usar com o aluno em matemática.",
            created_at=datetime.utcnow() - timedelta(days=4)
        )
        msg2 = ChatMessage(
            session_id=session_id,
            role="assistant",
            content="Olá! Para o aluno em matemática, recomendo adaptações curriculares como jogos de lógica e aprofundamento em álgebra.",
            created_at=datetime.utcnow() - timedelta(days=3)
        )
        session.add(msg1)
        session.add(msg2)
        await session.commit()

    yield session_id

    # Limpeza (Teardown)
    async with AsyncSession(test_engine) as session:
        try:
            await session.exec(text("DELETE FROM chat_messages WHERE session_id = :sid"), {"sid": str(session_id)})
            await session.exec(text("DELETE FROM chat_sessions WHERE id = :sid"), {"sid": str(session_id)})
            await session.commit()
        except Exception:
            pass


@pytest.mark.asyncio
async def test_export_pdi_success(async_client: AsyncClient, chat_student_id: str, populate_chat_messages):
    """
    Testa a rota de exportação com sucesso.
    Garante que o PDF retornado comece com a assinatura '%PDF' e registre na auditoria.
    """
    start_str = (datetime.utcnow() - timedelta(days=10)).strftime("%Y-%m-%d")
    end_str = (datetime.utcnow() + timedelta(days=2)).strftime("%Y-%m-%d")

    with patch("src.api.services.pdi_service.PdiService.synthesize_pdi_with_gemini", new_callable=AsyncMock, return_value="### 1. Resumo Pedagógico\nAluno demonstra altas habilidades em matemática."):
        response = await async_client.get(
            f"/api/students/{chat_student_id}/export-pdi",
            params={
                "start_date": start_str,
                "end_date": end_str,
                "include_curriculum": True,
                "include_methodologies": True,
                "omit_informal": True
            }
        )

    # Asserções
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert "attachment; filename=pdi_" in response.headers["content-disposition"]
    assert response.content.startswith(b"%PDF")  # Cabeçalho válido de arquivo PDF

    # Verificar registro na trilha de auditoria (AuditLog)
    async with AsyncSession(test_engine) as session:
        result = await session.exec(
            select(AuditLog).where(
                AuditLog.target_student_id == uuid.UUID(chat_student_id),
                AuditLog.action == AuditAction.PDI_GENERATED
            )
        )
        logs = result.all()
    
    assert len(logs) >= 1
    assert logs[0].details["include_curriculum"] is True
    assert logs[0].details["omit_informal"] is True


@pytest.mark.asyncio
async def test_export_pdi_no_messages_returns_400(async_client: AsyncClient, chat_student_id: str):
    """
    Se tentarmos exportar um período que não possui interações registradas, deve retornar 400.
    """
    start_str = "2020-01-01"
    end_str = "2020-01-10"

    response = await async_client.get(
        f"/api/students/{chat_student_id}/export-pdi",
        params={
            "start_date": start_str,
            "end_date": end_str
        }
    )

    assert response.status_code == 400
    assert "Nenhuma interação pedagógica encontrada" in response.json()["detail"]


@pytest.mark.asyncio
async def test_export_pdi_invalid_dates_returns_400(async_client: AsyncClient, chat_student_id: str):
    """
    Formatos inválidos de data devem retornar erro 400.
    """
    response = await async_client.get(
        f"/api/students/{chat_student_id}/export-pdi",
        params={
            "start_date": "data-invalida",
            "end_date": "2026-05-31"
        }
    )
    assert response.status_code == 400
    assert "Formato de data inicial inválido" in response.json()["detail"]
