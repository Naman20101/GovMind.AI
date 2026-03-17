from pydantic_settings import BaseSettings
from pydantic import Field
from typing import List


class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    ENVIRONMENT: str = "development"
    CORS_ORIGINS: List[str] = Field(
        default=["http://localhost:3000", "https://your-vercel-app.vercel.app"]
    )
    MAX_UPLOAD_SIZE_MB: int = 10

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
