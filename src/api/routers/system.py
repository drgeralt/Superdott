from fastapi import APIRouter
from fastapi.responses import RedirectResponse

router = APIRouter(tags=["System"])


@router.get("/")
async def root():
    # Redireciona automaticamente quem digitar 'localhost:8000'
    return RedirectResponse(url="/app/index.html")


@router.get("/health")
def health():
    return {"status": "ok"}
