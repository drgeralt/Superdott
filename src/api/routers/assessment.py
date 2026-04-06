"""
src/api/routers/assessment.py
------------------------------
Define os dois endpoints da Task 3:

  GET  /assessment/{token}         → retorna contexto de triagem
  POST /assessment/{token}/submit  → salva respostas e invalida token

O router é fino de propósito: só lida com HTTP.
Toda lógica vive em assessment_service.py.
"""

from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from src.api.services.assessment_service import (
    AnswerInput,
    AssessmentContextResponse,
    SubmitResponse,
    get_assessment_context,
    submit_assessment,
)
from src.core.database import get_session

# Prefixo /assessment será adicionado no main.py ao incluir este router
router = APIRouter(tags=["Assessment"])


@router.get(
    "/assessment/{token}",
    response_model=AssessmentContextResponse,
    summary="Recuperar contexto de triagem",
    description=(
        "Recebe um token único gerado pelo sistema e retorna os dados do aluno "
        "e do questionário associado. O token deve ser válido "
        "(não usado e não expirado)."
    ),
)
def get_assessment(
    token: str,
    session: Session = Depends(get_session),
):
    """
    Parâmetro de rota:
      - token: string única gerada pelo backend e enviada ao responsável/professor

    Retorna:
      - Dados do aluno (nome, email)
      - Dados do questionário (título, disciplina)

    Erros possíveis:
      - 404: Token não encontrado
      - 410: Token já usado ou expirado
    """
    return get_assessment_context(token_value=token, session=session)


@router.post(
    "/assessment/{token}/submit",
    response_model=SubmitResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submeter respostas da triagem",
    description=(
        "Recebe a lista de respostas do questionário, salva no banco, "
        "calcula o score imediato e invalida o token para evitar reenvios."
    ),
)
def submit_assessment_endpoint(
    token: str,
    answers: list[AnswerInput],
    session: Session = Depends(get_session),
):
    """
    Parâmetro de rota:
      - token: mesmo token do GET

    Body (JSON):
      [
        { "content_text": "O aluno demonstra interesse elevado...", "score": 8.5 },
        { "content_text": "Observação qualitativa sem nota" }
      ]

    Retorna:
      - overall_score: média das respostas com pontuação numérica
      - answers_saved: total de respostas persistidas
      - message: confirmação

    Erros possíveis:
      - 404: Token não encontrado
      - 410: Token já usado ou expirado
      - 422: Nenhuma resposta enviada
    """
    return submit_assessment(token_value=token, answers=answers, session=session)
