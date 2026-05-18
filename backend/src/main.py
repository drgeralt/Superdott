import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.routers import assessment, chat, documents, students, system, audit, dashboard
from src.core.config import settings
from src.api.routers import link_code

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

# Registro das rotas
from src.api.routers import auth
from src.api.deps import get_current_user
from fastapi import Depends

app.include_router(auth.router)

protected = [Depends(get_current_user)]

app.include_router(system.router, dependencies=protected)
app.include_router(students.router, dependencies=protected)
app.include_router(chat.router, dependencies=protected)
app.include_router(assessment.router, prefix="/api")
app.include_router(audit.router, dependencies=protected)
app.include_router(documents.router, dependencies=protected)
app.include_router(dashboard.router, dependencies=protected)

app.include_router(link_code.router)

if not settings.GEMINI_API_KEY or settings.GEMINI_API_KEY == "sua_chave_aqui":
    logger.error("Chave do Gemini não encontrada ou padrão!")
else:
    logger.info(f"Chave Gemini detectada: {settings.GEMINI_API_KEY[:5]}***")