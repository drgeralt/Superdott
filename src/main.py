import logging

import sentry_sdk
from fastapi import FastAPI

from src.api.routers.assessment import router as assessment_router
from src.core.config import settings

# Configuração básica de Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Gatekeeper de Erros (Sentry)
if settings.ENV != "development" and settings.SENTRY_DSN:
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        traces_sample_rate=1.0,
        environment=settings.ENV,
    )

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=(
        "Plataforma de inteligência pedagógica para identificação de alunos com "
        "Altas Habilidades ou Superdotação (AH/SD)."
    ),
    version="1.0.0",
)

app.include_router(assessment_router)


@app.get("/health")
def health_check():
    logger.info("Health check requested")
    return {"status": "online", "version": "1.0.0"}
