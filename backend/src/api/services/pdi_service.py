import re
import uuid
import logging
from datetime import datetime, timezone
from io import BytesIO
from typing import List, Optional

from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

# ReportLab imports
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

from src.core.config import settings
from src.models.student import Student
from src.models.chat_message import ChatMessage
from src.models.chat_session import ChatSession
from src.models.audit_log import AuditAction
from src.api.services.audit_service import create_audit_log
from src.api.services.storage_service import StorageService
from src.rag.pipeline import client as gemini_client, GENERATION_MODEL

logger = logging.getLogger(__name__)

class NumberedCanvas(canvas.Canvas):
    """
    Canvas customizado de duas passagens para desenhar rodapé com
    número total de páginas correto ('Página X de Y') e linha divisória.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        
        # 1. Desenhar a barra decorativa azul no topo (primeira página tem cabeçalho próprio)
        self.setFillColor(colors.HexColor("#0C2C47"))
        self.rect(0, A4[1] - 8, A4[0], 8, fill=True, stroke=False)

        # 2. Rodapé com linha suave e numeração
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Linha superior do rodapé
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.75)
        self.line(54, 50, A4[0] - 54, 50)
        
        # Texto da esquerda
        self.drawString(54, 36, "Documento gerado eletronicamente pelo Superdott - Em conformidade com o MEC")
        
        # Texto da direita (paginação)
        page_text = f"Página {self._pageNumber} de {page_count}"
        self.drawRightString(A4[0] - 54, 36, page_text)
        
        self.restoreState()


class PdiService:
    @staticmethod
    async def get_messages_in_range(
        session: AsyncSession,
        student_id: uuid.UUID,
        start_date: Optional[datetime],
        end_date: Optional[datetime],
    ) -> List[ChatMessage]:
        """
        Busca mensagens de chat associadas ao estudante dentro de uma janela de tempo.
        """
        # 1. Encontra todas as sessões do estudante
        sessions_query = select(ChatSession).where(ChatSession.student_id == student_id)
        sessions_result = await session.exec(sessions_query)
        session_ids = [s.id for s in sessions_result.all()]

        if not session_ids:
            return []

        # 2. Busca todas as mensagens
        msg_query = select(ChatMessage).where(ChatMessage.session_id.in_(session_ids))
        if start_date:
            msg_query = msg_query.where(ChatMessage.created_at >= start_date)
        if end_date:
            msg_query = msg_query.where(ChatMessage.created_at <= end_date)

        msg_query = msg_query.order_by(ChatMessage.created_at.asc())
        result = await session.exec(msg_query)
        return list(result.all())

    @staticmethod
    async def synthesize_pdi_with_gemini(
        student: Student,
        messages: List[ChatMessage],
        include_curriculum: bool,
        include_methodologies: bool,
        omit_informal: bool,
    ) -> str:
        """
        Gera a síntese pedagógica profissional estruturada via Gemini.
        """
        formatted_chat = []
        for msg in messages:
            sender = "Professor/Pai" if msg.role == "user" else "Assistente Pedagógico (IA)"
            formatted_chat.append(f"[{sender}]: {msg.content}")

        chat_history_str = "\n".join(formatted_chat)

        prompt = (
            "Você é um especialista em educação especial e Altas Habilidades/Superdotação (AH/SD).\n"
            "Com base nas interações pedagógicas registradas abaixo, compile um relatório formal de Plano de Desenvolvimento Individual (PDI) consolidado e técnico.\n\n"
            f"Nome do Aluno: {student.full_name}\n"
            f"Scores do Aluno: Intelectual={getattr(student, 'score_intelectual', 0)}/10, Criatividade={getattr(student, 'score_criatividade', 0)}/10, Liderança={getattr(student, 'score_lideranca', 0)}/10\n"
            f"Histórico de Discussões Pedagógicas:\n{chat_history_str}\n\n"
            "Instruções Específicas de Filtros:\n"
        )

        if omit_informal:
            prompt += "- OMITA qualquer saudação social, informalidades, agradecimentos ou conversas pequenas. Foque exclusivamente em observações técnicas de comportamento e potencial pedagógico.\n"
        if include_curriculum:
            prompt += "- Inclua uma seção formal com 'Adaptações Curriculares Sugeridas' com base no perfil do aluno.\n"
        if include_methodologies:
            prompt += "- Inclua uma seção detalhada com 'Metodologias Pedagógicas Recomendadas' para engajamento e aprofundamento das habilidades observadas.\n"

        prompt += (
            "\nO relatório final deve ser formal, administrativo e estritamente formatado em Markdown, contendo as seguintes seções estruturadas:\n"
            "### 1. Resumo Pedagógico e Comportamental\n"
            "### 2. Áreas de Destaque e Habilidades Observadas\n"
            "### 3. Dificuldades ou Pontos de Atenção\n"
        )
        if include_curriculum:
            prompt += "### 4. Adaptações Curriculares Sugeridas\n"
        if include_methodologies:
            prompt += "### 5. Metodologias Pedagógicas Recomendadas\n"

        prompt += "\nUse um tom profissional, analítico, neutro e acadêmico. Mantenha os dados em total conformidade com as diretrizes de educação inclusiva do MEC."

        try:
            response = gemini_client.models.generate_content(
                model=GENERATION_MODEL,
                contents=prompt,
            )
            return response.text or "Erro ao sintetizar relatório com IA."
        except Exception as e:
            logger.error("Failed to generate synthesis from Gemini: %s", e)
            return (
                "### 1. Resumo Pedagógico e Comportamental\n"
                "Ocorreu uma falha técnica ao se comunicar com a Inteligência Artificial para consolidação. "
                "No entanto, as interações pedagógicas foram mantidas e documentadas no sistema."
            )

    @staticmethod
    def generate_pdi_pdf(
        student: Student,
        synthesis_text: str,
        start_date: Optional[datetime],
        end_date: Optional[datetime],
        emissor_name: str,
    ) -> bytes:
        """
        Gera um PDF profissional e estilizado com timbre, dados do aluno, seções pedagógicas e rodapé.
        Retorna os bytes do PDF.
        """
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            leftMargin=54,
            rightMargin=54,
            topMargin=54,
            bottomMargin=64
        )

        styles = getSampleStyleSheet()
        
        # Custom Paragraph Styles
        styles.add(ParagraphStyle(
            name="TitleLeft",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=16,
            textColor=colors.HexColor("#FFFFFF"),
            leading=20
        ))
        
        styles.add(ParagraphStyle(
            name="TitleRight",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=10,
            textColor=colors.HexColor("#FFFFFF"),
            alignment=2, # Right
            leading=14
        ))

        styles.add(ParagraphStyle(
            name="SectionHeading",
            parent=styles["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=11,
            textColor=colors.HexColor("#0C2C47"),
            spaceBefore=14,
            spaceAfter=6,
            keepWithNext=True
        ))

        styles.add(ParagraphStyle(
            name="BodyTextCustom",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=9.5,
            textColor=colors.HexColor("#1E293B"),
            leading=14,
            spaceAfter=8
        ))

        styles.add(ParagraphStyle(
            name="TableLabel",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=8.5,
            textColor=colors.HexColor("#475569")
        ))

        styles.add(ParagraphStyle(
            name="TableValue",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=8.5,
            textColor=colors.HexColor("#0F172A")
        ))

        story = []

        # 1. Timbre de Cabeçalho Corporativo/Institucional (Tabela Navy)
        header_data = [
            [
                Paragraph("SUPERDOTT", styles["TitleLeft"]),
                Paragraph("PLANO DE DESENVOLVIMENTO INDIVIDUAL (PDI)<br/><font size=7 color='#E2E8F0'>DOCUMENTO OFICIAL DE ACOMPANHAMENTO</font>", styles["TitleRight"])
            ]
        ]
        # Largura total disponível em A4 com margens de 54pt: 595.27 - 108 = 487.27
        header_table = Table(header_data, colWidths=[150, 337])
        header_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#0C2C47")),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('TOPPADDING', (0,0), (-1,-1), 12),
            ('BOTTOMPADDING', (0,0), (-1,-1), 12),
            ('LEFTPADDING', (0,0), (-1,-1), 14),
            ('RIGHTPADDING', (0,0), (-1,-1), 14),
        ]))
        story.append(header_table)
        story.append(Spacer(1, 14))

        # 2. Ficha de Identificação do Aluno (Tabela em Grid Suave)
        periodo_str = "Todo o histórico"
        if start_date or end_date:
            sd = start_date.strftime("%d/%m/%Y") if start_date else "Início"
            ed = end_date.strftime("%d/%m/%Y") if end_date else "Hoje"
            periodo_str = f"{sd} até {ed}"

        student_info = [
            [
                Paragraph("ALUNO:", styles["TableLabel"]),
                Paragraph(student.full_name, styles["TableValue"]),
                Paragraph("PERÍODO:", styles["TableLabel"]),
                Paragraph(periodo_str, styles["TableValue"])
            ],
            [
                Paragraph("EMISSÃO:", styles["TableLabel"]),
                Paragraph(datetime.now().strftime("%d/%m/%Y - %H:%M"), styles["TableValue"]),
                Paragraph("EMISSOR:", styles["TableLabel"]),
                Paragraph(emissor_name, styles["TableValue"])
            ],
            [
                Paragraph("INTELECTUAL:", styles["TableLabel"]),
                Paragraph(f"{getattr(student, 'score_intelectual', 0)}/10", styles["TableValue"]),
                Paragraph("CRIATIVIDADE:", styles["TableLabel"]),
                Paragraph(f"{getattr(student, 'score_criatividade', 0)}/10", styles["TableValue"])
            ]
        ]
        info_table = Table(student_info, colWidths=[90, 153, 90, 154])
        info_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
            ('BOX', (0,0), (-1,-1), 0.75, colors.HexColor("#E2E8F0")),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('PADDING', (0,0), (-1,-1), 6),
            ('LEFTPADDING', (0,0), (-1,-1), 10),
        ]))
        story.append(info_table)
        story.append(Spacer(1, 18))

        # 3. Conversão de Markdown Simples para Parágrafos
        blocks = synthesis_text.split("\n\n")
        for block in blocks:
            block = block.strip()
            if not block:
                continue

            style = styles["BodyTextCustom"]
            
            # Se for cabeçalho Markdown (### ou ## ou #)
            if block.startswith("###"):
                style = styles["SectionHeading"]
                block = block.replace("###", "").strip()
            elif block.startswith("##"):
                style = styles["SectionHeading"]
                block = block.replace("##", "").strip()
            elif block.startswith("#"):
                style = styles["SectionHeading"]
                block = block.replace("#", "").strip()

            # Substituições simples de negrito/itálico Markdown -> ReportLab Paragraph HTML tags
            block = re.sub(r"\*\*(.*?)\*\*", r"<b>\1</b>", block)
            block = re.sub(r"\*(.*?)\*", r"<i>\1</i>", block)
            
            # Substituir listas com marcadores simples para parágrafos recuados
            if block.startswith("- ") or block.startswith("* "):
                block = "• " + block[2:]
            
            block = block.replace("\n", "<br/>")

            story.append(Paragraph(block, style))
            story.append(Spacer(1, 4))

        # Compilar o PDF
        doc.build(story, canvasmaker=NumberedCanvas)
        pdf_bytes = buffer.getvalue()
        buffer.close()
        return pdf_bytes

    @staticmethod
    async def export_and_cache_pdi(
        session: AsyncSession,
        student_id: uuid.UUID,
        user_id: int,
        emissor_name: str,
        start_date: Optional[datetime],
        end_date: Optional[datetime],
        include_curriculum: bool,
        include_methodologies: bool,
        omit_informal: bool,
    ) -> bytes:
        """
        Orquestra a busca, geração, cacheamento e auditoria do relatório PDI.
        """
        # 1. Busca os dados do aluno
        student_result = await session.exec(select(Student).where(Student.id == student_id))
        student = student_result.first()
        if not student:
            raise ValueError("Aluno não encontrado.")

        # 2. Busca as mensagens no período
        messages = await PdiService.get_messages_in_range(
            session=session,
            student_id=student_id,
            start_date=start_date,
            end_date=end_date
        )

        if not messages:
            raise ValueError("Nenhuma interação pedagógica encontrada no período selecionado.")

        # 3. Gera a chave única de cache (Baseada nas opções do filtro)
        sd_str = start_date.strftime("%Y%m%d") if start_date else "all"
        ed_str = end_date.strftime("%Y%m%d") if end_date else "all"
        cache_filename = f"pdi_{student_id}_{sd_str}_{ed_str}_{int(include_curriculum)}_{int(include_methodologies)}_{int(omit_informal)}.pdf"

        # Tenta ler do cache do storage
        cached_path = StorageService.get_pdf_path(cache_filename)
        if cached_path:
            with open(cached_path, "rb") as f:
                pdf_bytes = f.read()
        else:
            # 4. Caso contrário, gera uma nova síntese pedagógica com Gemini
            synthesis = await PdiService.synthesize_pdi_with_gemini(
                student=student,
                messages=messages,
                include_curriculum=include_curriculum,
                include_methodologies=include_methodologies,
                omit_informal=omit_informal
            )

            # 5. Desenha o PDF formal usando ReportLab
            pdf_bytes = PdiService.generate_pdi_pdf(
                student=student,
                synthesis_text=synthesis,
                start_date=start_date,
                end_date=end_date,
                emissor_name=emissor_name
            )

            # 6. Salva no cache do Storage
            StorageService.save_pdf(cache_filename, pdf_bytes)

        # 7. Registra a exportação na trilha de auditoria
        await create_audit_log(
            session=session,
            user_id=uuid.UUID(int=user_id),
            action=AuditAction.PDI_GENERATED,
            student_id=student_id,
            details={
                "start_date": start_date.isoformat() if start_date else None,
                "end_date": end_date.isoformat() if end_date else None,
                "include_curriculum": include_curriculum,
                "include_methodologies": include_methodologies,
                "omit_informal": omit_informal,
                "cached": cached_path is not None
            }
        )

        return pdf_bytes
