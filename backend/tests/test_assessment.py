"""
tests/test_assessment.py
------------------------
Testes de integração para os endpoints da Task 3.

Estratégia:
  - Usamos um banco PostgreSQL de teste (mesmo schema, dados isolados).
  - Cada teste cria seus próprios dados e limpa ao final (via fixture).
  - TestClient do FastAPI simula requests HTTP sem precisar subir servidor.

Como rodar:
    pytest tests/test_assessment.py -v
"""

import uuid
from datetime import datetime, timedelta, timezone
from decimal import Decimal

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, text

from main import app
from src.core.database import engine, get_session

# ---------------------------------------------------------------------------
# Setup: sobrescreve a dependency de banco para usar a sessão de teste
# ---------------------------------------------------------------------------

def override_get_session():
    """
    Abre uma sessão de teste isolada.
    Cada teste recebe uma sessão limpa — sem interferência entre testes.
    """
    with Session(engine) as session:
        yield session


app.dependency_overrides[get_session] = override_get_session

client = TestClient(app)


# ---------------------------------------------------------------------------
# Fixtures: criam dados de teste no banco e limpam depois
# ---------------------------------------------------------------------------

@pytest.fixture()
def db_session():
    """Sessão de banco disponível nos testes que precisam inserir dados direto."""
    with Session(engine) as session:
        yield session


@pytest.fixture()
def sample_student(db_session: Session):
    """Cria um aluno de teste e retorna seu ID."""
    student_id = str(uuid.uuid4())
    db_session.exec(
        text(
            "INSERT INTO students (id, full_name, email) "
            "VALUES (:id, :name, :email)"
        ),
        params={
            "id": student_id,
            "name": "Aluno Teste Silva",
            "email": f"teste_{student_id[:8]}@escola.com",
        },
    )
    db_session.commit()
    yield student_id
    # Limpeza após o teste
    db_session.exec(text("DELETE FROM students WHERE id = :id"), params={"id": student_id})
    db_session.commit()


@pytest.fixture()
def sample_assessment(db_session: Session):
    """Cria um questionário de teste e retorna seu ID."""
    assessment_id = str(uuid.uuid4())
    db_session.exec(
        text(
            "INSERT INTO assessments (id, title, subject) "
            "VALUES (:id, :title, :subject)"
        ),
        params={
            "id": assessment_id,
            "title": "Triagem Renzulli 2026",
            "subject": "Avaliação Geral",
        },
    )
    db_session.commit()
    yield assessment_id
    db_session.exec(text("DELETE FROM assessments WHERE id = :id"), params={"id": assessment_id})
    db_session.commit()


@pytest.fixture()
def valid_token(db_session: Session, sample_student, sample_assessment):
    """Cria um token válido (não usado, não expirado) e retorna seu valor."""
    token_value = f"test_token_{uuid.uuid4().hex[:16]}"
    expires = datetime.now(timezone.utc) + timedelta(days=7)

    db_session.exec(
        text(
            "INSERT INTO tokens (token, student_id, assessment_id, is_used, expires_at) "
            "VALUES (:token, :student_id, :assessment_id, FALSE, :expires_at)"
        ),
        params={
            "token": token_value,
            "student_id": sample_student,
            "assessment_id": sample_assessment,
            "expires_at": expires,
        },
    )
    db_session.commit()
    yield token_value
    # Limpeza (cascade deleta answers também)
    db_session.exec(text("DELETE FROM tokens WHERE token = :token"), params={"token": token_value})
    db_session.commit()


@pytest.fixture()
def used_token(db_session: Session, sample_student, sample_assessment):
    """Cria um token JÁ UTILIZADO (para testar rejeição)."""
    token_value = f"used_token_{uuid.uuid4().hex[:16]}"
    db_session.exec(
        text(
            "INSERT INTO tokens (token, student_id, assessment_id, is_used) "
            "VALUES (:token, :student_id, :assessment_id, TRUE)"
        ),
        params={
            "token": token_value,
            "student_id": sample_student,
            "assessment_id": sample_assessment,
        },
    )
    db_session.commit()
    yield token_value
    db_session.exec(text("DELETE FROM tokens WHERE token = :token"), params={"token": token_value})
    db_session.commit()


@pytest.fixture()
def expired_token(db_session: Session, sample_student, sample_assessment):
    """Cria um token EXPIRADO (expires_at no passado)."""
    token_value = f"expired_token_{uuid.uuid4().hex[:16]}"
    past = datetime.now(timezone.utc) - timedelta(days=1)
    db_session.exec(
        text(
            "INSERT INTO tokens (token, student_id, assessment_id, is_used, expires_at) "
            "VALUES (:token, :student_id, :assessment_id, FALSE, :expires_at)"
        ),
        params={
            "token": token_value,
            "student_id": sample_student,
            "assessment_id": sample_assessment,
            "expires_at": past,
        },
    )
    db_session.commit()
    yield token_value
    db_session.exec(text("DELETE FROM tokens WHERE token = :token"), params={"token": token_value})
    db_session.commit()


