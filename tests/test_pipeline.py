from google import genai

from src.core.config import settings
from src.rag.prompt import build_prompt
from src.rag.retriever import RetrievedChunk

client = genai.Client(api_key=settings.GEMINI_API_KEY)

# Simula chunks como se viessem do banco
chunks_falsos = [
    RetrievedChunk(
        id=1,
        content="Alunos com altas habilidades criativas demonstram originalidade e fluência de ideias.",
        source="manual_mec.pdf",
        similarity=0.92,
    ),
    RetrievedChunk(
        id=2,
        content="A superdotação criativa se manifesta através de soluções inovadoras para problemas.",
        source="manual_mec.pdf",
        similarity=0.87,
    ),
]

perfil_aluno = {
    "name": "Ana Lima",
    "grade": "6º ano",
    "scores": {"criatividade": 9, "intelectual": 6},
}

prompt = build_prompt(
    question="Como identificar um aluno com altas habilidades criativas?",
    chunks=chunks_falsos,
    student_context=perfil_aluno,
)

response = client.models.generate_content(
    # modelo temporário talvez, era o que tinha mais cota
    model="models/gemini-3.1-flash-lite-preview",
    contents=prompt,
)

print("RESPOSTA DO GEMINI:")
print("=" * 50)
print(response.text)
