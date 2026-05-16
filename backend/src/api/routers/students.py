from fastapi import APIRouter, Depends
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from src.core.database import get_session
from src.models.student import Student

router = APIRouter(prefix="/api/students", tags=["Students"])


@router.get("", response_model=list[Student])
async def get_students(session: AsyncSession = Depends(get_session)):
    """Retorna a lista de alunos utilizando SQLModel e PostgreSQL assíncrono."""
    result = await session.exec(select(Student))
    return result.all()
