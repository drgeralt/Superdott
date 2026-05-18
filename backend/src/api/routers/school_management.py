from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import select, func
from sqlmodel.ext.asyncio.session import AsyncSession
from src.core.database import get_session
from src.api.deps import get_current_user
from src.models.user import User, UserRole
from src.models.school import School
from src.models.links import SchoolStudentLink
from src.models.document import Document
from uuid import UUID
from datetime import datetime

router = APIRouter(prefix="/api/school-management", tags=["school_management"])

class SchoolUpdateRequest(BaseModel):
    name: str
    address: str | None = None

class SchoolStatsResponse(BaseModel):
    id: UUID
    name: str
    address: str | None = None
    total_students: int
    total_teachers: int
    total_documents: int
    created_at: datetime | None = None

@router.get("", response_model=SchoolStatsResponse)
async def get_school_profile(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    if current_user.role not in (UserRole.Diretor, UserRole.SuperAdmin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso exclusivo para Diretores e Administradores."
        )

    # Get school
    school_id = current_user.school_id
    if not school_id:
        # Fallback to the first school in DB for convenience
        school_result = await session.exec(select(School))
        school = school_result.first()
        if not school:
            school = School(name="Escola Superdott", address="Endereço Principal")
            session.add(school)
            await session.commit()
            await session.refresh(school)
        school_id = school.id
        current_user.school_id = school_id
        session.add(current_user)
        await session.commit()
    else:
        school = await session.get(School, school_id)
        if not school:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Escola não encontrada."
            )

    # Count statistics
    # 1. Total students
    students_count_res = await session.exec(
        select(func.count(SchoolStudentLink.student_id)).where(SchoolStudentLink.school_id == school_id)
    )
    total_students = students_count_res.first() or 0

    # 2. Total teachers
    teachers_count_res = await session.exec(
        select(func.count(User.id)).where(User.school_id == school_id, User.role == UserRole.Professor)
    )
    total_teachers = teachers_count_res.first() or 0

    # 3. Total documents
    docs_count_res = await session.exec(
        select(func.count(Document.id)).where((Document.school_id == school_id) | (Document.school_id == None))
    )
    total_documents = docs_count_res.first() or 0

    return SchoolStatsResponse(
        id=school.id,
        name=school.name,
        address=school.address,
        total_students=total_students,
        total_teachers=total_teachers,
        total_documents=total_documents,
        created_at=school.created_at
    )

@router.put("")
async def update_school_profile(
    payload: SchoolUpdateRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    if current_user.role not in (UserRole.Diretor, UserRole.SuperAdmin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso exclusivo para Diretores e Administradores."
        )

    school_id = current_user.school_id
    if not school_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="O usuário logado não possui escola vinculada."
        )

    school = await session.get(School, school_id)
    if not school:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Escola não encontrada."
        )

    school.name = payload.name
    school.address = payload.address
    school.updated_at = datetime.now()
    session.add(school)
    await session.commit()
    return {"message": "Informações da escola atualizadas com sucesso!"}

class SchoolCreateRequest(BaseModel):
    name: str
    address: str | None = None
    director_email: str
    director_password: str

@router.get("/admin/schools")
async def admin_list_schools(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    if current_user.role != UserRole.SuperAdmin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso exclusivo para o Administrador Global."
        )

    schools_res = await session.exec(select(School))
    schools = schools_res.all()

    schools_with_stats = []
    for school in schools:
        dir_res = await session.exec(
            select(User).where(User.school_id == school.id, User.role == UserRole.Diretor)
        )
        director = dir_res.first()
        director_email = director.email if director else "Não atribuído"

        students_count_res = await session.exec(
            select(func.count(SchoolStudentLink.student_id)).where(SchoolStudentLink.school_id == school.id)
        )
        total_students = students_count_res.first() or 0

        teachers_count_res = await session.exec(
            select(func.count(User.id)).where(User.school_id == school.id, User.role == UserRole.Professor)
        )
        total_teachers = teachers_count_res.first() or 0

        docs_count_res = await session.exec(
            select(func.count(Document.id)).where(Document.school_id == school.id)
        )
        total_documents = docs_count_res.first() or 0

        schools_with_stats.append({
            "id": str(school.id),
            "name": school.name,
            "address": school.address,
            "director_email": director_email,
            "total_students": total_students,
            "total_teachers": total_teachers,
            "total_documents": total_documents,
            "created_at": school.created_at.strftime("%Y-%m-%d") if school.created_at else None
        })

    return schools_with_stats

@router.post("/admin/schools", status_code=status.HTTP_201_CREATED)
async def admin_create_school(
    payload: SchoolCreateRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    if current_user.role != UserRole.SuperAdmin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso exclusivo para o Administrador Global."
        )

    existing_user_res = await session.exec(select(User).where(User.email == payload.director_email))
    existing_user = existing_user_res.first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="E-mail do diretor já está cadastrado no sistema."
        )

    school = School(
        name=payload.name,
        address=payload.address,
        created_at=datetime.now(),
        updated_at=datetime.now()
    )
    session.add(school)
    await session.flush()

    from src.core.security import get_password_hash
    director = User(
        email=payload.director_email,
        hashed_password=get_password_hash(payload.director_password),
        role=UserRole.Diretor,
        school_id=school.id,
        is_active=True,
        accepted_tcle=True
    )
    session.add(director)

    await session.commit()
    return {"message": "Escola e Diretor cadastrados com sucesso!", "school_id": str(school.id)}
