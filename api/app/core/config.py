from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+psycopg://apptest:changeme@db:5432/apptest"
    redis_url: str = "redis://redis:6379/0"

    api_secret_key: str = "dev-only-change-me"
    api_jwt_expire_days: int = 7
    api_cors_origins: str = "http://localhost:5173,http://localhost:3000"
    api_cookie_secure: bool = False
    api_cookie_domain: str = ""

    upload_dir: str = "/app/uploads"
    upload_max_bytes: int = 5 * 1024 * 1024
    upload_max_dimension: int = 2048

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.api_cors_origins.split(",") if o.strip()]


settings = Settings()
