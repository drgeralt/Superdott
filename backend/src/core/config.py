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

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
