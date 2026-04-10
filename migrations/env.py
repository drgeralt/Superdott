import asyncio
from logging.config import fileConfig

from alembic import context
from sqlalchemy import pool, text
from sqlalchemy.ext.asyncio import create_async_engine
from sqlmodel import SQLModel

# 1. Importações (O linter não vai mexer aqui porque vamos usá-las)
from src.core.config import settings as app_settings
from src.models.answer import Answer
from src.models.assessment import Assessment
from src.models.knowledge_base import KnowledgeBase
from src.models.school import School
from src.models.student import Student
from src.models.token import Token

# Forçamos o uso para o linter e para garantir o registro no Metadata
_all_models = [School, Student, Assessment, Answer, KnowledgeBase, Token]

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Vinculamos o Metadata do SQLModel
target_metadata = SQLModel.metadata


def do_run_migrations(connection):
    # 1. Configuramos o contexto
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True,
    )

    # 2. Rodamos as migrações (O Alembic gerencia a transação interna dele aqui)
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    url = app_settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")

    connectable = create_async_engine(url, poolclass=pool.NullPool)

    # USAMOS .connect() para poder rodar a extensão fora de uma transação se necessário
    async with connectable.connect() as connection:
        # A. Garantir a extensão vector (algumas vezes falha dentro de transações de tabela)
        await connection.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
        await connection.commit()

        # B. Rodar as migrações dentro de uma transação explícita que faz COMMIT
        await connection.run_sync(do_run_migrations)
        await connection.commit()  # <--- O SEGREDO ESTÁ AQUI

    await connectable.dispose()


def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())


def run_migrations_offline() -> None:
    url = app_settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
