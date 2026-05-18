import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.routers import assessment, chat, documents, students, system, audit, dashboard, knowledge_base
from src.core.config import settings
from src.api.routers import link_code

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title=settings.PROJECT_NAME)

@app.on_event("startup")
async def on_startup():
    from src.core.database import engine
    from sqlalchemy import text
    try:
        async with engine.begin() as conn:
            await conn.execute(text(
                "ALTER TABLE documents ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id) ON DELETE CASCADE;"
            ))
            await conn.execute(text(
                'ALTER TABLE student_link_codes ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES "user"(id) ON DELETE SET NULL;'
            ))
            await conn.execute(text(
                'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id) ON DELETE SET NULL;'
            ))
            await conn.execute(text(
                '''
                CREATE TABLE IF NOT EXISTS teacher_school_links (
                    teacher_id INTEGER REFERENCES "user"(id) ON DELETE CASCADE,
                    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
                    PRIMARY KEY (teacher_id, school_id)
                );
                '''
            ))
            await conn.execute(text(
                'ALTER TABLE students ADD COLUMN IF NOT EXISTS score_intelectual DOUBLE PRECISION;'
            ))
            await conn.execute(text(
                'ALTER TABLE students ADD COLUMN IF NOT EXISTS score_criativo DOUBLE PRECISION;'
            ))
            await conn.execute(text(
                'ALTER TABLE students ADD COLUMN IF NOT EXISTS score_lideranca DOUBLE PRECISION;'
            ))
            await conn.execute(text(
                'ALTER TABLE students ADD COLUMN IF NOT EXISTS triage_completed BOOLEAN DEFAULT FALSE;'
            ))
            await conn.execute(text(
                'ALTER TABLE students ADD COLUMN IF NOT EXISTS avatar_url VARCHAR;'
            ))
            await conn.execute(text(
                'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS avatar_url VARCHAR;'
            ))
            await conn.execute(text(
                '''
                CREATE TABLE IF NOT EXISTS student_documents (
                    id UUID PRIMARY KEY,
                    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
                    parent_id INTEGER REFERENCES "user"(id) ON DELETE CASCADE,
                    filename VARCHAR NOT NULL,
                    file_path VARCHAR NOT NULL,
                    shared_with_school BOOLEAN DEFAULT FALSE,
                    uploaded_at TIMESTAMP NOT NULL
                );
                '''
            ))
            await conn.execute(text(
                '''
                CREATE TABLE IF NOT EXISTS student_document_chunks (
                    id UUID PRIMARY KEY,
                    student_document_id UUID REFERENCES student_documents(id) ON DELETE CASCADE,
                    conteudo_texto TEXT NOT NULL,
                    embedding VECTOR(3072)
                );
                '''
            ))
            logger.info("Database startup migrations: tables and columns successfully verified/added.")
    except Exception as e:
        logger.error(f"Failed to execute startup migrations: {e}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# Registro das rotas
from src.api.routers import auth
from src.api.deps import get_current_user
from fastapi import Depends

app.include_router(auth.router)
app.include_router(system.router)
protected = [Depends(get_current_user)]

app.include_router(students.router, dependencies=protected)
app.include_router(chat.router, dependencies=protected)
app.include_router(assessment.router, prefix="/api")
app.include_router(audit.router, dependencies=protected)
app.include_router(documents.router, dependencies=protected)
app.include_router(dashboard.router, dependencies=protected)
app.include_router(knowledge_base.router, dependencies=protected)

from fastapi.staticfiles import StaticFiles
import os

os.makedirs("uploads/avatars", exist_ok=True)
os.makedirs("uploads/documents", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

from src.api.routers import profile, school_management, teachers_api, academic_links, teachers_multi_school, student_triage, rag_documents

app.include_router(profile.router, dependencies=protected)
app.include_router(school_management.router, dependencies=protected)
app.include_router(teachers_api.router, dependencies=protected)
app.include_router(academic_links.router, dependencies=protected)
app.include_router(teachers_multi_school.router, dependencies=protected)
app.include_router(student_triage.router, dependencies=protected)
app.include_router(rag_documents.router, dependencies=protected)

app.include_router(link_code.router)

if not settings.GEMINI_API_KEY or settings.GEMINI_API_KEY == "sua_chave_aqui":
    logger.error("Chave do Gemini não encontrada ou padrão!")
else:
    logger.info(f"Chave Gemini detectada: {settings.GEMINI_API_KEY[:5]}***")