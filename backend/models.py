"""models.py — Modelos do banco de dados (SQLAlchemy async)"""

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from passlib.context import CryptContext

Base = declarative_base()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class User(Base):
    __tablename__ = "users"

    id                      = Column(Integer, primary_key=True, index=True)
    email                   = Column(String(255), unique=True, nullable=False, index=True)
    name                    = Column(String(255), nullable=False)
    hashed_password         = Column(String(255), nullable=False, default="")
    avatar                  = Column(String(500))                   # URL da foto (Google)
    google_id               = Column(String(255), unique=True)      # ID do Google OAuth
    plan                    = Column(String(50))                    # entry, pro, dynamic, unlimited, None
    plan_activated_at       = Column(DateTime(timezone=True))
    email_verified          = Column(Boolean, default=False)
    email_verified_at       = Column(DateTime(timezone=True))
    email_verification_code = Column(String(6))                     # Código 6 dígitos
    email_code_expires_at   = Column(DateTime(timezone=True))
    password_reset_token    = Column(String(255))
    is_active               = Column(Boolean, default=True)
    is_admin                = Column(Boolean, default=False)
    created_at              = Column(DateTime(timezone=True), server_default=func.now())

    accounts = relationship("MT5Account", back_populates="user")
    sessions = relationship("UserSession", back_populates="user")

    def verify_password(self, plain_password: str) -> bool:
        if not self.hashed_password:
            return False
        return pwd_context.verify(plain_password, self.hashed_password)

    @staticmethod
    def hash_password(plain_password: str) -> str:
        return pwd_context.hash(plain_password)


class UserSession(Base):
    __tablename__ = "user_sessions"

    id            = Column(Integer, primary_key=True, index=True)
    user_id       = Column(Integer, ForeignKey("users.id"), nullable=False)
    refresh_token = Column(String(500), unique=True, nullable=False)
    expires_at    = Column(DateTime(timezone=True), nullable=False)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="sessions")


class MT5Account(Base):
    __tablename__ = "mt5_accounts"

    id                      = Column(Integer, primary_key=True, index=True)
    user_id                 = Column(Integer, ForeignKey("users.id"), nullable=False)
    nickname                = Column(String(100))
    mt5_login               = Column(Integer, nullable=False)
    mt5_password_encrypted  = Column(Text, nullable=False)
    mt5_server              = Column(String(255), nullable=False)
    copy_enabled            = Column(Boolean, default=True)
    lot_multiplier          = Column(Float, default=1.0)
    max_lot                 = Column(Float, default=0.0)
    created_at              = Column(DateTime(timezone=True), server_default=func.now())
    last_seen               = Column(DateTime(timezone=True))

    user      = relationship("User", back_populates="accounts")
    trades    = relationship("Trade", back_populates="account")
    copy_logs = relationship("CopyLog", back_populates="account")


class Trade(Base):
    __tablename__ = "trades"

    id            = Column(Integer, primary_key=True, index=True)
    account_id    = Column(Integer, ForeignKey("mt5_accounts.id"), nullable=False)
    master_ticket = Column(Integer)
    slave_ticket  = Column(Integer)
    symbol        = Column(String(50))
    trade_type    = Column(String(10))
    volume        = Column(Float)
    price_open    = Column(Float)
    price_close   = Column(Float)
    sl            = Column(Float)
    tp            = Column(Float)
    profit        = Column(Float)
    status        = Column(String(20), default="open")
    opened_at     = Column(DateTime(timezone=True))
    closed_at     = Column(DateTime(timezone=True))

    account = relationship("MT5Account", back_populates="trades")


class CopyLog(Base):
    __tablename__ = "copy_logs"

    id            = Column(Integer, primary_key=True, index=True)
    account_id    = Column(Integer, ForeignKey("mt5_accounts.id"), nullable=False)
    event_type    = Column(String(50))
    master_ticket = Column(Integer)
    slave_ticket  = Column(Integer)
    symbol        = Column(String(50))
    volume        = Column(Float)
    message       = Column(Text)
    success       = Column(Boolean, default=True)
    latency_ms    = Column(Integer)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())

    account = relationship("MT5Account", back_populates="copy_logs")
