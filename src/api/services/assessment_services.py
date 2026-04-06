"""
src/api/services/assessment_service.py
---------------------------------------
Toda a lógica de negócio da Task 3 fica aqui, separada do router.

Por que separar service do router?
  - O router só cuida de HTTP (receber request, retornar response).
  - O service cuida do banco, regras e cálculos.
  - Assim podemos testar a lógica SEM precisar de uma requisição HTTP.
"""

from datetime import UTC, datetime
from decimal import Decimal

from fastapi import HTTPException, status

# ---------------------------------------------------------------------------
# Schemas de entrada e saída (Pydantic/SQLModel sem table=True)
# Estes são os formatos de JSON que a API aceita e retorna.
# ---------------------------------------------------------------------------
from pydantic import BaseModel
from sqlmodel import Session, select, text

from src.models.token import Token


class AnswerInput(BaseModel):
    """Uma resposta individual do formulário de triagem."""
    content_text: str          # Texto da resposta (ex: "O aluno demonstra...")
    score: float | None = None  # Pontuação 0–10 (opcional se for qualitativa)


class AssessmentContextResponse(BaseModel):
    """
    Resposta do GET /assessment/{token}
    Contém tudo que o frontend precisa para renderizar o formulário.
    """
    token: str
    student_id: str
    student_name: str
    student_email: str
    assessment_id: str
    assessment_title: str
    assessment_subject: str | None


class SubmitResponse(BaseModel):
    """
    Resposta do POST /assessment/{token}/submit
    Retorna o score calculado e a confirmação.
    """
    message: str
    overall_score: float | None   # Média dos scores fornecidos
    answers_saved: int               # Quantas respostas foram salvas


# ---------------------------------------------------------------------------
# Funções de serviço
# ---------------------------------------------------------------------------

def get_assessment_context(
    token_value: str, session: Session
) -> AssessmentContextResponse:
    """
    Busca o contexto de triagem a partir do token.

    Regras:
      1. O token deve existir no banco.
      2. O token NÃO pode já ter sido usado (is_used = TRUE).
      3. O token NÃO pode estar expirado (expires_at < agora).

    Retorna os dados do aluno e do questionário para o frontend.
    """

    # Busca o token no banco
    token_obj = _fetch_valid_token(token_value, session)

    # Busca os dados do aluno via SQL raw (evita criar mais models por ora)
    student_row = session.exec(
        text("SELECT id, full_name, email FROM students WHERE id = :sid"),
        params={"sid": str(token_obj.student_id)},  # type: ignore
    ).fetchone()

    if not student_row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aluno associado ao token não encontrado.",
        )

    # Busca os dados do questionário
    assessment_row = session.exec(
        text("SELECT id, title, subject FROM assessments WHERE id = :aid"),
        params={"aid": str(token_obj.assessment_id)},  # type: ignore
    ).fetchone()

    if not assessment_row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Questionário associado ao token não encontrado.",
        )

    return AssessmentContextResponse(
        token=token_value,
        student_id=str(student_row[0]),
        student_name=student_row[1],
        student_email=student_row[2],
        assessment_id=str(assessment_row[0]),
        assessment_title=assessment_row[1],
        assessment_subject=assessment_row[2],
    )


def submit_assessment(
    token_value: str,
    answers: list[AnswerInput],
    session: Session,
) -> SubmitResponse:
    """
    Salva as respostas da triagem e invalida o token.

    Fluxo:
      1. Valida o token (mesmo que o GET faz).
      2. Salva cada resposta na tabela `answers`.
      3. Calcula o score geral (média das respostas com score).
      4. Invalida o token (is_used = TRUE, used_at = agora).
      5. Faz commit e retorna o resultado.
    """

    # 1. Valida o token — vai lançar HTTP 400/404/410 se inválido
    token_obj = _fetch_valid_token(token_value, session)

    if not answers:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Nenhuma resposta foi enviada.",
        )

    # 2. Insere as respostas no banco
    scores_numericos = []
    for answer in answers:
        score_decimal = Decimal(str(answer.score)) if answer.score is not None else None

        session.exec(
            text(
                """
                INSERT INTO answers (student_id, assessment_id, content_text, score)
                VALUES (:student_id, :assessment_id, :content_text, :score)
                """
            ),
            params={
                "student_id": str(token_obj.student_id),
                "assessment_id": str(token_obj.assessment_id),
                "content_text": answer.content_text,
                "score": score_decimal,
            },
        )

        if answer.score is not None:
            scores_numericos.append(answer.score)

    # 3. Calcula o score geral
    # Algoritmo: média simples dos scores numéricos fornecidos.
    # Em releases futuras isso pode virar um algoritmo ponderado por dimensão
    # (Intelectual, Criatividade, Liderança — Teoria dos Três Anéis de Renzulli).
    overall_score = None
    if scores_numericos:
        overall_score = round(sum(scores_numericos) / len(scores_numericos), 2)

    # 4. Invalida o token — regra de segurança principal da task
    token_obj.is_used = True
    token_obj.used_at = datetime.now(UTC)
    session.add(token_obj)

    # 5. Persiste tudo em uma única transação
    session.commit()

    return SubmitResponse(
        message="Triagem enviada com sucesso. O link de acesso foi invalidado.",
        overall_score=overall_score,
        answers_saved=len(answers),
    )


# ---------------------------------------------------------------------------
# Função auxiliar privada (prefixo _ = uso interno do módulo)
# ---------------------------------------------------------------------------

def _fetch_valid_token(token_value: str, session: Session) -> Token:
    """
    Busca o token no banco e aplica as três validações de segurança:
      - Existe?
      - Já foi usado?
      - Está expirado?

    Lança HTTPException adequada em cada caso.
    """
    statement = select(Token).where(Token.token == token_value)
    token_obj = session.exec(statement).first()

    # Validação 1: token existe?
    if not token_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Token de triagem não encontrado.",
        )

    # Validação 2: token já foi usado?
    if token_obj.is_used:
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="Este link já foi utilizado e não pode ser acessado novamente.",
        )

    # Validação 3: token expirado?
    if token_obj.expires_at:
        now = datetime.now(UTC)
        expires = token_obj.expires_at
        # Garante que ambos têm timezone para comparação segura
        if expires.tzinfo is None:
            expires = expires.replace(tzinfo=UTC)
        if now > expires:
            raise HTTPException(
                status_code=status.HTTP_410_GONE,
                detail="Este link de triagem expirou.",
            )

    return token_obj
