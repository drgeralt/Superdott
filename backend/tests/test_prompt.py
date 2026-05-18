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


def test_prompt_especializado_pai():
    """Deve utilizar o PROMPT_PARENT para o perfil de Pai."""
    from src.models.user import UserRole
    prompt = build_prompt(question=PERGUNTA, chunks=CHUNKS, user_role=UserRole.Pai)
    assert "falando diretamente com um Pai/Mãe/Responsável" in prompt
    assert "[PAI/MÃE]" not in prompt # Sender only in history


def test_prompt_especializado_professor():
    """Deve utilizar o PROMPT_TEACHER para o perfil de Professor."""
    from src.models.user import UserRole
    prompt = build_prompt(question=PERGUNTA, chunks=CHUNKS, user_role=UserRole.Professor)
    assert "falando diretamente com um Professor" in prompt


def test_prompt_especializado_diretor():
    """Deve utilizar o PROMPT_PRINCIPAL para o perfil de Diretor."""
    from src.models.user import UserRole
    prompt = build_prompt(question=PERGUNTA, chunks=CHUNKS, user_role=UserRole.Diretor)
    assert "falando diretamente com um Diretor / Gestor Escolar" in prompt


def test_prompt_especializado_default():
    """Deve utilizar o SYSTEM_PROMPT padrão quando a role não é fornecida."""
    prompt = build_prompt(question=PERGUNTA, chunks=CHUNKS)
    assert "Você é o Assistente Pedagógico Superdott, especialista em Altas Habilidades" in prompt