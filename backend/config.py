"""config.py — Configurações centrais do sistema"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App
    SECRET_KEY: str = "CHANGE_THIS_IN_PRODUCTION"
    FRONTEND_URL: str = "http://localhost:3000"

    # Banco de dados
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres123@localhost/projektrage"

    # Google OAuth
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/api/auth/google/callback"

    # Email (para verificação e recuperação de senha)
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAIL_FROM: str = "noreply@projektrage.com.br"

    # Conta Mestra MT5
    MASTER_LOGIN: int = 0
    MASTER_PASSWORD: str = ""
    MASTER_SERVER: str = ""

    # Copy Engine
    POLL_INTERVAL_MS: int = 200
    MAX_SLIPPAGE_POINTS: int = 10
    MAGIC_NUMBER: int = 99999

    # Criptografia AES para senhas MT5
    ENCRYPTION_KEY: str = "CHANGE_THIS_32_CHAR_KEY_IN_PROD!!"

    class Config:
        env_file = ".env"


settings = Settings()
