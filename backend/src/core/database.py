from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlmodel.ext.asyncio.session import AsyncSession

from src.core.config import settings

db_url = str(settings.DATABASE_URL)
if db_url.startswith("postgresql://"):
    db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

# Cria o motor do banco de dados com suporte seguro e pool de conexões persistente
engine = create_async_engine(
    db_url,
    pool_size=5,                               # Mantém até 5 conexões abertas e persistentes
    max_overflow=10,                           # Permite até 10 conexões extras em picos de uso
    pool_pre_ping=True,                        # Testa a conexão antes de usar para evitar conexões caídas
    connect_args={
        "statement_cache_size": 0,             # Mantém o cache do asyncpg desativado
        "prepared_statement_name_func": lambda *args: ""  # Mantém os statements anônimos para o pooler do Supabase (dentro do connect_args)
    }
)


# Injeção de dependência para as rotas do FastAPI
async def get_session():
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as session:
        yield session
