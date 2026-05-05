# ruff: noqa: E501
import pytest
from src.rag.prompt import build_prompt
from src.rag.retriever import RetrievedChunk

CHUNKS = [
    RetrievedChunk(
        id=1,
        content="Alunos com altas habilidades criativas demonstram originalidade e fluência de ideias.",
        source="manual_mec.pdf",
        similarity=0.92,
    ),
    RetrievedChunk(
        id=2,
        content="A superdotação criativa se manifesta através de soluções inovadoras para problemas.",
        source="manual_mec.pdf",
        similarity=0.87,
    ),
]

PERFIL_ALUNO = {
    "name": "Ana Lima",
    "grade": "6º ano",
    "scores": {"criatividade": 9, "intelectual": 6},
}

PERGUNTA = "Como identificar um aluno com altas habilidades criativas?"


def test_prompt_contem_pergunta():
    """O prompt deve conter a pergunta original."""
    prompt = build_prompt(question=PERGUNTA, chunks=CHUNKS)
    assert PERGUNTA in prompt


def test_prompt_contem_conteudo_dos_chunks():
    """O prompt deve conter o conteúdo dos chunks passados."""
    prompt = build_prompt(question=PERGUNTA, chunks=CHUNKS)
    for chunk in CHUNKS:
        assert chunk.content in prompt


def test_prompt_contem_fonte_dos_chunks():
    """O prompt deve citar as fontes dos chunks."""
    prompt = build_prompt(question=PERGUNTA, chunks=CHUNKS)
    assert "manual_mec.pdf" in prompt


def test_prompt_sem_chunks_tem_aviso():
    """Sem chunks, o prompt deve indicar ausência de contexto."""
    prompt = build_prompt(question=PERGUNTA, chunks=[])
    assert "Nenhum trecho relevante" in prompt or "nenhum" in prompt.lower()


def test_prompt_com_perfil_aluno_contem_nome():
    """Com perfil do aluno, o prompt deve conter o nome."""
    prompt = build_prompt(question=PERGUNTA, chunks=CHUNKS, student_context=PERFIL_ALUNO)
    assert "Ana Lima" in prompt


def test_prompt_com_perfil_aluno_contem_scores():
    """Com perfil do aluno, o prompt deve conter os scores."""
    prompt = build_prompt(question=PERGUNTA, chunks=CHUNKS, student_context=PERFIL_ALUNO)
    assert "criatividade" in prompt.lower() or "9" in prompt