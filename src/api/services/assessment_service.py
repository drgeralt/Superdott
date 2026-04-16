from datetime import UTC, datetime
from decimal import Decimal

from fastapi import HTTPException
from pydantic import BaseModel
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from src.models.answer import Answer
from src.models.assessment import Assessment
from src.models.student import Student
from src.models.token import Token


class AnswerInput(BaseModel):
    content_text: str
    score: float | None = None


class AssessmentContextResponse(BaseModel):
    token: str
    student_id: str
    student_name: str
    student_email: str
    assessment_id: str
    assessment_title: str
    assessment_subject: str | None


class SubmitResponse(BaseModel):
    message: str
    overall_score: float | None
    answers_saved: int


async def _fetch_valid_token(token_value: str, session: AsyncSession) -> Token:
    result = await session.exec(select(Token).where(Token.token == token_value))
    token_obj = result.first()

    if not token_obj:
        raise HTTPException(status_code=404, detail="Token inválido.")
    if token_obj.is_used:
        raise HTTPException(status_code=410, detail="Token já utilizado.")
    if token_obj.expires_at:
        expires = token_obj.expires_at.replace(tzinfo=UTC)
        if datetime.now(UTC) > expires:
            raise HTTPException(status_code=410, detail="Token expirado.")

    return token_obj


async def get_assessment_context(
    token_value: str, session: AsyncSession
) -> AssessmentContextResponse:
    token_obj = await _fetch_valid_token(token_value, session)

    student = await session.get(Student, token_obj.student_id)
    assessment = await session.get(Assessment, token_obj.assessment_id)

    if not student or not assessment:
        raise HTTPException(status_code=404, detail="Dados vinculados ao token sumiram.")

    return AssessmentContextResponse(
        token=token_value,
        student_id=str(student.id),
        student_name=student.full_name,
        student_email=student.email,
        assessment_id=str(assessment.id),
        assessment_title=assessment.title,
        assessment_subject=assessment.subject,
    )


async def submit_assessment(
    token_value: str, answers: list[AnswerInput], session: AsyncSession
) -> SubmitResponse:
    token_obj = await _fetch_valid_token(token_value, session)

    if not answers:
        raise HTTPException(status_code=422, detail="Sem respostas.")

    scores = []
    for ans in answers:
        answer = Answer(
            student_id=token_obj.student_id,
            assessment_id=token_obj.assessment_id,
            content_text=ans.content_text,
            score=Decimal(str(ans.score)) if ans.score is not None else None,
        )
        session.add(answer)
        if ans.score is not None:
            scores.append(ans.score)

    overall_score = round(sum(scores) / len(scores), 2) if scores else None

    token_obj.is_used = True
    token_obj.used_at = datetime.now(UTC)
    session.add(token_obj)

    await session.commit()

    return SubmitResponse(
        message="Triagem concluída.",
        overall_score=overall_score,
        answers_saved=len(answers),
    )