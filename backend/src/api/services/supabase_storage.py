import uuid
import logging
import os
from supabase import create_client, Client
from src.core.config import settings
from fastapi import UploadFile

logger = logging.getLogger(__name__)

class SupabaseStorageService:
    def __init__(self):
        self.supabase: Client | None = None
        if settings.SUPABASE_URL and settings.SUPABASE_KEY:
            try:
                self.supabase = create_client(
                    str(settings.SUPABASE_URL), 
                    str(settings.SUPABASE_KEY)
                )
                logger.info("Supabase Client initialized successfully for Storage.")
            except Exception as e:
                logger.error("Failed to initialize Supabase Client: %s", e)
        else:
            logger.warning("Supabase URL e Key não configurados. Usando fallback para armazenamento local.")

    async def upload_file(self, bucket: str, file: UploadFile) -> str:
        """
        Lê o arquivo de forma assíncrona. Se o Supabase estiver configurado, faz o upload e retorna a URL pública.
        Caso contrário, salva localmente e retorna a URL relativa.
        """
        file.file.seek(0)
        file_bytes = await file.read()
        
        ext = file.filename.split('.')[-1] if '.' in file.filename else 'bin'
        unique_filename = f"{uuid.uuid4()}.{ext}"

        if self.supabase:
            try:
                # Upload para o Supabase Storage
                self.supabase.storage.from_(bucket).upload(
                    file=file_bytes,
                    path=unique_filename,
                    file_options={"content-type": file.content_type}
                )
                # URL Pública
                public_url = self.supabase.storage.from_(bucket).get_public_url(unique_filename)
                logger.info("Upload com sucesso de %s no bucket %s (Supabase). URL: %s", file.filename, bucket, public_url)
                return public_url
            except Exception as e:
                logger.exception("Falha no upload do Supabase para %s: %s", file.filename, e)
                if settings.ENV == "production":
                    raise RuntimeError(f"Erro crítico: Falha no upload para o Supabase Storage em ambiente de produção: {e}")

        # Em produção, impede terminantemente o fallback local silencioso se as credenciais estiverem ausentes
        if settings.ENV == "production":
            raise RuntimeError("Erro crítico: Supabase Storage não está configurado em ambiente de produção (chaves ausentes).")

        # FALLBACK LOCAL: Apenas em desenvolvimento/teste para facilitar a vida do dev local
        logger.info("Utilizando armazenamento local (fallback de desenvolvimento) para o arquivo %s", file.filename)
        local_dir = os.path.join("uploads", bucket)
        os.makedirs(local_dir, exist_ok=True)
        local_path = os.path.join(local_dir, unique_filename)
        
        with open(local_path, "wb") as buffer:
            buffer.write(file_bytes)
            
        logger.info("Arquivo salvo localmente em: %s", local_path)
        return f"/uploads/{bucket}/{unique_filename}"

storage_service = SupabaseStorageService()
