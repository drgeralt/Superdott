import logging
from datetime import datetime, UTC
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from src.core.database import get_session
from src.models.student import Student
from src.models.student_link_code import StudentLinkCode, _gerar_codigo

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
        created_by=student_id,  # substituir pelo user autenticado quando Task-014 estiver pronta
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
    session: AsyncSession = Depends(get_session),
):
    """
    Resgata um código de vínculo.
    Falha silenciosa para não expor existência de alunos.
    """
    ERRO_GENERICO = HTTPException(
        status_code=400,
        detail="Código inválido, expirado ou já utilizado.",
    )

    resultado = await session.exec(
        select(StudentLinkCode).where(StudentLinkCode.code == payload.code)
    )
    link = resultado.first()

    # Falha silenciosa — não revela se o código existe ou não
    if not link:
        raise ERRO_GENERICO

    if link.is_used:
        raise ERRO_GENERICO

    agora = datetime.now(UTC)
    expires = link.expires_at.replace(tzinfo=UTC) if link.expires_at.tzinfo is None else link.expires_at
    if agora > expires:
        raise ERRO_GENERICO

    # Marca como usado
    link.is_used = True
    session.add(link)
    await session.commit()

    return RedeemCodeResponse(
        message="Vínculo estabelecido com sucesso.",
        student_id=link.student_id,
    )