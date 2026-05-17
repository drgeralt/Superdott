import os
import logging
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)

# Diretório padrão para cache local
STORAGE_DIR = Path(__file__).resolve().parent.parent.parent.parent / "storage" / "pdi"

class StorageService:
    @staticmethod
    def initialize() -> None:
        """Garante que a pasta de armazenamento local exista."""
        try:
            STORAGE_DIR.mkdir(parents=True, exist_ok=True)
            logger.info("StorageService initialized at %s", STORAGE_DIR)
        except Exception as e:
            logger.error("Failed to initialize StorageService directory: %s", e)

    @staticmethod
    def save_pdf(filename: str, content: bytes) -> str:
        """
        Salva o arquivo PDF no cache de armazenamento local.
        Retorna o caminho absoluto do arquivo salvo.
        """
        StorageService.initialize()
        file_path = STORAGE_DIR / filename
        try:
            file_path.write_bytes(content)
            logger.info("PDI PDF saved to local cache: %s", file_path)
            return str(file_path)
        except Exception as e:
            logger.error("Failed to save PDF to storage: %s", e)
            raise RuntimeError(f"Erro ao salvar arquivo no storage: {e}")

    @staticmethod
    def get_pdf_path(filename: str) -> Optional[str]:
        """
        Retorna o caminho absoluto do PDF caso ele exista no cache de armazenamento.
        Caso contrário, retorna None.
        """
        file_path = STORAGE_DIR / filename
        if file_path.exists():
            logger.info("Cache hit for PDI PDF: %s", filename)
            return str(file_path)
        return None
