from datetime import UTC, datetime
from decimal import Decimal

from fastapi import HTTPException
from pydantic import BaseModel

from src.core.database import db


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


async def get_assessment_context(token_value: str) -> AssessmentContextResponse:
    token_obj = await _fetch_valid_token(token_value)

    student = await db.students.find_unique(where={"id": token_obj.student_id})
    assessment = await db.assessments.find_unique(where={"id": token_obj.assessment_id})

    if not student or not assessment:
        raise HTTPException(
            status_code=404, detail="Dados vinculados ao token sumiram."
        )

    return AssessmentContextResponse(
        token=token_value,
        student_id=student.id,
        student_name=student.full_name,
        student_email=student.email,
        assessment_id=assessment.id,
        assessment_title=assessment.title,
        assessment_subject=assessment.subject,
    )


async def submit_assessment(
    token_value: str, answers: list[AnswerInput]
) -> SubmitResponse:
    token_obj = await _fetch_valid_token(token_value)

    if not answers:
        raise HTTPException(status_code=422, detail="Sem respostas.")

    scores = []
    # 2. Salva as respostas usando o Prisma
    for ans in answers:
        await db.answers.create(
            data={
                "student_id": token_obj.student_id,
                "assessment_id": token_obj.assessment_id,
                "content_text": ans.content_text,
                "score": Decimal(str(ans.score)) if ans.score is not None else None,
            }
        )
        if ans.score is not None:
            scores.append(ans.score)

    overall_score = round(sum(scores) / len(scores), 2) if scores else None

    # 3. Invalida o token
    await db.tokens.update(
        where={"id": token_obj.id}, data={"is_used": True, "used_at": datetime.now(UTC)}
    )

    return SubmitResponse(
        message="Triagem concluída.",
        overall_score=overall_score,
        answers_saved=len(answers),
    )


async def _fetch_valid_token(token_value: str):
    token_obj = await db.tokens.find_unique(where={"token": token_value})

    if not token_obj:
        raise HTTPException(status_code=404, detail="Token inválido.")
    if token_obj.is_used:
        raise HTTPException(status_code=410, detail="Token já utilizado.")

    if token_obj.expires_at:
        # Garante comparação em UTC
        expires = token_obj.expires_at.replace(tzinfo=UTC)
        if datetime.now(UTC) > expires:
            raise HTTPException(status_code=410, detail="Token expirado.")

    return token_obj
