from src.rag.retriever import RetrievedChunk

SYSTEM_PROMPT = """Você é o Assistente Pedagógico Superdott, especialista em \
Altas Habilidades e Superdotação (AH/SD).

REGRAS:
1. Responda SOMENTE com base nos trechos de contexto abaixo.
2. Se a resposta não estiver nos trechos, diga exatamente:
   "Não encontrei essa informação na base de conhecimento."
3. Sempre cite a fonte entre colchetes. Exemplo: [Fonte: manual_mec.pdf]
4. Nunca invente dados ou informações.
5. Use linguagem clara para docentes do ensino básico."""


def build_prompt(
    question: str,
    chunks: list[RetrievedChunk],
    student_context: dict | None = None,
) -> str:
    parts = [SYSTEM_PROMPT]

    # Trechos recuperados
    if chunks:
        parts.append("\n\nCONTEXTO RECUPERADO:")
        for i, chunk in enumerate(chunks, start=1):
            parts.append(
                f"\n[Trecho {i} | Fonte: {chunk.source}]\n{chunk.content}"
            )
    else:
        parts.append("\n\n[Nenhum trecho relevante encontrado na base de conhecimento.]")

    # Perfil do aluno
    if student_context:
        parts.append("\n\nPERFIL DO ALUNO:")
        if name := student_context.get("name"):
            parts.append(f"- Nome: {name}")
        if grade := student_context.get("grade"):
            parts.append(f"- Série: {grade}")
        scores = student_context.get("scores", {})
        if scores:
            parts.append("- Scores da triagem:")
            for dimension, score in scores.items():
                parts.append(f"  • {dimension}: {score}/10")

    # Pergunta
    parts.append(f"\n\nPERGUNTA DO DOCENTE:\n{question}")
    parts.append("\n\nLembre-se: responda APENAS com base nos trechos acima e cite as fontes.")

    return "\n".join(parts)