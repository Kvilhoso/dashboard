"""database.py — Camada de banco de dados (SQLAlchemy async)"""

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import select, update, delete
from sqlalchemy.orm import selectinload
from datetime import datetime
from typing import Optional

from config import settings
from models import Base, User, MT5Account, Trade, CopyLog
from crypto import encrypt_password

# Engine async
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def init_db():
    """Cria todas as tabelas se não existirem"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_db():
    """Dependency injection para rotas FastAPI"""
    async with AsyncSessionLocal() as session:
        yield DB(session)


class DB:
    def __init__(self, session: AsyncSession):
        self.session = session

    # ─── USUÁRIOS ─────────────────────────────────────────────────────────────

    async def get_user(self, user_id: str) -> Optional[User]:
        result = await self.session.get(User, int(user_id))
        return result

    async def get_user_by_email(self, email: str) -> Optional[User]:
        result = await self.session.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()

    async def get_user_by_google_id(self, google_id: str) -> Optional[User]:
        result = await self.session.execute(
            select(User).where(User.google_id == google_id)
        )
        return result.scalar_one_or_none()

    async def create_user(self, name: str, email: str, password: Optional[str] = None, google_id: Optional[str] = None, avatar: Optional[str] = None) -> User:
        user = User(
            name=name,
            email=email,
            hashed_password=User.hash_password(password) if password else "",
            google_id=google_id,
            avatar=avatar,
        )
        self.session.add(user)
        await self.session.commit()
        await self.session.refresh(user)
        return user

    async def update_user_plan(self, user_id: int, plan: Optional[str]) -> User:
        user = await self.session.get(User, user_id)
        user.plan = plan
        user.plan_activated_at = datetime.utcnow() if plan else None
        await self.session.commit()
        await self.session.refresh(user)
        return user

    async def verify_user_email(self, user_id: int) -> User:
        user = await self.session.get(User, user_id)
        user.email_verified = True
        user.email_verified_at = datetime.utcnow()
        await self.session.commit()
        await self.session.refresh(user)
        return user

    async def set_email_code(self, user_id: int, code: str):
        user = await self.session.get(User, user_id)
        user.email_verification_code = code
        user.email_code_expires_at = datetime.utcnow().replace(microsecond=0)
        await self.session.commit()

    async def set_reset_token(self, user_id: int, token: str):
        user = await self.session.get(User, user_id)
        user.password_reset_token = token
        await self.session.commit()

    async def update_password(self, user_id: int, new_password: str):
        user = await self.session.get(User, user_id)
        user.hashed_password = User.hash_password(new_password)
        user.password_reset_token = None
        await self.session.commit()

    # ─── SESSÕES ───────────────────────────────────────────────────────────────

    async def create_session(self, user_id: int, refresh_token: str, expires_at: datetime):
        from models import UserSession
        session = UserSession(
            user_id=user_id,
            refresh_token=refresh_token,
            expires_at=expires_at,
        )
        self.session.add(session)
        await self.session.commit()

    async def get_session_by_refresh_token(self, refresh_token: str):
        from models import UserSession
        result = await self.session.execute(
            select(UserSession).where(UserSession.refresh_token == refresh_token)
        )
        return result.scalar_one_or_none()

    async def delete_session(self, refresh_token: str):
        from models import UserSession
        await self.session.execute(
            delete(UserSession).where(UserSession.refresh_token == refresh_token)
        )
        await self.session.commit()

    # ─── CONTAS MT5 ───────────────────────────────────────────────────────────

    async def create_account(self, user_id: int, account_data) -> MT5Account:
        account = MT5Account(
            user_id=user_id,
            nickname=account_data.nickname,
            mt5_login=account_data.login,
            mt5_password_encrypted=encrypt_password(account_data.password),
            mt5_server=account_data.server,
            lot_multiplier=account_data.lot_multiplier,
        )
        self.session.add(account)
        await self.session.commit()
        await self.session.refresh(account)
        return account

    async def get_user_accounts(self, user_id: str) -> list[MT5Account]:
        result = await self.session.execute(
            select(MT5Account).where(MT5Account.user_id == int(user_id))
        )
        return result.scalars().all()

    async def get_all_active_accounts(self) -> list[MT5Account]:
        result = await self.session.execute(
            select(MT5Account).where(MT5Account.copy_enabled == True)
        )
        return result.scalars().all()

    async def delete_account(self, account_id: int, user_id: str):
        await self.session.execute(
            delete(MT5Account).where(
                MT5Account.id == account_id,
                MT5Account.user_id == int(user_id)
            )
        )
        await self.session.commit()

    async def toggle_account_copy(self, account_id: int, user_id: str) -> MT5Account:
        account = await self.session.get(MT5Account, account_id)
        account.copy_enabled = not account.copy_enabled
        await self.session.commit()
        await self.session.refresh(account)
        return account

    # ─── TRADES ───────────────────────────────────────────────────────────────

    async def get_trades(self, user_id: str, limit: int = 50, offset: int = 0) -> list[Trade]:
        result = await self.session.execute(
            select(Trade)
            .join(MT5Account)
            .where(MT5Account.user_id == int(user_id))
            .order_by(Trade.opened_at.desc())
            .limit(limit)
            .offset(offset)
        )
        return result.scalars().all()

    async def get_master_trades(self, limit: int = 100) -> list[Trade]:
        result = await self.session.execute(
            select(Trade)
            .where(Trade.master_ticket != None)
            .order_by(Trade.opened_at.desc())
            .limit(limit)
        )
        return result.scalars().all()

    # ─── LOGS ─────────────────────────────────────────────────────────────────

    async def get_copy_logs(self, user_id: str, limit: int = 100) -> list[CopyLog]:
        result = await self.session.execute(
            select(CopyLog)
            .join(MT5Account)
            .where(MT5Account.user_id == int(user_id))
            .order_by(CopyLog.created_at.desc())
            .limit(limit)
        )
        return result.scalars().all()
