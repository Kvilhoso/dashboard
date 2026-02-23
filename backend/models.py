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

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    accounts = relationship("MT5Account", back_populates="user")

    def verify_password(self, plain_password: str) -> bool:
        return pwd_context.verify(plain_password, self.hashed_password)

    @staticmethod
    def hash_password(plain_password: str) -> str:
        return pwd_context.hash(plain_password)


class MT5Account(Base):
    __tablename__ = "mt5_accounts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    nickname = Column(String(100))                         # Nome amigável da conta
    mt5_login = Column(Integer, nullable=False)            # Login da conta MT5
    mt5_password_encrypted = Column(Text, nullable=False)  # Senha criptografada AES
    mt5_server = Column(String(255), nullable=False)       # Servidor da corretora
    copy_enabled = Column(Boolean, default=True)           # Ativo/pausado
    lot_multiplier = Column(Float, default=1.0)            # Multiplicador de lote
    max_lot = Column(Float, default=0.0)                   # 0 = sem limite
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_seen = Column(DateTime(timezone=True))

    user = relationship("User", back_populates="accounts")
    trades = relationship("Trade", back_populates="account")
    copy_logs = relationship("CopyLog", back_populates="account")


class Trade(Base):
    __tablename__ = "trades"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("mt5_accounts.id"), nullable=False)
    master_ticket = Column(Integer)          # Ticket na conta mestra
    slave_ticket = Column(Integer)           # Ticket na conta escravo
    symbol = Column(String(50))
    trade_type = Column(String(10))          # BUY ou SELL
    volume = Column(Float)
    price_open = Column(Float)
    price_close = Column(Float)
    sl = Column(Float)
    tp = Column(Float)
    profit = Column(Float)
    status = Column(String(20), default="open")  # open, closed
    opened_at = Column(DateTime(timezone=True))
    closed_at = Column(DateTime(timezone=True))

    account = relationship("MT5Account", back_populates="trades")


class CopyLog(Base):
    __tablename__ = "copy_logs"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("mt5_accounts.id"), nullable=False)
    event_type = Column(String(50))          # trade_opened, trade_closed, trade_modified, error
    master_ticket = Column(Integer)
    slave_ticket = Column(Integer)
    symbol = Column(String(50))
    volume = Column(Float)
    message = Column(Text)
    success = Column(Boolean, default=True)
    latency_ms = Column(Integer)             # Delay de replicação em ms
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    account = relationship("MT5Account", back_populates="copy_logs")
