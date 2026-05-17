import pytest
from httpx import AsyncClient
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.pool import NullPool

from tests.conftest import TEST_DATABASE_URL
from src.models.user import User, UserRole
from src.models.student import Student
from src.models.student_link_code import StudentLinkCode

test_engine = create_async_engine(TEST_DATABASE_URL, poolclass=NullPool)

@pytest.mark.asyncio
async def test_import_csv_role_restrita(async_client: AsyncClient):
    """Garante que usuários que não sejam Diretores ou SuperAdmins recebam 403."""
    from src.api.deps import get_current_user
    from src.main import app

    async def override_get_current_user_professor():
        return User(id=777, email="prof@test.com", hashed_password="hashed", role=UserRole.Professor, is_active=True)

    app.dependency_overrides[get_current_user] = override_get_current_user_professor

    # Tentativa de upload
    files = {"file": ("alunos.csv", "nome_completo_aluno,turma,email_responsavel,nome_responsavel\nJoão Silva,5A,pai@test.com,José".encode("utf-8"), "text/csv")}
    response = await async_client.post("/api/students/import-csv", files=files)
    
    assert response.status_code == 403
    assert "Acesso exclusivo" in response.json()["detail"]
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_import_csv_unsupported_media_type(async_client: AsyncClient):
    """Garante que formatos diferentes de .csv retornem erro 415."""
    from src.api.deps import get_current_user
    from src.main import app

    async def override_get_current_user_diretor():
        return User(id=888, email="diretor@test.com", hashed_password="hashed", role=UserRole.Diretor, is_active=True)

    app.dependency_overrides[get_current_user] = override_get_current_user_diretor

    # Tentativa com .txt
    files = {"file": ("alunos.txt", "nome_completo_aluno,turma,email_responsavel,nome_responsavel\nJoão Silva,5A,pai@test.com,José".encode("utf-8"), "text/plain")}
    response = await async_client.post("/api/students/import-csv", files=files)
    
    assert response.status_code == 415
    assert "Apenas arquivos .csv" in response.json()["detail"]
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_import_csv_valido_sucesso(async_client: AsyncClient):
    """Garante a importação bem sucedida de múltiplos alunos com transação atômica."""
    from src.api.deps import get_current_user
    from src.main import app

    async def override_get_current_user_diretor():
        return User(id=888, email="diretor@test.com", hashed_password="hashed", role=UserRole.Diretor, is_active=True)

    app.dependency_overrides[get_current_user] = override_get_current_user_diretor

    # CSV com 2 alunos válidos
    csv_data = (
        "nome_completo_aluno,turma,email_responsavel,nome_responsavel\n"
        "Mateus Rodrigues,4º Ano B,pai_mateus@test.com,Carlos Rodrigues\n"
        "Helena Costa,2º Ano A,mae_helena@test.com,Luiza Costa"
    )
    files = {"file": ("alunos.csv", csv_data.encode("utf-8"), "text/csv")}
    response = await async_client.post("/api/students/import-csv", files=files)
    
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["success"] is True
    assert res_data["imported_count"] == 2
    assert len(res_data["errors"]) == 0

    # Verifica persistência no banco de dados de teste
    async with AsyncSession(test_engine) as session:
        # Alunos criados
        students_res = await session.exec(select(Student).where(Student.full_name.in_(["Mateus Rodrigues", "Helena Costa"])))
        students = students_res.all()
        assert len(students) == 2
        assert {s.turma for s in students} == {"4º Ano B", "2º Ano A"}

        # Códigos de vínculo gerados
        student_ids = [s.id for s in students]
        codes_res = await session.exec(select(StudentLinkCode).where(StudentLinkCode.student_id.in_(student_ids)))
        codes = codes_res.all()
        assert len(codes) == 2
        assert {c.email_responsavel for c in codes} == {"pai_mateus@test.com", "mae_helena@test.com"}

        # Limpeza
        for c in codes:
            await session.delete(c)
        for s in students:
            await session.delete(s)
        await session.commit()

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_import_csv_com_erros_valida_rollback(async_client: AsyncClient):
    """Garante que se houver erro de validação sintática (e-mail inválido), a transação seja abortada/rolled back."""
    from src.api.deps import get_current_user
    from src.main import app

    async def override_get_current_user_diretor():
        return User(id=888, email="diretor@test.com", hashed_password="hashed", role=UserRole.Diretor, is_active=True)

    app.dependency_overrides[get_current_user] = override_get_current_user_diretor

    # CSV com 1 aluno válido e 1 inválido (e-mail malformado)
    csv_data = (
        "nome_completo_aluno,turma,email_responsavel,nome_responsavel\n"
        "Mateus Rodrigues,4º Ano B,email-invalido,Carlos Rodrigues\n"
        "Helena Costa,2º Ano A,mae_helena@test.com,Luiza Costa"
    )
    files = {"file": ("alunos.csv", csv_data.encode("utf-8"), "text/csv")}
    response = await async_client.post("/api/students/import-csv", files=files)
    
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["success"] is False
    assert res_data["imported_count"] == 0
    assert len(res_data["errors"]) == 1
    assert "E-mail do responsável 'email-invalido' é inválido." in res_data["errors"][0]

    # Garante que NADA foi salvo no banco (Rollback atômico)
    async with AsyncSession(test_engine) as session:
        students_res = await session.exec(select(Student).where(Student.full_name.in_(["Mateus Rodrigues", "Helena Costa"])))
        assert len(students_res.all()) == 0

    app.dependency_overrides.clear()
