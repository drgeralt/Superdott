"""
Testa que as ações de vínculo/desvínculo registram entradas na tabela audit_logs.
"""
import uuid

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.pool import NullPool
from sqlmodel import text, select
from sqlmodel.ext.asyncio.session import AsyncSession

from tests.conftest import TEST_DATABASE_URL
from src.models.audit_log import AuditLog, AuditAction

test_engine = create_async_engine(TEST_DATABASE_URL, poolclass=NullPool)


@pytest.fixture()
async def audit_student_id():
    """Insere aluno isolado e limpa após o teste."""
    student_id = str(uuid.uuid4())
    async with AsyncSession(test_engine) as session:
        await session.exec(
            text("INSERT INTO students (id, full_name, email) VALUES (:id, :name, :email)"),
            params={
                "id": student_id,
                "name": "Aluno Auditoria",
                "email": f"audit_{student_id[:8]}@escola.com",
            },
        )
        await session.commit()

    yield student_id

    async with AsyncSession(test_engine) as session:
        try:
            await session.exec(
                text("DELETE FROM audit_logs WHERE target_student_id = :id"),
                params={"id": student_id},
            )
            await session.exec(
                text("DELETE FROM students WHERE id = :id"),
                params={"id": student_id},
            )
            await session.commit()
        except Exception:
            pass


@pytest.mark.asyncio
async def test_link_gera_audit_log(async_client: AsyncClient, audit_student_id: str):
    """POST /{student_id}/link deve inserir registro STUDENT_LINKED na audit_logs."""
    response = await async_client.post(f"/api/students/{audit_student_id}/link")
    assert response.status_code == 200

    # Aguarda o BackgroundTask completar
    import asyncio
    await asyncio.sleep(0.2)

    async with AsyncSession(test_engine) as session:
        result = await session.exec(
            select(AuditLog).where(
                AuditLog.target_student_id == uuid.UUID(audit_student_id),
                AuditLog.action == AuditAction.STUDENT_LINKED,
            )
        )
        logs = result.all()

    assert len(logs) == 1
    assert logs[0].user_id is not None
    assert logs[0].created_at is not None


@pytest.mark.asyncio
async def test_unlink_gera_audit_log(async_client: AsyncClient, audit_student_id: str):
    """DELETE /{student_id}/link deve inserir registro STUDENT_UNLINKED na audit_logs."""
    response = await async_client.delete(f"/api/students/{audit_student_id}/link")
    assert response.status_code == 200

    import asyncio
    await asyncio.sleep(0.2)

    async with AsyncSession(test_engine) as session:
        result = await session.exec(
            select(AuditLog).where(
                AuditLog.target_student_id == uuid.UUID(audit_student_id),
                AuditLog.action == AuditAction.STUDENT_UNLINKED,
            )
        )
        logs = result.all()

    assert len(logs) == 1


@pytest.mark.asyncio
async def test_audit_logs_nao_podem_ser_deletados_via_api(async_client: AsyncClient):
    """Nenhuma rota DELETE deve existir no router de audit-logs."""
    from src.api.routers.audit import router
    http_methods = {method for route in router.routes for method in route.methods}
    assert "DELETE" not in http_methods
    assert "PUT" not in http_methods
    assert "PATCH" not in http_methods


@pytest.mark.asyncio
async def test_audit_logs_get_retorna_lista(async_client: AsyncClient):
    """GET /api/audit-logs deve retornar HTTP 200 com lista."""
    response = await async_client.get("/api/audit-logs")
    assert response.status_code == 200
    assert isinstance(response.json(), list)