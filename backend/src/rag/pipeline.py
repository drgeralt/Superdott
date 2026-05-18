from dataclasses import dataclass
from uuid import UUID

from google import genai

from src.core.config import settings
from src.rag.prompt import build_prompt
from src.rag.retriever import retrieve
from src.models.user import UserRole

client = genai.Client(api_key=settings.GEMINI_API_KEY)

# modelo temporário talvez, era o que tinha mais cota
GENERATION_MODEL = "models/gemini-3.1-flash-lite-preview"
# GENERATION_MODEL = "models/gemini-1.5-flash" # troca teste


@dataclass
class RAGResponse:
    answer: str
    sources: list[str]
    chunks_used: int


async def ask(
    question: str,
    student_context: dict | None = None,
    history: list[dict] | None = None,
    top_k: int = 5,
    similarity_threshold: float = 0.5,
    user_role: UserRole | None = None,
    school_id: UUID | None = None,
    student_id: UUID | None = None,
) -> RAGResponse:

    try:
        # 1. Busca no banco com filtro opcional de escola e aluno
        chunks = await retrieve(
            question=question,
            top_k=top_k,
            similarity_threshold=similarity_threshold,
            school_id=school_id,
            student_id=student_id,
            user_role=user_role.value if hasattr(user_role, 'value') else str(user_role) if user_role else None,
        )

        # 2. Gera resposta
        response = client.models.generate_content(
            model=GENERATION_MODEL,
            contents=build_prompt(
                question=question,
                chunks=chunks,
                student_context=student_context,
                history=history,
                user_role=user_role,
            ),
        )

        return RAGResponse(
            answer=response.text,
            sources=list(set([c.source for c in chunks])),
            chunks_used=len(chunks),
        )
    except Exception as e:
        print(f"DEBUG: Ocorreu um erro real no Gemini: {type(e).__name__} - {str(e)}")
        return RAGResponse(answer=f"Erro Técnico: {str(e)}", sources=[], chunks_used=0)


async def ask_stream(
    question: str,
    student_context: dict | None = None,
    history: list[dict] | None = None,
    top_k: int = 5,
    similarity_threshold: float = 0.5,
    user_role: UserRole | None = None,
    school_id: UUID | None = None,
    student_id: UUID | None = None,
):
    chunks = await retrieve(
        question=question,
        top_k=top_k,
        similarity_threshold=similarity_threshold,
        school_id=school_id,
        student_id=student_id,
        user_role=user_role.value if hasattr(user_role, 'value') else str(user_role) if user_role else None,
    )

    prompt = build_prompt(
        question=question,
        chunks=chunks,
        student_context=student_context,
        history=history,
        user_role=user_role,
    )

    response = client.models.generate_content_stream(
        model=GENERATION_MODEL,
        contents=prompt,
    )

    for chunk in response:
        if chunk.text:
            yield chunk.text
