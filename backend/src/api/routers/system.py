from fastapi import APIRouter
from fastapi.responses import RedirectResponse

router = APIRouter(tags=["System"])


@router.get("/")
async def root():
    # Redireciona automaticamente quem digitar 'localhost:8000'
    return RedirectResponse(url="/app/index.html")


@router.get("/health")
@router.head("/health")
async def health_check():
    return {"status": "healthy"}
