"""Pydantic-settings based configuration loaded from .env file."""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./agritech.db"
    WEATHER_API_KEY: str = ""
    WEATHER_DEFAULT_CITY: str = "Ludhiana"
    WEATHER_DEFAULT_COUNTRY: str = "IN"
    SECRET_KEY: str = "agritech-dev-secret"
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"
    APP_ENV: str = "development"

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
