import pytest
import uuid
from httpx import AsyncClient
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.pool import NullPool
from unittest.mock import AsyncMock, patch, MagicMock

from tests.conftest import TEST_DATABASE_URL
from src.models.user import User, UserRole
from src.models.document import Document, DocumentChunk
from src.rag.retriever import retrieve

test_engine = create_async_engine(TEST_DATABASE_URL, poolclass=NullPool)

@pytest.mark.asyncio
async def test_admin_upload_role_restrita(async_client: AsyncClient):
    """Garante que usuários comuns (Professor/Diretor) não acessem o endpoint de ingestão (HTTP 403)."""
    from src.api.deps import get_current_user
    from src.main import app

    async def override_get_current_user_director():
        return User(id=888, email="director@test.com", hashed_password="hashed", role=UserRole.Diretor, is_active=True)

    app.dependency_overrides[get_current_user] = override_get_current_user_director

    files = {"file": ("leis.pdf", b"%PDF-1.4 dummy", "application/pdf")}
    response = await async_client.post("/api/admin/knowledge-base/upload", files=files)
    
    assert response.status_code == 403
    assert "Você não tem permissão" in response.json()["detail"]
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_admin_upload_unsupported_type(async_client: AsyncClient):
    """Garante que formatos diferentes de PDF sejam rejeitados com HTTP 415."""
    from src.api.deps import get_current_user
    from src.main import app

    async def override_get_current_user_superadmin():
        return User(id=999, email="admin@test.com", hashed_password="hashed", role=UserRole.SuperAdmin, is_active=True)

    app.dependency_overrides[get_current_user] = override_get_current_user_superadmin

    files = {"file": ("leis.txt", b"dummy content", "text/plain")}
    response = await async_client.post("/api/admin/knowledge-base/upload", files=files)
    
    assert response.status_code == 415
    assert "Apenas arquivos PDF" in response.json()["detail"]
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_admin_upload_e_cascade_delete_sucesso(async_client: AsyncClient):
    """Garante a vetorização completa com mocks de Gemini API e exclusão em cascata."""
    from src.api.deps import get_current_user
    from src.main import app

    async def override_get_current_user_superadmin():
        return User(id=999, email="admin@test.com", hashed_password="hashed", role=UserRole.SuperAdmin, is_active=True)

    app.dependency_overrides[get_current_user] = override_get_current_user_superadmin

    # Mocking PyPDF extract_text e Gemini Embeddings
    dummy_pdf_content = b"%PDF-1.4 dummy"
    
    with patch("src.api.services.pdf_parser.PdfReader") as MockPdfReader, \
         patch("src.api.services.ingestion_service.client.models.embed_content") as MockEmbedContent:
        
        # Mocking PDF text extraction
        mock_page = MagicMock()
        mock_page.extract_text.return_value = "Resolução do MEC nº 25 de 2026. Ensino inclusivo é um direito fundamental de todas as crianças e jovens neurodivergentes."
        
        mock_reader = MagicMock()
        mock_reader.pages = [mock_page]
        MockPdfReader.return_value = mock_reader

        # Mocking Gemini response using list/dict compatible structure for extract_floats
        mock_emb_res = MagicMock()
        mock_emb_res.embeddings = [[0.1] * 3072]
        MockEmbedContent.return_value = mock_emb_res

        # Executando Upload
        files = {"file": ("normas_mec_2026.pdf", dummy_pdf_content, "application/pdf")}
        response = await async_client.post("/api/admin/knowledge-base/upload", files=files)

        assert response.status_code == 200
        res_data = response.json()
        assert res_data["success"] is True
        assert res_data["nome"] == "normas_mec_2026.pdf"
        assert res_data["chunks_created"] == 1
        
        doc_id = uuid.UUID(res_data["id"])

        # Verifica persistência no banco de teste
        async with AsyncSession(test_engine) as session:
            doc_db = await session.get(Document, doc_id)
            assert doc_db is not None
            assert doc_db.nome == "normas_mec_2026.pdf"

            chunks_res = await session.exec(select(DocumentChunk).where(DocumentChunk.document_id == doc_id))
            chunks = chunks_res.all()
            assert len(chunks) == 1
            assert "Resolução do MEC" in chunks[0].conteudo_texto
            
            # Testa a exclusão em cascata
            await session.delete(doc_db)
            await session.commit()

            # Checa se o chunk foi excluído em cascata no banco
            chunks_after_res = await session.exec(select(DocumentChunk).where(DocumentChunk.document_id == doc_id))
            assert len(chunks_after_res.all()) == 0

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_rag_retriever_unificado():
    """Garante que a função retrieve() busque de forma unificada e incorpore novos documentos indexados no banco de teste."""
    async with AsyncSession(test_engine) as session:
        # Inserindo documento teste
        doc = Document(nome="Lei Inclusao Teste.pdf")
        session.add(doc)
        await session.flush()

        # Inserindo chunks vetoriais correspondentes com embedding dummy
        chunk = DocumentChunk(
            document_id=doc.id,
            conteudo_texto="O Superdott é a principal ferramenta de aceleração para inclusão escolar de autistas no Brasil.",
            embedding=[0.5] * 3072
        )
        session.add(chunk)
        await session.commit()

        # Executando a busca no retriever apontando o DATABASE_URL para o banco de teste
        with patch("src.rag.retriever.settings") as mock_settings, \
             patch("src.rag.retriever.embed_query") as mock_embed_query:
            
            mock_settings.DATABASE_URL = TEST_DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")
            mock_embed_query.return_value = [0.5] * 3072
            
            results = await retrieve("Superdott inclusao autistas", top_k=5, similarity_threshold=0.1)
            
            # Validações
            assert len(results) > 0
            found = False
            for r in results:
                if r.source == "Lei Inclusao Teste.pdf":
                    found = True
                    assert "Superdott é a principal ferramenta" in r.content
            assert found is True

        # Limpeza
        await session.delete(doc)
        await session.commit()
