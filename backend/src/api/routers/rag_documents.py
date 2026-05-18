import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from uuid import UUID
from datetime import datetime
from src.core.database import get_session
from src.models.user import User, UserRole
from src.models.student_document import StudentDocument
from src.api.deps import get_current_user

router = APIRouter(prefix="/api/rag_documents", tags=["RAG Documents"])

# Ensure upload directory exists
UPLOAD_DIR = os.path.abspath(os.path.join(os.getcwd(), "uploads", "student_documents"))
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/{student_id}/documents", status_code=status.HTTP_201_CREATED)
async def upload_document(
    student_id: UUID,
    file: UploadFile = File(...),
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.Pai:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Somente pais podem enviar documentos.")

    # Basic validation of file type (accept pdf, docx, txt)
    allowed = {"application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"}
    if file.content_type not in allowed:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tipo de arquivo não suportado.")

    # Save file to disk
    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    filename = f"{student_id}_{timestamp}_{file.filename}".replace(" ", "_")
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    file.file.seek(0)
    file_bytes = await file.read()
    with open(file_path, "wb") as buffer:
        buffer.write(file_bytes)

    doc = StudentDocument(
        student_id=student_id,
        parent_id=current_user.id,
        filename=file.filename,
        file_path=file_path,
        shared_with_school=False,
        uploaded_at=datetime.utcnow(),
    )
    session.add(doc)
    await session.commit()
    await session.refresh(doc)

    import logging
    logger = logging.getLogger(__name__)
    try:
        from src.api.services.ingestion_service import IngestionService
        service = IngestionService(session)
        await service.process_student_document(file_bytes, file.filename, doc.id)
    except Exception as e:
        logger.error(f"Erro ao gerar embeddings para o documento {file.filename}: {e}")

    return {"id": doc.id, "filename": doc.filename, "shared_with_school": doc.shared_with_school}

@router.get("/{student_id}/documents", response_model=list[StudentDocument])
async def list_documents(
    student_id: UUID,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    # Parents see all their own documents; professors see only shared ones
    query = select(StudentDocument).where(StudentDocument.student_id == student_id)
    if current_user.role == UserRole.Pai:
        query = query.where(StudentDocument.parent_id == current_user.id)
    elif current_user.role == UserRole.Professor:
        # Professor can see only if shared_with_school is True
        query = query.where(StudentDocument.shared_with_school == True)
    else:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acesso não permitido.")
    result = await session.exec(query)
    return result.all()

@router.put("/documents/{doc_id}/share", response_model=StudentDocument)
async def toggle_share(
    doc_id: UUID,
    shared: bool,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.Pai:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Somente pais podem atualizar o compartilhamento.")
    doc = await session.get(StudentDocument, doc_id)
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Documento não encontrado.")
    if doc.parent_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Você não tem permissão para modificar este documento.")
    doc.shared_with_school = shared
    session.add(doc)
    await session.commit()
    await session.refresh(doc)
    return doc
