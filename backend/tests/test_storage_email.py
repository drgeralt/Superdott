# tests/test_storage_email.py
"""
Testes de integração com mocks para StorageService e EmailService.
Nenhum tráfego real para R2 ou Resend é gerado.
Não precisam de banco de dados — usam apenas mocks em memória.
"""
import pytest
from unittest.mock import patch, MagicMock

from src.api.services.storage_service import StorageService
from src.api.services.email_service import send_invitation_email
from src.api.services import email_service

# StorageService

@pytest.mark.asyncio(loop_scope="function")
@pytest.mark.no_db  # sinaliza que não precisa de banco
async def test_storage_upload_mock_retorna_key():
    key = await StorageService.upload_file(
        file_bytes=b"conteudo-fake",
        key="pdi/uuid-teste/pdi_teste.pdf",
        content_type="application/pdf",
    )
    assert key == "pdi/uuid-teste/pdi_teste.pdf"


@pytest.mark.asyncio(loop_scope="function")
async def test_storage_presigned_url_mock_formato():
    url = await StorageService.generate_presigned_url(
        key="pdi/uuid-teste/pdi_teste.pdf",
        expiry_seconds=900,
    )
    assert "pdi/uuid-teste/pdi_teste.pdf" in url
    assert "expires_in=900" in url


@pytest.mark.asyncio(loop_scope="function")
async def test_storage_delete_mock():
    result = await StorageService.delete_file("pdi/uuid-teste/pdi_teste.pdf")
    assert result is True


def test_storage_build_pdi_key():
    key = StorageService.build_pdi_key("uuid-aluno-123", "pdi_joao.pdf")
    assert key == "pdi/uuid-aluno-123/pdi_joao.pdf"


# EmailService

@pytest.mark.asyncio(loop_scope="function")
async def test_email_simulado_em_modo_mock():
    result = await send_invitation_email(
        email_responsavel="pai@exemplo.com",
        nome_responsavel="João Silva",
        student_name="Ana Silva",
        turma="3A",
        code="SD-ABCD-1234",
        school_name="Escola Teste",
    )
    assert result is True


@pytest.mark.asyncio(loop_scope="function")
async def test_email_real_usa_resend_sdk():
    mock_settings = MagicMock()
    mock_settings.RESEND_API_KEY = "re_real_key_fake"
    mock_settings.RESEND_FROM_EMAIL = "noreply@superdott.com.br"
    mock_settings.ENV = "production"

    with patch("src.api.services.email_service.settings", mock_settings):
        with patch("resend.Emails.send", return_value={"id": "fake-id"}) as mock_send:
            result = await email_service.send_invitation_email(
                email_responsavel="pai@exemplo.com",
                nome_responsavel="João Silva",
                student_name="Ana Silva",
                turma="3A",
                code="SD-ABCD-1234",
                school_name="Escola Teste",
            )

    assert result is True
    mock_send.assert_called_once()
