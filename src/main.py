import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from google import genai

from src.api.routers.assessment import router as assessment_router
from src.core.config import settings
from src.core.database import db
from src.rag.pipeline import ask_stream, ask

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title=settings.PROJECT_NAME)

# obrigatorio ter se não quebra o frontend (CORS) - em produção, restrinja os origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


client = genai.Client(api_key=settings.GEMINI_API_KEY)


@app.on_event("startup")
async def startup():
    await db.connect()
    # DEBUG: Verifique se a chave está chegando aqui
    print(f"DEBUG: Chave Gemini carregada: {settings.GEMINI_API_KEY[:5]}***")

    if not settings.GEMINI_API_KEY or settings.GEMINI_API_KEY == "sua_chave_aqui":
        print("ERRO: Chave do Gemini não encontrada ou padrão!")


@app.on_event("shutdown")
async def shutdown():
    await db.disconnect()


app.mount("/app", StaticFiles(directory="frontend"), name="frontend")


@app.get("/")
async def root():
    # Redireciona automaticamente quem digitar 'localhost:8000' para o dashboard
    return RedirectResponse(url="/app/index.html")


@app.get("/api/students")
async def get_students():
    return await db.students.find_many()


@app.post("/api/chat")
async def chat_pedagogico(payload: dict):
    user_msg = payload.get("message")
    student_ctx = payload.get("student_context")

    try:
        # CHAMADA AO RAG: Aqui ele consulta o PDF antes de falar com a IA
        # A função 'ask' retorna um objeto com 'answer' e 'sources'
        rag_response = await ask(user_msg, student_context=student_ctx)

        return {
            "text": rag_response.answer,
            "sources": rag_response.sources,  # O Frontend vai amar receber isso!
        }

    except Exception as e:
        logger.error(f"Erro no Pipeline RAG: {e}")
        return {
            "text": "Tive um problema ao consultar minha base de documentos.",
            "detail": str(e),
            "sources": [],
        }


@app.post("/api/chat/stream")
async def chat_stream(payload: dict):
    user_msg = payload.get("message")
    # Pega o contexto do aluno (poderia vir do banco)
    student_ctx = payload.get(
        "student_context",
        {
            "name": "Ana Beatriz Silva",
            "scores": {"intelectual": 8, "criatividade": 9, "liderança": 4},
        },
    )

    async def event_generator():
        async for token in ask_stream(user_msg, student_context=student_ctx):
            yield token

    return StreamingResponse(event_generator(), media_type="text/plain")


app.include_router(assessment_router, prefix="/api")


@app.get("/health")
def health():
    return {"status": "ok"}
