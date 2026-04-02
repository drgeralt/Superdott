from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Superdott"
    DATABASE_URL: str
    GEMINI_API_KEY: str
    SENTRY_DSN: str | None = None
    ENV: str = "development"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
