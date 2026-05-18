# backend/tests/test_dashboard.py

import pytest
from httpx import AsyncClient
from sqlmodel import select, text
from sqlmodel.ext.asyncio.session import AsyncSession
from src.models.user import User, UserRole
from src.main import app
from src.api.deps import get_current_user
from tests.conftest import TEST_DATABASE_URL
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.pool import NullPool

test_engine = create_async_engine(TEST_DATABASE_URL, poolclass=NullPool)

@pytest.mark.asyncio
async def test_dashboard_diretor_metrics(async_client: AsyncClient):
    """GET /api/dashboard/summary deve retornar métricas de Diretor."""
    async def override_director():
        return User(id=9999, email="director@test.com", hashed_password="hashed", role=UserRole.Diretor, is_active=True)

    app.dependency_overrides[get_current_user] = override_director

    try:
        response = await async_client.get("/api/dashboard/summary")
        assert response.status_code == 200
        data = response.json()
        assert data["role"] == UserRole.Diretor
        assert "total_students" in data["metrics"]
        assert "active_teachers" in data["metrics"]
        assert "pdis_generated_month" in data["metrics"]
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_dashboard_professor_metrics_and_students(async_client: AsyncClient, chat_student_id: str):
    """GET /api/dashboard/summary deve retornar alunos e alertas para o Professor."""
    async def override_teacher():
        return User(id=9999, email="teacher@test.com", hashed_password="hashed", role=UserRole.Professor, is_active=True)

    app.dependency_overrides[get_current_user] = override_teacher

    try:
        response = await async_client.get("/api/dashboard/summary")
        assert response.status_code == 200
        data = response.json()
        assert data["role"] == UserRole.Professor
        assert "total_students" in data["metrics"]
        assert "pending_pdis" in data["metrics"]
        
        # O aluno chat_student_id deve estar na lista de recent_students
        student_ids = [s["id"] for s in data["recent_students"]]
        assert chat_student_id in student_ids

        # Como o aluno novo não tem PDI, deve haver um alerta pendente para ele
        pending_alerts_student_ids = [a["student_id"] for a in data["alerts"] if a["type"] == "pdi_pending"]
        assert chat_student_id in pending_alerts_student_ids
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_dashboard_pai_metrics_and_children(async_client: AsyncClient, chat_student_id: str):
    """GET /api/dashboard/summary deve retornar filhos vinculados e status de triagem para o Pai."""
    async def override_parent():
        return User(id=9999, email="parent@test.com", hashed_password="hashed", role=UserRole.Pai, is_active=True)

    app.dependency_overrides[get_current_user] = override_parent

    # Vincular pai de ID 9999 ao aluno chat_student_id
    async with AsyncSession(test_engine) as session:
        await session.exec(
            text("INSERT INTO parent_student_links (parent_id, student_id) VALUES (9999, :student_id) ON CONFLICT DO NOTHING"),
            params={"student_id": chat_student_id},
        )
        await session.commit()

    try:
        response = await async_client.get("/api/dashboard/summary")
        assert response.status_code == 200
        data = response.json()
        assert data["role"] == UserRole.Pai
        assert data["metrics"]["linked_children"] == 1
        
        # O filho deve aparecer na lista
        student_ids = [s["id"] for s in data["recent_students"]]
        assert chat_student_id in student_ids

        # Como não tem respostas de triagem ainda, o status de triagem deve ser incomplete e haver alerta
        child_data = data["recent_students"][0]
        assert child_data["triage"]["completed"] is False
        assert any(a["type"] == "triage_pending" and a["student_id"] == chat_student_id for a in data["alerts"])
    finally:
        # Desvincular
        async with AsyncSession(test_engine) as session:
            await session.exec(
                text("DELETE FROM parent_student_links WHERE parent_id = 9999 AND student_id = :student_id"),
                params={"student_id": chat_student_id},
            )
            await session.commit()
        app.dependency_overrides.clear()
