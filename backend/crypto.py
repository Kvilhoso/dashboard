"""crypto.py — Criptografia AES para senhas MT5"""

from cryptography.fernet import Fernet
from config import settings
import base64
import hashlib


def _get_fernet():
    # Deriva uma chave Fernet de 32 bytes a partir da ENCRYPTION_KEY
    key = hashlib.sha256(settings.ENCRYPTION_KEY.encode()).digest()
    return Fernet(base64.urlsafe_b64encode(key))


def encrypt_password(plain_password: str) -> str:
    """Criptografa a senha MT5 antes de salvar no banco"""
    f = _get_fernet()
    return f.encrypt(plain_password.encode()).decode()


def decrypt_password(encrypted_password: str) -> str:
    """Descriptografa a senha MT5 para uso no login"""
    f = _get_fernet()
    return f.decrypt(encrypted_password.encode()).decode()
