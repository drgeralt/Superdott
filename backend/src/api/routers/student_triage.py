from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from uuid import UUID

from src.core.database import get_session
from src.api.deps import get_current_user
from src.models.user import User, UserRole
from src.models.student import Student
from src.models.links import ParentStudentLink

router = APIRouter(prefix="/api/students", tags=["student_triage"])

class TriageAnswers(BaseModel):
    answers: dict[str, float]

@router.post("/{student_id}/triage", status_code=status.HTTP_200_OK)
async def submit_wechsler_triage(
    student_id: UUID,
    payload: TriageAnswers,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    if current_user.role != UserRole.Pai:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas pais ou responsáveis podem preencher a triagem de um aluno."
        )

    # Verify if parent is linked to this student
    link_query = select(ParentStudentLink).where(
        ParentStudentLink.parent_id == current_user.id,
        ParentStudentLink.student_id == student_id
    )
    link_res = await session.exec(link_query)
    if not link_res.first():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não possui vínculo com este aluno."
        )

    student = await session.get(Student, student_id)
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aluno não encontrado."
        )

    answers = payload.answers

    # Map scores according to the Wechsler domains in triagemGratis.json
    # Intelectual (max 21)
    intelectual_keys = ['q1_verbal_1', 'q2_verbal_2', 'q4_fluido_1', 'q5_fluido_2', 'q6_memoria_1', 'q7_memoria_2', 'q8_processamento_1']
    intelectual_score = sum(answers.get(k, 0) for k in intelectual_keys)
    normalized_intelectual = (intelectual_score / 21) * 100 if 21 > 0 else 0

    # Criativo (max 6)
    criativo_keys = ['q3_visuoespacial_1', 'q10_comportamento_2']
    criativo_score = sum(answers.get(k, 0) for k in criativo_keys)
    normalized_criativo = (criativo_score / 6) * 100 if 6 > 0 else 0

    # Lideranca (max 3)
    lideranca_keys = ['q9_comportamento_1']
    lideranca_score = sum(answers.get(k, 0) for k in lideranca_keys)
    normalized_lideranca = (lideranca_score / 3) * 100 if 3 > 0 else 0

    student.score_intelectual = round(normalized_intelectual, 2)
    student.score_criativo = round(normalized_criativo, 2)
    student.score_lideranca = round(normalized_lideranca, 2)
    student.triage_completed = True

    session.add(student)
    await session.commit()
    await session.refresh(student)

    return {
        "message": "Triagem processada com sucesso.",
        "scores": {
            "intelectual": student.score_intelectual,
            "criativo": student.score_criativo,
            "lideranca": student.score_lideranca
        }
    }
