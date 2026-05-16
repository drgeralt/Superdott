import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Importação dos roteadores
from src.api.routers import assessment, chat, students, system
from src.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title=settings.PROJECT_NAME)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Ajustar em produção
    allow_methods=["*"],
    allow_headers=["*"],
)

# Servindo o Frontend estático (Será removido na Task 1 - Vite)
# app.mount("/app", StaticFiles(directory="frontend"), name="frontend")

# Registro das rotas
app.include_router(system.router)
app.include_router(students.router)
app.include_router(chat.router)
app.include_router(
    assessment.router, prefix="/api"
)  # Prefixo para diferenciar rotas de avaliação

# Validação rápida de chave de IA no log
if not settings.GEMINI_API_KEY or settings.GEMINI_API_KEY == "sua_chave_aqui":
    logger.error("Chave do Gemini não encontrada ou padrão!")
else:
    logger.info(f"Chave Gemini detectada: {settings.GEMINI_API_KEY[:5]}***")