# ---------------------------------------------------------------------------
# Testes: GET /assessment/{token}
# ---------------------------------------------------------------------------

class TestGetAssessment:

    def test_retorna_contexto_com_token_valido(self, valid_token):
        """Cenário feliz: token válido retorna dados do aluno e do questionário."""
        response = client.get(f"/assessment/{valid_token}")

        assert response.status_code == 200
        data = response.json()

        # Verifica campos essenciais na resposta
        assert data["token"] == valid_token
        assert data["student_name"] == "Aluno Teste Silva"
        assert "student_id" in data
        assert "assessment_id" in data
        assert data["assessment_title"] == "Triagem Renzulli 2026"

    def test_retorna_404_para_token_inexistente(self):
        """Token que não existe no banco deve retornar 404."""
        response = client.get("/assessment/token_que_nao_existe_xyz")
        assert response.status_code == 404

    def test_retorna_410_para_token_ja_usado(self, used_token):
        """Token já utilizado deve retornar 410 Gone (não 404)."""
        response = client.get(f"/assessment/{used_token}")
        assert response.status_code == 410
        assert "utilizado" in response.json()["detail"].lower()

    def test_retorna_410_para_token_expirado(self, expired_token):
        """Token expirado deve retornar 410 Gone."""
        response = client.get(f"/assessment/{expired_token}")
        assert response.status_code == 410
        assert "expirou" in response.json()["detail"].lower()


# ---------------------------------------------------------------------------
# Testes: POST /assessment/{token}/submit
# ---------------------------------------------------------------------------

class TestSubmitAssessment:

    def test_submissao_salva_respostas_e_invalida_token(self, valid_token, db_session: Session):
        """
        Cenário principal:
          1. Envia respostas com scores.
          2. Verifica que o score calculado está correto.
          3. Verifica que o token foi invalidado no banco.
        """
        payload = [
            {"content_text": "Demonstra interesse elevado em matemática.", "score": 9.0},
            {"content_text": "Lidera projetos em sala de aula.", "score": 8.0},
            {"content_text": "Criatividade acima da média.", "score": 7.0},
        ]

        response = client.post(f"/assessment/{valid_token}/submit", json=payload)

        assert response.status_code == 201
        data = response.json()

        # Score esperado: (9 + 8 + 7) / 3 = 8.0
        assert data["overall_score"] == 8.0
        assert data["answers_saved"] == 3
        assert "invalidado" in data["message"].lower()

        # Confirma que o token foi marcado como usado no banco
        row = db_session.exec(
            text("SELECT is_used, used_at FROM tokens WHERE token = :token"),
            params={"token": valid_token},
        ).fetchone()

        assert row[0] is True   # is_used = TRUE
        assert row[1] is not None  # used_at foi preenchido

    def test_submissao_com_respostas_qualitativas_sem_score(self, valid_token):
        """Respostas sem score numérico são aceitas; overall_score será None."""
        payload = [
            {"content_text": "Observação sem nota numérica."},
            {"content_text": "Outra observação qualitativa."},
        ]

        response = client.post(f"/assessment/{valid_token}/submit", json=payload)

        assert response.status_code == 201
        data = response.json()
        assert data["overall_score"] is None
        assert data["answers_saved"] == 2

    def test_segundo_submit_com_mesmo_token_e_rejeitado(self, valid_token):
        """
        Garante que após uma submissão bem-sucedida,
        o mesmo token NÃO pode ser usado uma segunda vez.
        """
        payload = [{"content_text": "Primeira submissão.", "score": 5.0}]

        # Primeira submissão — deve funcionar
        r1 = client.post(f"/assessment/{valid_token}/submit", json=payload)
        assert r1.status_code == 201

        # Segunda submissão com o mesmo token — deve ser rejeitada
        r2 = client.post(f"/assessment/{valid_token}/submit", json=payload)
        assert r2.status_code == 410

    def test_submit_com_token_inexistente_retorna_404(self):
        """Token inválido no POST também retorna 404."""
        payload = [{"content_text": "Resposta qualquer.", "score": 5.0}]
        response = client.post("/assessment/token_falso_xyz/submit", json=payload)
        assert response.status_code == 404

    def test_submit_sem_respostas_retorna_422(self, valid_token):
        """Body vazio deve retornar 422 Unprocessable Entity."""
        response = client.post(f"/assessment/{valid_token}/submit", json=[])
        assert response.status_code == 422