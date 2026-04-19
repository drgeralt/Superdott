import io
import re

from pypdf import PdfReader


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Extrai o texto bruto de um arquivo PDF em memória.
    Limpa caracteres nulos e quebras de linha excessivas.
    """
    reader = PdfReader(io.BytesIO(file_bytes))
    extracted_text = []

    for page in reader.pages:
        text = page.extract_text()
        if text:
            extracted_text.append(text)

    full_text = "\n".join(extracted_text)

    # Limpeza básica
    full_text = full_text.replace("\x00", "")
    full_text = re.sub(r"\s+", " ", full_text).strip()

    return full_text


def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> list[str]:
    """
    Fatia o texto em blocos mantendo a sobreposição (overlap).
    Evita cortar palavras ao meio buscando o último espaço em branco.
    """
    if not text:
        return []

    chunks = []
    start = 0
    text_length = len(text)

    while start < text_length:
        end = start + chunk_size

        if end >= text_length:
            chunks.append(text[start:text_length].strip())
            break

        last_space = text.rfind(" ", start, end)

        if last_space != -1 and last_space > start + overlap:
            end = last_space

        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)

        start = end - overlap

    return chunks
