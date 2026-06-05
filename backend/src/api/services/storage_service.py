import logging
from pathlib import Path
from typing import Optional
import aioboto3
from botocore.exceptions import ClientError
from src.core.config import settings

logger = logging.getLogger(__name__)

_session = aioboto3.Session()

def _is_mock() -> bool:
    return (
        settings.R2_ACCESS_KEY_ID == "mock_access_key"
        or settings.ENV == "testing"
    )


class StorageService:
    """
    Cliente assíncrono para Cloudflare R2 (compatível com API S3).
    Em ambiente de desenvolvimento/teste, todas as operações são simuladas
    localmente sem tráfego real para o R2.
    """

    _mock_store: dict[str, bytes] = {}

    @staticmethod
    async def upload_file(
        file_bytes: bytes,
        key: str,
        content_type: str = "application/octet-stream",
    ) -> str:
        """
        Faz upload de bytes para o R2.
        Retorna a chave (key) do objeto — salve essa string no banco, nunca a URL.

        Exemplo de key: 'pdi/uuid-aluno/pdi_nome_aluno.pdf'
        """
        if _is_mock():
            StorageService._mock_store[key] = file_bytes
            logger.info("[STORAGE MOCK] upload: key=%s size=%d bytes", key, len(file_bytes))
            return key

        async with _session.client(
            "s3",
            endpoint_url=settings.R2_ENDPOINT_URL,
            aws_access_key_id=settings.R2_ACCESS_KEY_ID,
            aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
            region_name="auto",
        ) as s3:
            await s3.put_object(
                Bucket=settings.R2_BUCKET_NAME,
                Key=key,
                Body=file_bytes,
                ContentType=content_type,
            )
            logger.info("R2 upload ok: key=%s", key)
            return key

    @staticmethod
    async def generate_presigned_url(
        key: str,
        expiry_seconds: int | None = None,
    ) -> str:
        """
        Gera uma URL pré-assinada temporária de leitura.
        O frontend usa essa URL para exibir/baixar o arquivo sem torná-lo público.
        Expira em `expiry_seconds` segundos (padrão: R2_PRESIGNED_URL_EXPIRY do .env).
        """
        expiry = expiry_seconds or settings.R2_PRESIGNED_URL_EXPIRY

        if _is_mock():
            mock_url = f"http://localhost/mock-storage/{key}?expires_in={expiry}"
            logger.info("[STORAGE MOCK] presigned_url: key=%s url=%s", key, mock_url)
            return mock_url

        async with _session.client(
            "s3",
            endpoint_url=settings.R2_ENDPOINT_URL,
            aws_access_key_id=settings.R2_ACCESS_KEY_ID,
            aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
            region_name="auto",
        ) as s3:
            url = await s3.generate_presigned_url(
                "get_object",
                Params={
                    "Bucket": settings.R2_BUCKET_NAME,
                    "Key": key,
                },
                ExpiresIn=expiry,
            )
            logger.info("R2 presigned_url gerada: key=%s expiry=%ds", key, expiry)
            return url

    @staticmethod
    async def delete_file(key: str) -> bool:
        """Remove um objeto do bucket. Retorna True se bem-sucedido."""
        if _is_mock():
            StorageService._mock_store.pop(key, None)
            logger.info("[STORAGE MOCK] delete: key=%s", key)
            return True

        try:
            async with _session.client(
                "s3",
                endpoint_url=settings.R2_ENDPOINT_URL,
                aws_access_key_id=settings.R2_ACCESS_KEY_ID,
                aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
                region_name="auto",
            ) as s3:
                await s3.delete_object(
                    Bucket=settings.R2_BUCKET_NAME,
                    Key=key,
                )
                logger.info("R2 delete ok: key=%s", key)
                return True
        except ClientError as exc:
            logger.error("R2 delete falhou: key=%s erro=%s", key, exc)
            return False

    # Helpers de conveniência para PDI

    @staticmethod
    def build_pdi_key(student_id: str, filename: str) -> str:
        """Constrói a chave padronizada para PDIs: 'pdi/{student_id}/{filename}'"""
        return f"pdi/{student_id}/{filename}"

    @staticmethod
    async def save_pdf(filename: str, content: bytes, student_id: str | None = None) -> str:
        """
        Compatibilidade com o PdiService existente.
        Faz upload e retorna a key (não o path local como antes).
        """
        key = StorageService.build_pdi_key(student_id or "shared", filename)
        return await StorageService.upload_file(key, content, content_type="application/pdf")

    @staticmethod
    async def get_pdf_path(filename: str, student_id: str | None = None) -> Optional[str]:
        """
        Compatibilidade com o PdiService existente.
        Retorna URL pré-assinada em vez de path local.
        """
        key = StorageService.build_pdi_key(student_id or "shared", filename)
        return await StorageService.generate_presigned_url(key)
