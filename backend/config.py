"""config.py — Configurações centrais do sistema"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App
    SECRET_KEY: str = "CHANGE_THIS_IN_PRODUCTION"
    FRONTEND_URL: str = "https://www.projektrage.com.br"
    
    # Conta Mestra MT5
    MASTER_LOGIN: int = 0
    MASTER_PASSWORD: str = ""
    MASTER_SERVER: str = ""

    # Copy Engine
    POLL_INTERVAL_MS: int = 200       # Intervalo de polling (ms)
    MAX_SLIPPAGE_POINTS: int = 10     # Slippage máximo aceito
    MAGIC_NUMBER: int = 99999         # Magic number para identificar ordens copiadas

    # Banco de dados
    DATABASE_URL: str = "postgresql+asyncpg://user:pass@localhost/mt5copy"

    # Criptografia AES
    ENCRYPTION_KEY: str = "CHANGE_THIS_32_CHAR_KEY_IN_PROD!!"

    class Config:
        env_file = ".env"


settings = Settings()
