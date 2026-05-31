import logging
from pathlib import Path
from src.core.config import settings
import resend

logger = logging.getLogger(__name__)

_TEMPLATE_PATH = Path("/app/backend/src/templates/emails/invitation.html")


def _render_template(
    nome_responsavel: str,
    school_name: str,
    student_name: str,
    turma: str | None,
    code: str,
) -> str:
    template = _TEMPLATE_PATH.read_text(encoding="utf-8")
    turma_texto = f"(Turma: {turma})" if turma else ""
    app_url = "http://localhost" if settings.ENV != "production" else "https://superdott.com.br"
    
    return (
        template
        .replace("{{nome_responsavel}}", nome_responsavel)
        .replace("{{school_name}}", school_name)
        .replace("{{student_name}}", student_name)
        .replace("{{turma_texto}}", turma_texto)
        .replace("{{code}}", code)
        .replace("{{app_url}}", app_url)
    )


async def send_invitation_email(
    email_responsavel: str,
    nome_responsavel: str,
    student_name: str,
    turma: str | None,
    code: str,
    school_name: str,
) -> bool:
    subject = f"Convite Superdott: Acompanhe o desenvolvimento de {student_name}"

    if settings.RESEND_API_KEY == "re_mock_key" or settings.ENV == "testing":
        logger.info(
            "\n[EMAIL SIMULADO RESEND]\n"
            "Para: %s (%s)\nAssunto: %s\nCódigo: %s\nEstudante: %s (%s)\n"
            "--------------------------------------------------",
            email_responsavel, nome_responsavel, subject, code, student_name, school_name,
        )
        return True

    try:
        html_content = _render_template(nome_responsavel, school_name, student_name, turma, code)
        resend.api_key = settings.RESEND_API_KEY
        resend.Emails.send({
            "from": settings.RESEND_FROM_EMAIL,
            "to": [email_responsavel],
            "subject": subject,
            "html": html_content,
        })
        logger.info("E-mail enviado via Resend para %s", email_responsavel)
        return True
    except Exception as e:
        logger.error("Exceção ao disparar e-mail via Resend: %s", e)
        return False
