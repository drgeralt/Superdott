"""
Testes de integração para o pipeline de ingestão de documentos.
Verifica upload de PDF, extração, chunking, embedding e persistência.
"""

import io

import pytest
from httpx import AsyncClient
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from src.main import app
from src.models.knowledge_base import KnowledgeBase

# PDF de teste minimalista (PDF válido com texto)
MINIMAL_PDF = (
    b"%PDF-1.4\n"
    b"1 0 obj\n<</Type/Catalog/Pages 2 0 R>>\nendobj\n"
    b"2 0 obj\n<</Type/Pages/Kids[3 0 R]/Count 1>>\nendobj\n"
    b"3 0 obj\n<</Type/Page/Parent 2 0 R/Resources<<>>/MediaBox[0 0 612 792]/Contents 4 0 R>>\nendobj\n"
    b"4 0 obj\n<</Length 44>>\nstream\nBT /F1 12 Tf 100 700 Td (Teste de Documento) Tj ET\nendstream\nendobj\n"
    b"xref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\n0000000229 00000 n\n"
    b"trailer<</Size 5/Root 1 0 R>>\nstartxref\n327\n%%EOF"
)


@pytest.mark.asyncio
async def test_upload_pdf_success(async_client: AsyncClient):
    """Testa upload de PDF válido com status 200."""
    response = await async_client.post(
        "/api/documents/upload",
        files={"file": ("test.pdf", io.BytesIO(MINIMAL_PDF), "application/pdf")},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Documento ingerido e vetorizado com sucesso."
    assert data["filename"] == "test.pdf"
    assert data["chunks_created"] >= 1


@pytest.mark.asyncio
async def test_upload_invalid_format(async_client: AsyncClient):
    """Testa rejeição de arquivo não-PDF com status 415."""
    txt_content = "Este é um arquivo de texto, não PDF".encode()

    response = await async_client.post(
        "/api/documents/upload",
        files={"file": ("test.txt", io.BytesIO(txt_content), "text/plain")},
    )

    assert response.status_code == 415
    assert "PDF" in response.json()["detail"]


@pytest.mark.asyncio
async def test_upload_file_too_large(async_client: AsyncClient):
    """Testa rejeição de arquivo maior que 10MB."""
    large_file = b"X" * (11 * 1024 * 1024)  # 11MB

    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/api/documents/upload",
            files={"file": ("large.pdf", io.BytesIO(large_file), "application/pdf")},
        )

        assert response.status_code == 413
        assert "10MB" in response.json()["detail"]


@pytest.mark.asyncio
async def test_knowledge_base_populated_after_upload(
    async_client: AsyncClient, db_session: AsyncSession
):
    """Testa se chunks foram persistidos na tabela knowledge_base após upload."""
    response = await async_client.post(
        "/api/documents/upload",
        files={"file": ("test.pdf", io.BytesIO(MINIMAL_PDF), "application/pdf")},
    )

    assert response.status_code == 200

    # Verifica se registros foram inseridos no banco
    result = await db_session.exec(
        select(KnowledgeBase).where(KnowledgeBase.source == "test.pdf")
    )
    chunks = result.all()

    assert len(chunks) > 0
    assert all(chunk.embedding is not None for chunk in chunks)
    assert all(len(chunk.embedding) == 3072 for chunk in chunks)
