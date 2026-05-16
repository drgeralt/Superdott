import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.routers import assessment, chat, documents, students, system, audit
from src.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(system.router)
app.include_router(students.router)
app.include_router(chat.router)
app.include_router(assessment.router, prefix="/api")
app.include_router(audit.router)

app.include_router(documents.router)

if not settings.GEMINI_API_KEY or settings.GEMINI_API_KEY == "sua_chave_aqui":
    logger.error("Chave do Gemini não encontrada ou padrão!")
else:
    logger.info(f"Chave Gemini detectada: {settings.GEMINI_API_KEY[:5]}***")
