"""
projeKt Rage — Backend Principal
FastAPI + PostgreSQL + OAuth Google + WebSocket
"""

import asyncio
import json
import logging
import secrets
from contextlib import asynccontextmanager
from datetime import datetime, timedelta

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from auth import (
    verify_token, create_access_token, create_refresh_token,
    get_google_auth_url, exchange_google_code,
    get_current_user_id, REFRESH_TOKEN_EXPIRE_DAYS
)
from database import get_db, init_db
from schemas import (
    RegisterRequest, LoginRequest, TokenResponse, RefreshRequest,
    VerifyEmailRequest, ForgotPasswordRequest, ResetPasswordRequest,
    UserResponse, AccountCreate, AccountResponse
)
from copy_engine import CopyEngine
from config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

copy_engine = CopyEngine()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Iniciando projeKt Rage backend...")
    await init_db()
    asyncio.create_task(copy_engine.start())
    yield
    logger.info("🛑 Encerrando sistema...")
    await copy_engine.stop()


app = FastAPI(
    title="projeKt Rage API",
    description="Backend do sistema de copy trading MT5",
    version="2.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────────────────────────────────────────
# AUTH — REGISTRO E LOGIN
# ─────────────────────────────────────────────────────────────────────────────

@app.post("/api/auth/register", response_model=TokenResponse)
async def register(body: RegisterRequest, db=Depends(get_db)):
    """Cria uma nova conta com email e senha"""
    existing = await db.get_user_by_email(body.email)
    if existing:
        raise HTTPException(status_code=400, detail="E-mail já cadastrado")

    if len(body.password) < 8:
        raise HTTPException(status_code=400, detail="Senha deve ter pelo menos 8 caracteres")

    user = await db.create_user(
        name=body.name,
        email=body.email,
        password=body.password,
    )

    # Gera e salva código de verificação de email (6 dígitos)
    code = str(secrets.randbelow(900000) + 100000)
    await db.set_email_code(user.id, code)

    # TODO: enviar email com código
    logger.info(f"📧 Código de verificação para {user.email}: {code}")

    access_token = create_access_token({"sub": str(user.id), "email": user.email})
    refresh_token = create_refresh_token()
    await db.create_session(
        user_id=user.id,
        refresh_token=refresh_token,
        expires_at=datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.model_validate(user)
    )


@app.post("/api/auth/login", response_model=TokenResponse)
async def login(body: LoginRequest, db=Depends(get_db)):
    """Login com email e senha"""
    user = await db.get_user_by_email(body.email)
    if not user or not user.verify_password(body.password):
        raise HTTPException(status_code=401, detail="Credenciais inválidas")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Conta desativada")

    access_token = create_access_token({"sub": str(user.id), "email": user.email})
    refresh_token = create_refresh_token()
    await db.create_session(
        user_id=user.id,
        refresh_token=refresh_token,
        expires_at=datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.model_validate(user)
    )


@app.post("/api/auth/refresh")
async def refresh_token(body: RefreshRequest, db=Depends(get_db)):
    """Renova o JWT usando o refresh token"""
    session = await db.get_session_by_refresh_token(body.refresh_token)
    if not session:
        raise HTTPException(status_code=401, detail="Refresh token inválido")

    if session.expires_at < datetime.utcnow():
        await db.delete_session(body.refresh_token)
        raise HTTPException(status_code=401, detail="Refresh token expirado")

    user = await db.get_user(str(session.user_id))
    access_token = create_access_token({"sub": str(user.id), "email": user.email})

    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/api/auth/logout")
async def logout(body: RefreshRequest, db=Depends(get_db)):
    """Invalida a sessão"""
    await db.delete_session(body.refresh_token)
    return {"message": "Logout realizado com sucesso"}


@app.get("/api/auth/me", response_model=UserResponse)
async def me(user_id: str = Depends(get_current_user_id), db=Depends(get_db)):
    """Retorna dados do usuário logado"""
    user = await db.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return UserResponse.model_validate(user)


# ─────────────────────────────────────────────────────────────────────────────
# AUTH — VERIFICAÇÃO DE EMAIL
# ─────────────────────────────────────────────────────────────────────────────

@app.post("/api/auth/verify-email")
async def verify_email(
    body: VerifyEmailRequest,
    user_id: str = Depends(get_current_user_id),
    db=Depends(get_db)
):
    """Verifica o código de 6 dígitos enviado ao email"""
    user = await db.get_user(user_id)

    if user.email_verified:
        return {"message": "E-mail já verificado"}

    if user.email_verification_code != body.code:
        raise HTTPException(status_code=400, detail="Código inválido")

    await db.verify_user_email(user.id)
    return {"message": "E-mail verificado com sucesso"}


@app.post("/api/auth/resend-code")
async def resend_verification_code(
    user_id: str = Depends(get_current_user_id),
    db=Depends(get_db)
):
    """Reenvia o código de verificação"""
    user = await db.get_user(user_id)
    if user.email_verified:
        return {"message": "E-mail já verificado"}

    code = str(secrets.randbelow(900000) + 100000)
    await db.set_email_code(user.id, code)

    # TODO: enviar email
    logger.info(f"📧 Novo código para {user.email}: {code}")

    return {"message": "Código reenviado"}


# ─────────────────────────────────────────────────────────────────────────────
# AUTH — RECUPERAÇÃO DE SENHA
# ─────────────────────────────────────────────────────────────────────────────

@app.post("/api/auth/forgot-password")
async def forgot_password(body: ForgotPasswordRequest, db=Depends(get_db)):
    """Envia email de recuperação de senha"""
    user = await db.get_user_by_email(body.email)

    # Sempre retorna sucesso para não revelar se email existe
    if not user:
        return {"message": "Se este e-mail existir, você receberá as instruções"}

    token = secrets.token_urlsafe(32)
    await db.set_reset_token(user.id, token)

    # TODO: enviar email com link de reset
    reset_link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    logger.info(f"🔑 Link de reset para {user.email}: {reset_link}")

    return {"message": "Se este e-mail existir, você receberá as instruções"}


@app.post("/api/auth/reset-password")
async def reset_password(body: ResetPasswordRequest, db=Depends(get_db)):
    """Redefine a senha usando o token de recuperação"""
    from models import User as UserModel
    from sqlalchemy import select
    from database import AsyncSessionLocal

    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(UserModel).where(UserModel.password_reset_token == body.token)
        )
        user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=400, detail="Token inválido ou expirado")

    if len(body.new_password) < 8:
        raise HTTPException(status_code=400, detail="Senha deve ter pelo menos 8 caracteres")

    await db.update_password(user.id, body.new_password)
    return {"message": "Senha redefinida com sucesso"}


