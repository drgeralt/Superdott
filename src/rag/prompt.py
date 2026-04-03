from src.rag.retriever import RetrievedChunk

SYSTEM_PROMPT = """Você é o Assistente Pedagógico Superdott, especialista em \
Altas Habilidades e Superdotação (AH/SD).

REGRAS:
1. Responda SOMENTE com base nos trechos de contexto abaixo.
2. Se a resposta não estiver nos trechos, diga exatamente:
   "Não encontrei essa informação na base de conhecimento."
3. Sempre cite a fonte entre colchetes. Exemplo: [Fonte: manual_mec.pdf]
4. Nunca invente dados ou informações.
5. Use linguagem clara para docentes do ensino básico.
6. Se houver perfil do aluno, SEMPRE direcione a resposta para o perfil dominante dele."""


def _get_dominant_dimension(scores: dict) -> tuple[str, float] | None:
    """Retorna a dimensão com maior score e o valor."""
    if not scores:
        return None
    dominant = max(scores, key=scores.get)
    return dominant, scores[dominant]


def build_prompt(
    question: str,
    chunks: list[RetrievedChunk],
    student_context: dict | None = None,
) -> str:
    parts = [SYSTEM_PROMPT]

    if chunks:
        parts.append("\n\nCONTEXTO RECUPERADO:")
        for i, chunk in enumerate(chunks, start=1):
            parts.append(
                f"\n[Trecho {i} | Fonte: {chunk.source}]\n{chunk.content}"
            )
    else:
        parts.append("\n\n[Nenhum trecho relevante encontrado na base de conhecimento.]")

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

            dominant = _get_dominant_dimension(scores)
            if dominant:
                dimension, score = dominant
                parts.append(
                    f"\n- PERFIL DOMINANTE: {dimension.upper()} ({score}/10)"
                    f"\n  → Direcione sua resposta considerando que este aluno"
                    f" se destaca principalmente na dimensão {dimension}."
                )

    parts.append(f"\n\nPERGUNTA DO DOCENTE:\n{question}")
    parts.append("\n\nLembre-se: responda APENAS com base nos trechos acima, cite as fontes e considere o perfil dominante do aluno.")

    return "\n".join(parts)