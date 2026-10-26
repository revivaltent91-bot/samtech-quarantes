from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    database_url: str = "postgresql+psycopg://quarantes:quarantes@localhost:5432/quarantes"
    session_secret: str = "change-me-in-production"
    front_origins: str = "http://localhost:3000,http://localhost:5173"
    db_pool_pre_ping: bool = True

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.front_origins.split(",") if o.strip()]


settings = Settings()