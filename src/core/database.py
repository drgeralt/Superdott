from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlmodel.ext.asyncio.session import AsyncSession

from src.core.config import settings

# Converte a URL do Postgres para usar o driver assíncrono (asyncpg)
# Ex: de postgresql://user:pass... para postgresql+asyncpg://user:pass...
db_url = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")

# Cria o motor do banco de dados
engine = create_async_engine(db_url, echo=False)


# Injeção de dependência para as rotas do FastAPI
async def get_session():
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as session:
        yield session
