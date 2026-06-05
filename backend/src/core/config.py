from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Superdott"
    DATABASE_URL: str
    GEMINI_API_KEY: str
    SENTRY_DSN: str | None = None
    ENV: str = "development"
    SECRET_KEY: str = "superdott-unsafe-dev-secret-key"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120
    RESEND_API_KEY: str = "re_mock_key"
    RESEND_FROM_EMAIL: str = "onboarding@resend.dev"

    R2_ACCOUNT_ID: str = "mock_account_id"
    R2_ACCESS_KEY_ID: str = "mock_access_key"
    R2_SECRET_ACCESS_KEY: str = "mock_secret_key"
    R2_BUCKET_NAME: str = "superdott-storage"
    R2_PRESIGNED_URL_EXPIRY: int = 900

    @property
    def R2_ENDPOINT_URL(self) -> str:
        return f"https://{self.R2_ACCOUNT_ID}.r2.cloudflarestorage.com"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
