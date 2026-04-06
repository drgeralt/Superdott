"""
src/core/database.py
--------------------
Configura a conexão com o PostgreSQL usando SQLModel (que usa SQLAlchemy por baixo).

Por que SQLModel e não Prisma aqui?
  - O Prisma neste projeto é usado para MIGRAR o schema (prisma migrate).
  - Para QUERIES dentro do Python/FastAPI, o SQLModel é mais idiomático
    e integra nativamente com o FastAPI via Dependency Injection.
"""

from sqlmodel import Session, create_engine

from src.core.config import settings

# O engine é criado UMA VEZ quando o módulo é importado.
# connect_args é necessário para PostgreSQL com psycopg2 (driver síncrono).
engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.ENV == "development",  # Loga SQL apenas em dev
    connect_args={},
)


def get_session():
    """
    Dependency do FastAPI: abre uma Session de banco por request
    e garante que ela seja fechada ao final (mesmo com erro).

    Uso nos endpoints:
        def meu_endpoint(session: Session = Depends(get_session)):
            ...
    """
    with Session(engine) as session:
        yield session
