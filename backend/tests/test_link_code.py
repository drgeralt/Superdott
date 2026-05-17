import pytest
from httpx import AsyncClient
from datetime import datetime, timezone


@pytest.mark.asyncio
async def test_gerar_codigo_aluno_inexistente(async_client: AsyncClient):
    """Deve retornar 404 para aluno que não existe."""
    response = await async_client.post(
        "/api/students/00000000-0000-0000-0000-000000000000/link-code"
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_resgatar_codigo_invalido(async_client: AsyncClient):
    """Código inexistente deve retornar 400."""
    response = await async_client.post(
        "/api/students/redeem-code",
        json={"code": "SUP-XXXX-XX"},
    )
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_fluxo_completo(async_client: AsyncClient, db_session):
    """Gera um código e o resgata com sucesso."""
    from src.models.student import Student
    import uuid

    aluno = Student(
        full_name="Aluno Teste Link",
        email=f"link_{uuid.uuid4().hex[:6]}@teste.com",
    )
    db_session.add(aluno)
    await db_session.commit()
    await db_session.refresh(aluno)

    # Gera código
    response = await async_client.post(f"/api/students/{aluno.id}/link-code")
    assert response.status_code == 200
    codigo = response.json()["code"]
    assert codigo.startswith("SUP-")

    # Resgata código
    response = await async_client.post(
        "/api/students/redeem-code",
        json={"code": codigo},
    )
    assert response.status_code == 200

    # Tenta usar o mesmo código novamente
    response = await async_client.post(
        "/api/students/redeem-code",
        json={"code": codigo},
    )
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_resgatar_codigo_ja_usado(async_client: AsyncClient, db_session):
    """Código já utilizado deve retornar 400."""
    from src.models.student import Student
    from src.models.student_link_code import StudentLinkCode
    from datetime import datetime, UTC
    import uuid

    aluno = Student(
        full_name="Aluno Teste Used",
        email=f"used_{uuid.uuid4().hex[:6]}@teste.com",
    )
    db_session.add(aluno)
    await db_session.commit()
    await db_session.refresh(aluno)

    link = StudentLinkCode(
        code="SUP-TEST-US",
        student_id=aluno.id,
        created_by=aluno.id,
        is_used=True,
        expires_at=datetime.now(timezone.utc).replace(tzinfo=None),
    )
    db_session.add(link)
    await db_session.commit()

    response = await async_client.post(
        "/api/students/redeem-code",
        json={"code": "SUP-TEST-US"},
    )
    assert response.status_code == 400