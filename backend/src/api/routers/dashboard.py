# backend/src/api/routers/dashboard.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select, func
from sqlmodel.ext.asyncio.session import AsyncSession
from datetime import datetime, timezone
from uuid import UUID

from src.core.database import get_session
from src.api.deps import get_current_user
from src.models.user import User, UserRole
from src.models.student import Student
from src.models.links import ParentStudentLink, SchoolStudentLink
from src.models.audit_log import AuditLog, AuditAction
from src.models.chat_session import ChatSession
from src.models.answer import Answer

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/summary")
async def get_dashboard_summary(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """
    Retorna os dados sumarizados do dashboard baseados na Role do usuário atual,
    respeitando o isolamento e políticas de segurança.
    """
    try:
        role = current_user.role

        # ----------------------------------------------------
        # DIRETOR / SUPERADMIN
        # ----------------------------------------------------
        if role in (UserRole.Diretor, UserRole.SuperAdmin):
            # 1. Total de alunos vinculados
            students_count_query = select(func.count(SchoolStudentLink.student_id))
            students_count = (await session.exec(students_count_query)).first() or 0

            # 2. Professores ativos
            teachers_count_query = select(func.count(User.id)).where(User.role == UserRole.Professor)
            teachers_count = (await session.exec(teachers_count_query)).first() or 0

            # 3. PDIs gerados no mês atual (UTC)
            now = datetime.utcnow()
            first_day_of_month = datetime(now.year, now.month, 1)
            pdi_count_query = select(func.count(AuditLog.id)).where(
                AuditLog.action == AuditAction.PDI_GENERATED,
                AuditLog.created_at >= first_day_of_month
            )
            pdi_count = (await session.exec(pdi_count_query)).first() or 0

            return {
                "role": role,
                "metrics": {
                    "total_students": students_count,
                    "active_teachers": teachers_count,
                    "pdis_generated_month": pdi_count
                },
                "recent_students": [],
                "alerts": []
            }

        # ----------------------------------------------------
        # PROFESSOR
        # ----------------------------------------------------
        elif role == UserRole.Professor:
            # 1. Todos os alunos do sistema
            students_query = select(Student)
            students_res = await session.exec(students_query)
            students = students_res.all()

            # 2. Última interação de chat para cada aluno
            sessions_query = select(ChatSession)
            sessions_res = await session.exec(sessions_query)
            sessions = sessions_res.all()

            last_interaction_map = {}
            for s in sessions:
                dt = s.updated_at or s.created_at
                if dt:
                    student_id_str = str(s.student_id)
                    if student_id_str not in last_interaction_map or dt > last_interaction_map[student_id_str]:
                        last_interaction_map[student_id_str] = dt

            # 3. Mapeamento de PDIs gerados para cada aluno
            pdi_audit_query = select(AuditLog.target_student_id).where(
                AuditLog.action == AuditAction.PDI_GENERATED
            )
            pdis_res = await session.exec(pdi_audit_query)
            generated_student_ids = {str(target_id) for target_id in pdis_res.all() if target_id}

            recent_students = []
            alerts = []

            for student in students:
                student_id_str = str(student.id)
                last_interaction = last_interaction_map.get(student_id_str)
                has_pdi = student_id_str in generated_student_ids

                recent_students.append({
                    "id": student_id_str,
                    "full_name": student.full_name,
                    "email": student.email,
                    "last_interaction": last_interaction.strftime("%Y-%m-%d %H:%M:%S") if last_interaction else None,
                    "has_pdi": has_pdi
                })

                if not has_pdi:
                    alerts.append({
                        "type": "pdi_pending",
                        "student_id": student_id_str,
                        "student_name": student.full_name,
                        "message": f"Plano de Desenvolvimento Individual (PDI) pendente para {student.full_name}."
                    })

            return {
                "role": role,
                "metrics": {
                    "total_students": len(students),
                    "pending_pdis": len(alerts)
                },
                "recent_students": recent_students,
                "alerts": alerts
            }

        # ----------------------------------------------------
        # PAI / RESPONSÁVEL
        # ----------------------------------------------------
        elif role == UserRole.Pai:
            # 1. Alunos vinculados ao Pai
            parent_students_query = select(Student).join(ParentStudentLink).where(
                ParentStudentLink.parent_id == current_user.id
            )
            parent_students_res = await session.exec(parent_students_query)
            parent_students = parent_students_res.all()

            recent_students = []
            alerts = []

            for child in parent_students:
                child_id_str = str(child.id)

                # Busca respostas e scores de triagem da criança
                answers_query = select(Answer).where(Answer.student_id == child.id)
                answers_res = await session.exec(answers_query)
                answers = answers_res.all()

                if answers:
                    scores = [float(a.score) for a in answers if a.score is not None]
                    overall_score = round(sum(scores) / len(scores), 2) if scores else None
                    triage = {
                        "completed": True,
                        "overall_score": overall_score,
                        "completed_at": answers[0].created_at.strftime("%Y-%m-%d") if answers[0].created_at else None
                    }
                else:
                    triage = {
                        "completed": False,
                        "overall_score": None,
                        "completed_at": None
                    }

                recent_students.append({
                    "id": child_id_str,
                    "full_name": child.full_name,
                    "email": child.email,
                    "triage": triage
                })

                if not triage["completed"]:
                    alerts.append({
                        "type": "triage_pending",
                        "student_id": child_id_str,
                        "student_name": child.full_name,
                        "message": f"A triagem de Altas Habilidades de {child.full_name} ainda não foi realizada."
                    })

            return {
                "role": role,
                "metrics": {
                    "linked_children": len(parent_students),
                    "pending_triages": len(alerts)
                },
                "recent_students": recent_students,
                "alerts": alerts
            }

        # Fallback genérico para papéis desconhecidos
        else:
            return {
                "role": role,
                "metrics": {},
                "recent_students": [],
                "alerts": []
            }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao carregar sumário do dashboard: {str(e)}"
        )
