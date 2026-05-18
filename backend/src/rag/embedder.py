from google import genai

from src.core.config import settings

client = genai.Client(api_key=settings.GEMINI_API_KEY)

EMBEDDING_MODEL = "models/gemini-embedding-001"
EMBEDDING_DIM = 3072


def embed_document(text: str) -> list[float]:
    """
    usa quando for salvar um trecho de alguns dos documentos no banco
    """
    result = client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=text,
    )
    vector = result.embeddings[0].values
    if len(vector) < EMBEDDING_DIM:
        vector = vector + [0.0] * (EMBEDDING_DIM - len(vector))
    elif len(vector) > EMBEDDING_DIM:
        vector = vector[:EMBEDDING_DIM]
    return vector


def embed_query(text: str) -> list[float]:
    """
    usa quando for vetorizar a pergunta
    """
    result = client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=text,
    )
    vector = result.embeddings[0].values
    if len(vector) < EMBEDDING_DIM:
        vector = vector + [0.0] * (EMBEDDING_DIM - len(vector))
    elif len(vector) > EMBEDDING_DIM:
        vector = vector[:EMBEDDING_DIM]
    return vector
