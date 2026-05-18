import asyncio
import os
from logging.config import fileConfig

from alembic import context
from sqlalchemy import pool
from sqlalchemy.ext.asyncio import async_engine_from_config
from sqlmodel import SQLModel
from dotenv import load_dotenv

from src.core.config import settings
from src.models.answer import Answer
from src.models.assessment import Assessment
from src.models.audit_log import AuditLog, AuditAction
from src.models.chat_message import ChatMessage
from src.models.chat_session import ChatSession
from src.models.knowledge_base import KnowledgeBase
from src.models.school import School
from src.models.student import Student
from src.models.token import Token

load_dotenv()

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = SQLModel.metadata


def get_async_url():
    """Garante que a URL utilize o driver asyncpg e a conexão direta para o Alembic"""
    # Tenta pegar a URL de migração primeiro, se não achar, usa a padrão da API
    url = os.getenv("SYNC_DATABASE_URL", str(settings.DATABASE_URL))
    
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+asyncpg://", 1)
    elif url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
    return url


def run_migrations_offline() -> None:
    url = get_async_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection):
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    configuration = config.get_section(config.config_ini_section)
    configuration["sqlalchemy.url"] = get_async_url()

    connectable = async_engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())