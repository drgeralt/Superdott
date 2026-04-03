import re
from pathlib import Path
from dataclasses import dataclass

try:
    from pypdf import PdfReader
    PDF_SUPPORT = True
except ImportError:
    PDF_SUPPORT = False


@dataclass
class DocumentChunk:
    content: str      # texto do trecho
    source: str       # nome do arquivo
    chunk_index: int  # posição do trecho no documento


def load_documents(
    docs_dir: str | Path,
    extensions: tuple = (".pdf", ".txt")
) -> list[DocumentChunk]:
    """
    aqui ele vai ler todos os documentos de uma pasta e retorna lista de chunks
    """
    docs_path = Path(docs_dir)

    if not docs_path.exists():
        raise FileNotFoundError(f"Pasta não encontrada: {docs_path}")

    all_chunks = []

    for file_path in sorted(docs_path.iterdir()):
        if file_path.suffix.lower() not in extensions:
            continue

        print(f"Carregando: {file_path.name}")

        if file_path.suffix.lower() == ".pdf":
            chunks = _load_pdf(file_path)
        else:
            chunks = _load_txt(file_path)

        all_chunks.extend(chunks)
        print(f"  → {len(chunks)} chunks gerados")

    print(f"\nTotal: {len(all_chunks)} chunks")
    return all_chunks


def _load_txt(file_path: Path) -> list[DocumentChunk]:
    text = file_path.read_text(encoding="utf-8", errors="ignore")
    return _split_into_chunks(text, file_path.name)


def _load_pdf(file_path: Path) -> list[DocumentChunk]:
    if not PDF_SUPPORT:
        raise ImportError("pypdf não instalado. Execute: pip install pypdf")

    reader = PdfReader(str(file_path))
    full_text = ""

    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            full_text += page_text + "\n"

    if not full_text.strip():
        print(f"  AVISO: '{file_path.name}' não tem texto extraível.")
        return []

    return _split_into_chunks(full_text, file_path.name)


def _split_into_chunks(
    text: str,
    source_name: str,
    chunk_size: int = 500,
    overlap: int = 50,
) -> list[DocumentChunk]:
    text = re.sub(r'\s+', ' ', text).strip()
    words = text.split()

    if not words:
        return []

    chunks = []
    step = chunk_size - overlap

    for i, start in enumerate(range(0, len(words), step)):
        chunk_words = words[start:start + chunk_size]

        if len(chunk_words) < 20 and i > 0:
            break

        chunks.append(
            DocumentChunk(
                content=" ".join(chunk_words),
                source=source_name,
                chunk_index=i,
            )
        )

    return chunks