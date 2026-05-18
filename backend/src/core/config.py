from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Superdott"
    DATABASE_URL: str
    GEMINI_API_KEY: str
    SENTRY_DSN: str | None = None
    ENV: str = "development"
    SUPERADMIN_EMAIL: str = "admin@superdott.edu"
    SUPERADMIN_PASSWORD: str = "admin123"
    SECRET_KEY: str = "superdott-unsafe-dev-secret-key"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120
    RESEND_API_KEY: str = "re_mock_key"
    RESEND_FROM_EMAIL: str = "onboarding@resend.dev"
    SUPABASE_URL: str | None = None
    SUPABASE_KEY: str | None = None

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    def __init__(self, **values):
        super().__init__(**values)
        if self.DATABASE_URL:
            self.DATABASE_URL = self.DATABASE_URL.strip("\"'")
        if self.GEMINI_API_KEY:
            self.GEMINI_API_KEY = self.GEMINI_API_KEY.strip("\"'")
        if self.SUPABASE_URL:
            self.SUPABASE_URL = self.SUPABASE_URL.strip("\"'")
        if self.SUPABASE_KEY:
            self.SUPABASE_KEY = self.SUPABASE_KEY.strip("\"'")

settings = Settings()
