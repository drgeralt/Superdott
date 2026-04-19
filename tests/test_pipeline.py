# ruff: noqa: E501
"""
tests/test_pipeline.py
----------------------
Testes de integração para o pipeline de RAG (Geração Aumentada por Recuperação).
Garante que o prompt seja montado corretamente e que a IA seja chamada.
A API do Google Gemini é 'mockada' (simulada) para não gastar cota nem depender de internet no CI/CD.
"""

from unittest.mock import MagicMock, patch

from google import genai

from src.rag.prompt import build_prompt
from src.rag.retriever import RetrievedChunk

# ---------------------------------------------------------------------------
# Dados Simulados (Mocks de Banco/Recuperação)
# ---------------------------------------------------------------------------

CHUNKS_FALSOS = [
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

# ---------------------------------------------------------------------------
# Testes
# ---------------------------------------------------------------------------


# O patch pega a classe Client da biblioteca do Google e coloca um mock no lugar
@patch("google.genai.Client")
def test_pipeline_rag_nao_bate_na_api_real(mock_client_class):
    """
    Testa o fluxo crítico do RAG:
    1. Montagem do prompt com contexto.
    2. Interceptação da chamada para a IA (Mock).
    3. Retorno da resposta simulada.
    """

    # 1. Configuração do Mock
    mock_instance = mock_client_class.return_value

    mock_response = MagicMock()
    mock_response.text = "Resposta falsa gerada pelo Mock do CI/CD. O aluno apresenta traços de superdotação."

    # Dizemos que quando chamarem generate_content, ele deve devolver a resposta falsa
    mock_instance.models.generate_content.return_value = mock_response

    # 2. Execução do Código
    # Instanciamos o client com uma chave falsa (o SDK vai aceitar porque é um Mock)
    client = genai.Client(api_key="chave_falsa_apenas_para_teste")

    # Monta o prompt usando a função real do seu sistema
    prompt = build_prompt(
        question="Como identificar um aluno com altas habilidades criativas?",
        chunks=CHUNKS_FALSOS,
        student_context=PERFIL_ALUNO,
    )

    # Tenta chamar a IA (que na verdade vai bater no nosso dublê)
    response = client.models.generate_content(
        model="models/gemini-3.1-flash-lite-preview",
        contents=prompt,
    )

    # 3. Validações (Asserts)
    # Garante que retornou algum texto
    assert response.text is not None

    # Garante que a resposta veio de fato do nosso Mock, e não da internet
    assert "Resposta falsa" in response.text

    # Verifica se a função foi chamada com os parâmetros certos pelo sistema
    mock_instance.models.generate_content.assert_called_once_with(
        model="models/gemini-3.1-flash-lite-preview",
        contents=prompt,
    )
