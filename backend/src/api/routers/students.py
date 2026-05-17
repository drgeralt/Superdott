import uuid
import logging
import csv
import io
import re
import random
import string
from fastapi import APIRouter, Depends, status, HTTPException, Response, UploadFile, File, BackgroundTasks
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from datetime import datetime, timezone
from typing import Optional

from src.core.database import get_session
from src.models.student import Student
from src.models.user import User, UserRole
from src.models.links import ParentStudentLink, SchoolStudentLink
from src.models.student_link_code import StudentLinkCode
from src.api.services.audit_service import create_audit_log, AuditAction
from src.api.services.pdi_service import PdiService
from src.api.services.email_service import send_invitation_email
from src.api.deps import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/students", tags=["Students"])


@router.get("", response_model=list[Student])
async def get_students(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    query = select(Student)
    if current_user.role == UserRole.Pai:
        query = query.join(ParentStudentLink).where(ParentStudentLink.parent_id == current_user.id)
    result = await session.exec(query)
    return result.all()


@router.post("/{student_id}/link", status_code=status.HTTP_200_OK)
async def link_student(
    student_id: uuid.UUID,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    result = await session.exec(select(Student).where(Student.id == student_id))
    student = result.first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Aluno não encontrado.")

    if current_user.role == UserRole.Pai:
        existing = await session.exec(select(ParentStudentLink).where(
            ParentStudentLink.parent_id == current_user.id,
            ParentStudentLink.student_id == student_id
        ))
        if not existing.first():
            link = ParentStudentLink(parent_id=current_user.id, student_id=student_id)
            session.add(link)

    await session.commit()

    await create_audit_log(
        session=session,
        user_id=uuid.UUID(int=current_user.id),
        action=AuditAction.STUDENT_LINKED,
        student_id=student_id,
    )

    return {"ok": True}


@router.delete("/{student_id}/link", status_code=status.HTTP_200_OK)
async def unlink_student(
    student_id: uuid.UUID,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    result = await session.exec(select(Student).where(Student.id == student_id))
    if not result.first():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Aluno não encontrado.")

    if current_user.role == UserRole.Pai:
        existing = await session.exec(select(ParentStudentLink).where(
            ParentStudentLink.parent_id == current_user.id,
            ParentStudentLink.student_id == student_id
        ))
        link = existing.first()
        if link:
            await session.delete(link)
    else:
        # Simplificação para Escola desvinculando (remove todos os SchoolStudentLink)
        existing = await session.exec(select(SchoolStudentLink).where(
            SchoolStudentLink.student_id == student_id
        ))
        for link in existing.all():
            await session.delete(link)

    await session.commit()

    await create_audit_log(
        session=session,
        user_id=uuid.UUID(int=current_user.id),
        action=AuditAction.STUDENT_UNLINKED,
        student_id=student_id,
    )

    return {"ok": True}


@router.get("/{student_id}/export-pdi")
async def export_student_pdi(
    student_id: uuid.UUID,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    include_curriculum: bool = True,
    include_methodologies: bool = True,
    omit_informal: bool = True,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    # 1. Access control validation
    if current_user.role == UserRole.Pai:
        result = await session.exec(select(ParentStudentLink).where(
            ParentStudentLink.parent_id == current_user.id,
            ParentStudentLink.student_id == student_id
        ))
        if not result.first():
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acesso negado ao aluno.")
    
    # 2. Parse dates
    start_dt = None
    end_dt = None
    if start_date:
        try:
            start_dt = datetime.strptime(start_date, "%Y-%m-%d").replace(tzinfo=timezone.utc if hasattr(datetime, 'timezone') else None)
        except ValueError:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Formato de data inicial inválido. Use YYYY-MM-DD.")
    if end_date:
        try:
            end_dt = datetime.strptime(end_date, "%Y-%m-%d").replace(hour=23, minute=59, second=59, tzinfo=timezone.utc if hasattr(datetime, 'timezone') else None)
        except ValueError:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Formato de data final inválido. Use YYYY-MM-DD.")

    try:
        pdf_bytes = await PdiService.export_and_cache_pdi(
            session=session,
            student_id=student_id,
            user_id=current_user.id,
            emissor_name=current_user.email,
            start_date=start_dt,
            end_date=end_dt,
            include_curriculum=include_curriculum,
            include_methodologies=include_methodologies,
            omit_informal=omit_informal
        )
        
        # Retrieve student to give an elegant filename
        student_res = await session.exec(select(Student).where(Student.id == student_id))
        student = student_res.one()
        sanitized_name = student.full_name.lower().replace(" ", "_")
        filename = f"pdi_{sanitized_name}.pdf"
        
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Access-Control-Expose-Headers": "Content-Disposition"
            }
        )
    except ValueError as val_err:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(val_err))
    except Exception as exc:
        logger.error("Failed to export PDI: %s", exc, exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erro interno ao gerar PDI: {str(exc)}")


EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")

def is_valid_email(email: str) -> bool:
    return bool(EMAIL_REGEX.match(email))

@router.post("/import-csv", status_code=status.HTTP_200_OK)
async def import_students_csv(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in (UserRole.Diretor, UserRole.SuperAdmin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso exclusivo para Diretores e Administradores."
        )

    # 1. Accept only CSV files (HTTP 415 check)
    if not file.filename.lower().endswith('.csv'):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Formato de arquivo inválido. Apenas arquivos .csv são suportados."
        )

    try:
        contents = await file.read()
        try:
            decoded = contents.decode("utf-8")
        except UnicodeDecodeError:
            decoded = contents.decode("latin-1")
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Não foi possível ler o arquivo CSV: {str(exc)}"
        )

    # Use csv.DictReader to parse lines
    reader = csv.DictReader(io.StringIO(decoded))
    if not reader.fieldnames:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="O arquivo CSV está vazio ou não possui cabeçalhos."
        )

    # Normalize headers (strip, lowercase)
    normalized_headers = [h.strip().lower().replace('"', '').replace("'", "") for h in reader.fieldnames]
    reader.fieldnames = normalized_headers

    required_cols = ["nome_completo_aluno", "turma", "email_responsavel", "nome_responsavel"]
    missing_cols = [col for col in required_cols if col not in normalized_headers]
    if missing_cols:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Colunas obrigatórias ausentes no CSV: {', '.join(missing_cols)}."
        )

    # Ensure a default school exists to link students
    from src.models.school import School
    school_result = await session.exec(select(School))
    school = school_result.first()
    if not school:
        school = School(name="Escola Superdott", address="Endereço Principal")
        session.add(school)
        await session.flush()

    errors = []
    rows_to_import = []
    line_num = 1

    for row in reader:
        line_num += 1
        nome_aluno = row.get("nome_completo_aluno", "").strip()
        turma = row.get("turma", "").strip() or None
        email_resp = row.get("email_responsavel", "").strip()
        nome_resp = row.get("nome_responsavel", "").strip()

        # Validation checks
        if not nome_aluno:
            errors.append(f"Linha {line_num}: Nome do aluno não pode ser vazio.")
            continue
        if not email_resp:
            errors.append(f"Linha {line_num}: E-mail do responsável não pode ser vazio.")
            continue
        if not is_valid_email(email_resp):
            errors.append(f"Linha {line_num}: E-mail do responsável '{email_resp}' é inválido.")
            continue
        if not nome_resp:
            errors.append(f"Linha {line_num}: Nome do responsável não pode ser vazio.")
            continue

        rows_to_import.append({
            "nome_aluno": nome_aluno,
            "turma": turma,
            "email_resp": email_resp,
            "nome_resp": nome_resp
        })

    # Atomic Rollback Check: if there are validation errors, return them immediately without database writes!
    if errors:
        return {
            "success": False,
            "message": "A importação falhou devido a erros de validação.",
            "imported_count": 0,
            "errors": errors
        }

    # If no rows, return empty success
    if not rows_to_import:
        return {
            "success": True,
            "message": "Nenhum aluno encontrado para importar.",
            "imported_count": 0,
            "errors": []
        }

    def generate_link_code() -> str:
        chars = "".join(random.choices(string.ascii_uppercase + string.digits, k=8))
        return f"SD-{chars[:4]}-{chars[4:]}"

    imported_count = 0
    try:
        # Atomic Transaction begin block
        async with session.begin_nested():
            for item in rows_to_import:
                # Generate a unique student email to satisfy DB schema
                unique_student_email = f"aluno_{uuid.uuid4().hex[:8]}@superdott.com.br"
                
                # 1. Create Student
                student = Student(
                    full_name=item["nome_aluno"],
                    email=unique_student_email,
                    turma=item["turma"]
                )
                session.add(student)
                await session.flush()

                # 2. Create SchoolStudentLink
                school_link = SchoolStudentLink(school_id=school.id, student_id=student.id)
                session.add(school_link)

                # 3. Handle automatic link if parent email already exists in User table
                parent_user = (await session.exec(select(User).where(User.email == item["email_resp"]))).first()
                if parent_user:
                    parent_link = ParentStudentLink(parent_id=parent_user.id, student_id=student.id)
                    session.add(parent_link)

                # 4. Generate and save StudentLinkCode
                code = generate_link_code()
                link_code = StudentLinkCode(
                    code=code,
                    student_id=student.id,
                    email_responsavel=item["email_resp"],
                    nome_responsavel=item["nome_resp"]
                )
                session.add(link_code)

                # 5. Enqueue invite email via Resend
                background_tasks.add_task(
                    send_invitation_email,
                    email_responsavel=item["email_resp"],
                    nome_responsavel=item["nome_resp"],
                    student_name=item["nome_aluno"],
                    turma=item["turma"],
                    code=code,
                    school_name=school.name
                )
                imported_count += 1

            await session.commit()
            
            # Audit log for import
            await create_audit_log(
                session=session,
                user_id=uuid.UUID(int=current_user.id),
                action=AuditAction.STUDENT_LINKED,
            )
            
    except Exception as db_exc:
        await session.rollback()
        logger.error(f"Erro no banco de dados durante importação de CSV: {db_exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro no banco de dados ao processar lote: {str(db_exc)}"
        )

    return {
        "success": True,
        "message": f"Importação de {imported_count} alunos concluída com sucesso!",
        "imported_count": imported_count,
        "errors": []
    }
