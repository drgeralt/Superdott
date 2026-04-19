"""
tests/test_assessment.py
------------------------
Testes de integração para os endpoints da Task 3. (Versão Assíncrona)
"""

import uuid
from datetime import UTC, datetime, timedelta

import pytest
from httpx import AsyncClient, ASGITransport
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import text

from src.main import app
from src.core.database import engine, get_session

# ---------------------------------------------------------------------------
# Setup: sobrescreve a dependency de banco para usar a sessão de teste
# ---------------------------------------------------------------------------

async def override_get_session():
    """Abre uma sessão de teste isolada e assíncrona."""
    async with AsyncSession(engine) as session:
        yield session

app.dependency_overrides[get_session] = override_get_session

@pytest.fixture()
async def client():
    """Gera um cliente de testes assíncrono (httpx) fresco para cada requisição."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as ac:
        yield ac

# ---------------------------------------------------------------------------
# Fixtures: criam dados de teste no banco e limpam depois
# ---------------------------------------------------------------------------

@pytest.fixture()
async def db_session():
    """Sessão de banco assíncrona disponível nos testes."""
    async with AsyncSession(engine) as session:
        yield session

@pytest.fixture()
async def sample_student(db_session: AsyncSession):
    """Cria um aluno de teste e retorna seu ID."""
    student_id = str(uuid.uuid4())
    await db_session.exec(
        text("INSERT INTO students (id, full_name, email) VALUES (:id, :name, :email)"),
        params={
            "id": student_id,
            "name": "Aluno Teste Silva",
            "email": f"teste_{student_id[:8]}@escola.com",
        },
    )
    await db_session.commit()
    yield student_id
    
    # Limpeza após o teste
    await db_session.exec(text("DELETE FROM students WHERE id = :id"), params={"id": student_id})
    await db_session.commit()

@pytest.fixture()
async def sample_assessment(db_session: AsyncSession):
    """Cria um questionário de teste e retorna seu ID."""
    assessment_id = str(uuid.uuid4())
    await db_session.exec(
        text("INSERT INTO assessments (id, title, subject) VALUES (:id, :title, :subject)"),
        params={
            "id": assessment_id,
            "title": "Triagem Renzulli 2026",
            "subject": "Avaliação Geral",
        },
    )
    await db_session.commit()
    yield assessment_id
    
    await db_session.exec(text("DELETE FROM assessments WHERE id = :id"), params={"id": assessment_id})
    await db_session.commit()

@pytest.fixture()
async def valid_token(db_session: AsyncSession, sample_student, sample_assessment):
    """Cria um token válido (não usado, não expirado) e retorna seu valor."""
    token_value = f"test_token_{uuid.uuid4().hex[:16]}"
    expires = datetime.now(UTC) + timedelta(days=7)

    await db_session.exec(
        text("INSERT INTO tokens (token, student_id, assessment_id, is_used, expires_at) VALUES (:token, :student_id, :assessment_id, FALSE, :expires_at)"),
        params={
            "token": token_value,
            "student_id": sample_student,
            "assessment_id": sample_assessment,
            "expires_at": expires,
        },
    )
    await db_session.commit()
    yield token_value
    
    await db_session.exec(text("DELETE FROM tokens WHERE token = :token"), params={"token": token_value})
    await db_session.commit()

@pytest.fixture()
async def used_token(db_session: AsyncSession, sample_student, sample_assessment):
    """Cria um token JÁ UTILIZADO (para testar rejeição)."""
    token_value = f"used_token_{uuid.uuid4().hex[:16]}"
    await db_session.exec(
        text("INSERT INTO tokens (token, student_id, assessment_id, is_used) VALUES (:token, :student_id, :assessment_id, TRUE)"),
        params={
            "token": token_value,
            "student_id": sample_student,
            "assessment_id": sample_assessment,
        },
    )
    await db_session.commit()
    yield token_value
    
    await db_session.exec(text("DELETE FROM tokens WHERE token = :token"), params={"token": token_value})
    await db_session.commit()

@pytest.fixture()
async def expired_token(db_session: AsyncSession, sample_student, sample_assessment):
    """Cria um token EXPIRADO (expires_at no passado)."""
    token_value = f"expired_token_{uuid.uuid4().hex[:16]}"
    past = datetime.now(UTC) - timedelta(days=1)
    await db_session.exec(
        text("INSERT INTO tokens (token, student_id, assessment_id, is_used, expires_at) VALUES (:token, :student_id, :assessment_id, FALSE, :expires_at)"),
        params={
            "token": token_value,
            "student_id": sample_student,
            "assessment_id": sample_assessment,
            "expires_at": past,
        },
    )
    await db_session.commit()
    yield token_value
    
    await db_session.exec(text("DELETE FROM tokens WHERE token = :token"), params={"token": token_value})
    await db_session.commit()

# ---------------------------------------------------------------------------
# Testes: GET /api/assessment/{token}
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
class TestGetAssessment:
    async def test_retorna_contexto_com_token_valido(self, valid_token, client: AsyncClient):
        response = await client.get(f"/api/assessment/{valid_token}")

        assert response.status_code == 200
        data = response.json()

        assert data["token"] == valid_token
        assert data["student_name"] == "Aluno Teste Silva"
        assert "student_id" in data
        assert "assessment_id" in data
        assert data["assessment_title"] == "Triagem Renzulli 2026"

    async def test_retorna_404_para_token_inexistente(self, client: AsyncClient):
        response = await client.get("/api/assessment/token_que_nao_existe_xyz")
        assert response.status_code == 404

    async def test_retorna_410_para_token_ja_usado(self, used_token, client: AsyncClient):
        response = await client.get(f"/api/assessment/{used_token}")
        assert response.status_code == 410
        assert "utilizado" in response.json()["detail"].lower()

    async def test_retorna_410_para_token_expirado(self, expired_token, client: AsyncClient):
        response = await client.get(f"/api/assessment/{expired_token}")
        assert response.status_code == 410
        assert "expirado" in response.json()["detail"].lower()

# ---------------------------------------------------------------------------
# Testes: POST /api/assessment/{token}/submit
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
class TestSubmitAssessment:
    async def test_submissao_salva_respostas_e_invalida_token(self, valid_token, db_session: AsyncSession, client: AsyncClient):
        payload = [
            {"content_text": "Demonstra interesse elevado em matemática.", "score": 9.0},
            {"content_text": "Lidera projetos em sala de aula.", "score": 8.0},
            {"content_text": "Criatividade acima da média.", "score": 7.0},
        ]

        response = await client.post(f"/api/assessment/{valid_token}/submit", json=payload)

        assert response.status_code == 201
        data = response.json()

        assert data["overall_score"] == 8.0
        assert data["answers_saved"] == 3
        assert "concluída" in data["message"].lower()

        # Confirma que o token foi marcado como usado no banco
        result = await db_session.exec(
            text("SELECT is_used, used_at FROM tokens WHERE token = :token"),
            params={"token": valid_token},
        )
        row = result.fetchone()
        
        assert row[0] is True
        assert row[1] is not None

    async def test_submissao_com_respostas_qualitativas_sem_score(self, valid_token, client: AsyncClient):
        payload = [
            {"content_text": "Observação sem nota numérica."},
            {"content_text": "Outra observação qualitativa."},
        ]
        response = await client.post(f"/api/assessment/{valid_token}/submit", json=payload)
        assert response.status_code == 201
        assert response.json()["overall_score"] is None

    async def test_segundo_submit_com_mesmo_token_e_rejeitado(self, valid_token, client: AsyncClient):
        payload = [{"content_text": "Primeira submissão.", "score": 5.0}]

        r1 = await client.post(f"/api/assessment/{valid_token}/submit", json=payload)
        assert r1.status_code == 201

        r2 = await client.post(f"/api/assessment/{valid_token}/submit", json=payload)
        assert r2.status_code == 410

    async def test_submit_com_token_inexistente_retorna_404(self, client: AsyncClient):
        payload = [{"content_text": "Resposta qualquer.", "score": 5.0}]
        response = await client.post("/api/assessment/token_falso_xyz/submit", json=payload)
        assert response.status_code == 404

    async def test_submit_sem_respostas_retorna_422(self, valid_token, client: AsyncClient):
        response = await client.post(f"api/assessment/{valid_token}/submit", json=[])
        assert response.status_code == 422