# ─────────────────────────────────────────────────────────────────────────────
# AUTH — OAUTH GOOGLE
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/api/auth/google")
async def google_login():
    """Inicia o fluxo OAuth com Google"""
    state = secrets.token_urlsafe(16)
    url = get_google_auth_url(state)
    return {"url": url}


@app.get("/api/auth/google/callback")
async def google_callback(code: str, db=Depends(get_db)):
    """Recebe o callback do Google e loga/registra o usuário"""
    try:
        userinfo = await exchange_google_code(code)
    except Exception as e:
        logger.error(f"Erro no OAuth Google: {e}")
        raise HTTPException(status_code=400, detail="Erro na autenticação com Google")

    google_id = userinfo.get("id")
    email = userinfo.get("email")
    name = userinfo.get("name", "")
    avatar = userinfo.get("picture")

    # Busca por google_id primeiro, depois por email
    user = await db.get_user_by_google_id(google_id)
    if not user:
        user = await db.get_user_by_email(email)
        if user:
            # Vincula google_id à conta existente
            user.google_id = google_id
            user.avatar = avatar
        else:
            # Cria conta nova via Google
            user = await db.create_user(
                name=name,
                email=email,
                google_id=google_id,
                avatar=avatar,
            )
            # Marca email como verificado (Google já verificou)
            await db.verify_user_email(user.id)

    access_token = create_access_token({"sub": str(user.id), "email": user.email})
    refresh_token = create_refresh_token()
    await db.create_session(
        user_id=user.id,
        refresh_token=refresh_token,
        expires_at=datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    )

    # Redireciona para o frontend com os tokens
    redirect_url = (
        f"{settings.FRONTEND_URL}/auth/callback"
        f"?access_token={access_token}"
        f"&refresh_token={refresh_token}"
    )
    return RedirectResponse(url=redirect_url)


# ─────────────────────────────────────────────────────────────────────────────
# CONTAS MT5
# ─────────────────────────────────────────────────────────────────────────────

