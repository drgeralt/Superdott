import sentry_sdk
import logging
from fastapi import FastAPI
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

app = FastAPI(title=settings.PROJECT_NAME)

@app.get("/health")
def health_check():
    logger.info("Health check requested")
    return {"status": "online", "version": "1.0.0"}