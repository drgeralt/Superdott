import logging
from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from src.core.database import get_session
from src.models.student import Student
from src.models.student_link_code import StudentLinkCode, _gerar_codigo
from src.api.deps import get_current_user
from src.models.user import User, UserRole
from src.models.links import ParentStudentLink

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/students", tags=["Link Code"])



class LinkCodeResponse(BaseModel):
    code: str
    expires_at: datetime
    student_id: UUID


class RedeemCodeRequest(BaseModel):
    code: str


class RedeemCodeResponse(BaseModel):
    message: str
    student_id: UUID


@router.post("/{student_id}/link-code", response_model=LinkCodeResponse)
async def gerar_codigo(
    student_id: UUID,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """
    Gera um código de vínculo para o aluno.
    Válido por 48h e de uso único.
    """
    # Verifica se o aluno existe
    aluno = await session.get(Student, student_id)
    if not aluno:
        raise HTTPException(status_code=404, detail="Aluno não encontrado.")

    # Gera código único (tenta até 5 vezes em caso de colisão)
    for _ in range(5):
        codigo = _gerar_codigo()
        existente = await session.exec(
            select(StudentLinkCode).where(StudentLinkCode.code == codigo)
        )
        if not existente.first():
            break
    else:
        raise HTTPException(status_code=500, detail="Erro ao gerar código único.")

    link = StudentLinkCode(
        code=codigo,
        student_id=student_id,
        created_by=current_user.id,
    )
    session.add(link)
    await session.commit()
    await session.refresh(link)

    return LinkCodeResponse(
        code=link.code,
        expires_at=link.expires_at,
        student_id=link.student_id,
    )


@router.post("/redeem-code", response_model=RedeemCodeResponse)
async def resgatar_codigo(
    payload: RedeemCodeRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """
    Resgata um código de vínculo.
    Falha silenciosa para não expor existência de alunos.
    """
    if current_user.role != UserRole.Pai:
        raise HTTPException(
            status_code=403,
            detail="Apenas pais ou responsáveis podem resgatar códigos de vínculo."
        )

    ERRO_GENERICO = HTTPException(
        status_code=400,
        detail="Código inválido, expirado ou já utilizado.",
    )

    code_cleaned = payload.code.strip().upper()
    resultado = await session.exec(
        select(StudentLinkCode).where(
            (StudentLinkCode.code == code_cleaned) | 
            (StudentLinkCode.code == payload.code.strip())
        )
    )
    link = resultado.first()

    if not link:
        # Tenta casar limpando prefixos (SUP-, SD-) e hifens
        raw_input = code_cleaned.replace("SUP-", "").replace("SD-", "").replace("-", "").replace(" ", "")
        all_codes_res = await session.exec(select(StudentLinkCode))
        all_codes = all_codes_res.all()
        for c in all_codes:
            c_cleaned = c.code.upper().replace("SUP-", "").replace("SD-", "").replace("-", "").replace(" ", "")
            if c_cleaned == raw_input:
                link = c
                break

    # Falha silenciosa — não revela se o código existe ou não
    if not link:
        logger.warning(f"Redeem attempt failed: code '{payload.code}' not found.")
        raise ERRO_GENERICO

    if link.is_used:
        logger.warning(f"Redeem attempt failed: code '{link.code}' already used.")
        raise ERRO_GENERICO

    from datetime import timedelta
    agora = datetime.utcnow()
    expires = link.expires_at.replace(tzinfo=None) if link.expires_at.tzinfo else link.expires_at
    if agora > (expires + timedelta(days=5)):
        logger.warning(f"Redeem attempt failed: code '{link.code}' expired. Agora: {agora}, Expires: {expires}")
        raise ERRO_GENERICO

    # Check if relationship already exists
    existente_query = select(ParentStudentLink).where(
        ParentStudentLink.parent_id == current_user.id,
        ParentStudentLink.student_id == link.student_id
    )
    res_existente = await session.exec(existente_query)
    if res_existente.first():
        raise HTTPException(
            status_code=400,
            detail="Você já possui vínculo ativo com este aluno."
        )

    # Marca como usado
    link.is_used = True
    session.add(link)

    # Cria o vínculo parent-student
    parent_link = ParentStudentLink(
        parent_id=current_user.id,
        student_id=link.student_id
    )
    session.add(parent_link)
    
    await session.commit()

    return RedeemCodeResponse(
        message="Vínculo estabelecido com sucesso.",
        student_id=link.student_id,
    )