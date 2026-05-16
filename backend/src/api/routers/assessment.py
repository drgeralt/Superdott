from fastapi import APIRouter, Depends, status
from sqlmodel.ext.asyncio.session import AsyncSession

from src.api.services.assessment_service import (
    AnswerInput,
    AssessmentContextResponse,
    SubmitResponse,
    get_assessment_context,
    submit_assessment,
)
from src.core.database import get_session

router = APIRouter(tags=["Assessment"])


@router.get(
    "/assessment/{token}",
    response_model=AssessmentContextResponse,
    summary="Recuperar contexto de triagem",
)
async def get_assessment(  # <-- TEM QUE TER ASYNC AQUI
    token: str,
    session: AsyncSession = Depends(get_session),
):
    # <-- TEM QUE TER AWAIT AQUI
    return await get_assessment_context(token_value=token, session=session)


@router.post(
    "/assessment/{token}/submit",
    response_model=SubmitResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submeter respostas da triagem",
)
async def submit_assessment_endpoint(  # <-- TEM QUE TER ASYNC AQUI
    token: str,
    answers: list[AnswerInput],
    session: AsyncSession = Depends(get_session),
):
    # <-- TEM QUE TER AWAIT AQUI
    return await submit_assessment(token_value=token, answers=answers, session=session)
