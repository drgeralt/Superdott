from dataclasses import dataclass
from google import genai
from src.core.config import settings
from src.rag.retriever import retrieve, RetrievedChunk
from src.rag.prompt import build_prompt

client = genai.Client(api_key=settings.GEMINI_API_KEY)

#modelo temporário talvez, era o que tinha mais cota
GENERATION_MODEL = "models/gemini-3.1-flash-lite-preview"


@dataclass
class RAGResponse:
    answer: str
    sources: list[str]
    chunks_used: int


def ask(
    question: str,
    student_context: dict | None = None,
    top_k: int = 5,
    similarity_threshold: float = 0.5,
) -> RAGResponse:
    """
    Recebe uma pergunta e retorna a resposta baseada na knowledge_base.
    """
    # 1. Busca os trechos relevantes
    chunks = retrieve(
        question=question,
        top_k=top_k,
        similarity_threshold=similarity_threshold,
    )

    # 2. Monta o prompt com contexto
    prompt = build_prompt(
        question=question,
        chunks=chunks,
        student_context=student_context,
    )

    # 3. Envia pro Gemini e obtém resposta
    response = client.models.generate_content(
        model=GENERATION_MODEL,
        contents=prompt,
    )

    # 4. Extrai fontes únicas
    sources = list(dict.fromkeys(chunk.source for chunk in chunks))

    return RAGResponse(
        answer=response.text,
        sources=sources,
        chunks_used=len(chunks),
    )


async def ask_stream(
    question: str,
    student_context: dict | None = None,
    top_k: int = 5,
    similarity_threshold: float = 0.5,
):
    """
    Versão com streaming — envia tokens progressivamente pro frontend.
    """
    chunks = retrieve(
        question=question,
        top_k=top_k,
        similarity_threshold=similarity_threshold,
    )

    prompt = build_prompt(
        question=question,
        chunks=chunks,
        student_context=student_context,
    )

    response = client.models.generate_content_stream(
        model=GENERATION_MODEL,
        contents=prompt,
    )

    for chunk in response:
        if chunk.text:
            yield chunk.text