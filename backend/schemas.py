"""schemas.py — Schemas Pydantic para validação de requests/responses"""

from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# ─── AUTH ─────────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class VerifyEmailRequest(BaseModel):
    code: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"

class RefreshRequest(BaseModel):
    refresh_token: str


# ─── USUÁRIO ──────────────────────────────────────────────────────────────────

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    avatar: Optional[str]
    plan: Optional[str]
    email_verified: bool
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ─── CONTAS MT5 ───────────────────────────────────────────────────────────────

class AccountCreate(BaseModel):
    nickname: str
    login: int
    password: str
    server: str
    lot_multiplier: float = 1.0

class AccountUpdate(BaseModel):
    nickname: Optional[str]
    lot_multiplier: Optional[float]

class AccountResponse(BaseModel):
    id: int
    nickname: str
    mt5_login: int
    mt5_server: str
    copy_enabled: bool
    lot_multiplier: float
    created_at: datetime
    last_seen: Optional[datetime]

    class Config:
        from_attributes = True


# ─── TRADES ───────────────────────────────────────────────────────────────────

class TradeResponse(BaseModel):
    id: int
    symbol: str
    trade_type: str
    volume: float
    price_open: float
    price_close: Optional[float]
    profit: Optional[float]
    status: str
    opened_at: Optional[datetime]
    closed_at: Optional[datetime]

    class Config:
        from_attributes = True


# ─── LOGS ─────────────────────────────────────────────────────────────────────

class LogResponse(BaseModel):
    id: int
    event_type: str
    symbol: Optional[str]
    message: Optional[str]
    success: bool
    latency_ms: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True
