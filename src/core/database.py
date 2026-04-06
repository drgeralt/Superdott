"""
src/core/database.py
--------------------
Configura a conexão com o PostgreSQL usando SQLModel (que usa SQLAlchemy por baixo).

Por que SQLModel e não Prisma aqui?
  - O Prisma neste projeto é usado para MIGRAR o schema (prisma migrate).
  - Para QUERIES dentro do Python/FastAPI, o SQLModel é mais idiomático
    e integra nativamente com o FastAPI via Dependency Injection.
"""

from src.generated.prisma import Prisma

db = Prisma()


async def get_session():
    return db
