import logging
import httpx
from src.core.config import settings

logger = logging.getLogger(__name__)

async def send_invitation_email(
    email_responsavel: str,
    nome_responsavel: str,
    student_name: str,
    turma: str | None,
    code: str,
    school_name: str
) -> bool:
    """
    Dispara um e-mail de convite para o responsável vinculando-o ao estudante.
    Se a chave do Resend for a de desenvolvimento ('re_mock_key'), simula o envio no terminal.
    """
    subject = f"Convite Superdott: Acompanhe o desenvolvimento de {student_name}"
    
    # Template HTML responsivo e sofisticado com HSL e gradientes
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Convite Superdott</title>
        <style>
            body {{
                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                background-color: #f8fafc;
                margin: 0;
                padding: 0;
                -webkit-font-smoothing: antialiased;
            }}
            .container {{
                max-width: 600px;
                margin: 40px auto;
                background: #ffffff;
                border-radius: 24px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
                border: 1px solid #f1f5f9;
                overflow: hidden;
            }}
            .header {{
                background: linear-gradient(135deg, #0C2C47 0%, #4A9D95 100%);
                padding: 40px 20px;
                text-align: center;
                color: #ffffff;
            }}
            .header h1 {{
                margin: 0;
                font-size: 26px;
                font-weight: 800;
                letter-spacing: -0.5px;
            }}
            .content {{
                padding: 40px 30px;
                color: #334155;
                line-height: 1.6;
            }}
            .content h2 {{
                font-size: 20px;
                font-weight: 700;
                color: #0C2C47;
                margin-top: 0;
            }}
            .code-box {{
                background: #f8fafc;
                border: 2px dashed #4A9D95;
                border-radius: 16px;
                padding: 24px;
                text-align: center;
                margin: 30px 0;
            }}
            .code {{
                font-size: 32px;
                font-family: monospace;
                font-weight: 800;
                color: #0C2C47;
                letter-spacing: 4px;
                margin: 0;
            }}
            .btn {{
                display: inline-block;
                background: linear-gradient(135deg, #0C2C47 0%, #4A9D95 100%);
                color: #ffffff !important;
                text-decoration: none;
                padding: 14px 30px;
                border-radius: 12px;
                font-weight: bold;
                font-size: 14px;
                text-align: center;
                margin-top: 10px;
            }}
            .footer {{
                background-color: #f8fafc;
                padding: 24px;
                text-align: center;
                font-size: 12px;
                color: #64748b;
                border-top: 1px solid #f1f5f9;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Superdott.</h1>
            </div>
            <div class="content">
                <h2>Olá, {nome_responsavel}!</h2>
                <p>A instituição <strong>{school_name}</strong> adicionou <strong>{student_name}</strong> {f'(Turma: {turma})' if turma else ''} à plataforma Superdott.</p>
                <p>Como pai/responsável, você pode acompanhar relatórios de desenvolvimento individual (PDI), interagir com nosso cérebro de Inteligência Pedagógica e colaborar de perto com o corpo docente.</p>
                
                <div class="code-box">
                    <p style="margin: 0 0 10px 0; font-size: 13px; text-transform: uppercase; font-weight: bold; color: #4A9D95; tracking-wider: 1px;">Seu Código de Vínculo</p>
                    <p class="code">{code}</p>
                </div>
                
                <p>Para resgatar o perfil e começar, acesse a plataforma, faça o cadastro/login e vá até a área de <strong>Códigos de Vínculo</strong> para digitar o código acima.</p>
                
                <div style="text-align: center; margin-top: 30px;">
                    <a href="http://localhost/codigos-vinculo" class="btn">Acessar a Plataforma</a>
                </div>
            </div>
            <div class="footer">
                <p>Este é um e-mail automático enviado pela plataforma Superdott em nome de {school_name}.<br>&copy; 2026 Superdott. Todos os direitos reservados.</p>
            </div>
        </div>
    </body>
    </html>
    """

    if settings.RESEND_API_KEY == "re_mock_key" or settings.ENV == "testing":
        # Simulação perfeita em ambiente de desenvolvimento ou testes
        logger.info(
            f"\n[EMAIL SIMULADO RESEND]\n"
            f"Para: {email_responsavel} ({nome_responsavel})\n"
            f"Assunto: {subject}\n"
            f"Código Gerado: {code}\n"
            f"Estudante: {student_name} ({school_name})\n"
            f"--------------------------------------------------\n"
        )
        return True

    # Envio oficial usando httpx
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": f"Bearer {settings.RESEND_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "from": settings.RESEND_FROM_EMAIL,
                    "to": email_responsavel,
                    "subject": subject,
                    "html": html_content
                },
                timeout=10.0
            )
            if response.status_code in (200, 201):
                logger.info(f"E-mail de convite enviado via Resend com sucesso para {email_responsavel}")
                return True
            else:
                logger.error(f"Erro ao disparar e-mail via Resend: {response.status_code} - {response.text}")
                return False
    except Exception as e:
        logger.error(f"Exceção ao disparar e-mail via Resend: {str(e)}")
        return False