@app.post("/api/accounts", response_model=AccountResponse)
async def add_account(
    body: AccountCreate,
    user_id: str = Depends(get_current_user_id),
    db=Depends(get_db)
):
    account = await db.create_account(int(user_id), body)
    await copy_engine.register_account(account)
    return AccountResponse.model_validate(account)


@app.get("/api/accounts")
async def list_accounts(user_id: str = Depends(get_current_user_id), db=Depends(get_db)):
    accounts = await db.get_user_accounts(user_id)
    return [AccountResponse.model_validate(a) for a in accounts]


@app.delete("/api/accounts/{account_id}")
async def remove_account(
    account_id: int,
    user_id: str = Depends(get_current_user_id),
    db=Depends(get_db)
):
    await copy_engine.unregister_account(account_id)
    await db.delete_account(account_id, user_id)
    return {"message": "Conta removida com sucesso"}


@app.patch("/api/accounts/{account_id}/toggle")
async def toggle_copy(
    account_id: int,
    user_id: str = Depends(get_current_user_id),
    db=Depends(get_db)
):
    account = await db.toggle_account_copy(account_id, user_id)
    if account.copy_enabled:
        await copy_engine.register_account(account)
    else:
        await copy_engine.unregister_account(account_id)
    return AccountResponse.model_validate(account)


# ─────────────────────────────────────────────────────────────────────────────
# TRADES E LOGS
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/api/trades")
async def get_trades(
    limit: int = 50,
    offset: int = 0,
    user_id: str = Depends(get_current_user_id),
    db=Depends(get_db)
):
    return await db.get_trades(user_id, limit, offset)


@app.get("/api/trades/master")
async def get_master_trades(
    user_id: str = Depends(get_current_user_id),
    db=Depends(get_db)
):
    return await db.get_master_trades(limit=100)


@app.get("/api/copy-logs")
async def get_copy_logs(
    limit: int = 100,
    user_id: str = Depends(get_current_user_id),
    db=Depends(get_db)
):
    return await db.get_copy_logs(user_id, limit)


# ─────────────────────────────────────────────────────────────────────────────
# ADMIN — GERENCIAR PLANOS
# ─────────────────────────────────────────────────────────────────────────────

@app.patch("/api/admin/users/{target_user_id}/plan")
async def set_user_plan(
    target_user_id: int,
    plan: str | None,
    user_id: str = Depends(get_current_user_id),
    db=Depends(get_db)
):
    """Ativa ou desativa plano de um usuário (apenas admin)"""
    admin = await db.get_user(user_id)
    if not admin or not admin.is_admin:
        raise HTTPException(status_code=403, detail="Acesso negado")

    valid_plans = {"entry", "pro", "dynamic", "unlimited", None}
    if plan not in valid_plans:
        raise HTTPException(status_code=400, detail="Plano inválido")

    user = await db.update_user_plan(target_user_id, plan)
    return UserResponse.model_validate(user)


# ─────────────────────────────────────────────────────────────────────────────
# WEBSOCKET
# ─────────────────────────────────────────────────────────────────────────────

class ConnectionManager:
    def __init__(self):
        self.active: dict[str, list[WebSocket]] = {}

    async def connect(self, ws: WebSocket, user_id: str):
        await ws.accept()
        self.active.setdefault(user_id, []).append(ws)

    def disconnect(self, ws: WebSocket, user_id: str):
        if user_id in self.active:
            self.active[user_id].remove(ws)

    async def send_to_user(self, user_id: str, message: dict):
        for ws in self.active.get(user_id, []):
            try:
                await ws.send_json(message)
            except Exception:
                pass

    async def broadcast(self, message: dict):
        for connections in self.active.values():
            for ws in connections:
                try:
                    await ws.send_json(message)
                except Exception:
                    pass


manager = ConnectionManager()
copy_engine.set_notification_manager(manager)


@app.websocket("/ws/{token}")
async def websocket_endpoint(websocket: WebSocket, token: str):
    try:
        payload = verify_token(token)
        user_id = payload["sub"]
    except Exception:
        await websocket.close(code=1008)
        return

    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)
            if msg.get("type") == "ping":
                await websocket.send_json({"type": "pong", "ts": datetime.utcnow().isoformat()})
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)


# ─────────────────────────────────────────────────────────────────────────────
# HEALTH CHECK
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "engine_running": copy_engine.running,
        "active_accounts": copy_engine.active_account_count,
        "timestamp": datetime.utcnow().isoformat()
    }
