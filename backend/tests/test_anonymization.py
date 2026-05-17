import pytest
from src.api.services.anonymization_service import AnonymizationService
from src.api.routers.chat import _stream_deanonymizer

def test_anonymize_student_full_and_first_name():
    text = "O aluno João Silva, também conhecido como João, foi muito bem na aula."
    anon = AnonymizationService.anonymize(text, "João Silva")
    assert anon == "O aluno [ALUNO], também conhecido como [ALUNO], foi muito bem na aula."

def test_anonymize_case_insensitive():
    text = "O aluno joão silva e o JOÃO gostam de programar."
    anon = AnonymizationService.anonymize(text, "João Silva")
    assert anon == "O aluno [ALUNO] e o [ALUNO] gostam de programar."

def test_anonymize_student_and_parent():
    text = "João Silva é filho de Maria Oliveira. João é muito criativo."
    anon = AnonymizationService.anonymize(text, "João Silva", "Maria Oliveira")
    assert anon == "[ALUNO] é filho de [RESPONSÁVEL]. [ALUNO] é muito criativo."

def test_deanonymize():
    text = "O [ALUNO] deve focar mais em matemática, segundo o [RESPONSÁVEL]."
    deanonymized = AnonymizationService.deanonymize(text, "João", "Maria")
    assert deanonymized == "O João deve focar mais em matemática, segundo o Maria."

@pytest.mark.asyncio
async def test_stream_deanonymizer():
    # Simulando chunks vindo do Gemini onde o "[ALUNO]" pode estar quebrado
    async def mock_stream():
        chunks = ["Olá, o ", "[ALU", "NO] foi super ", "bem na t", "arefa."]
        for c in chunks:
            yield c

    stream = mock_stream()
    result = []
    async for token in _stream_deanonymizer(stream, "Pedro"):
        result.append(token)

    full_text = "".join(result)
    assert full_text == "Olá, o Pedro foi super bem na tarefa."
