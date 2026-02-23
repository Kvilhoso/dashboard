"""
MT5 Copy Trading System - Backend Principal
FastAPI + MetaTrader5 + WebSocket
"""

import asyncio
import json
import logging
from contextlib import asynccontextmanager
from datetime import datetime

import MetaTrader5 as mt5
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from auth import verify_token, create_access_token
from database import get_db, init_db
from models import User, MT5Account, Trade, CopyLog
from schemas import LoginRequest, AccountCreate, AccountResponse
from copy_engine import CopyEngine
from config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Instância global do Copy Engine
copy_engine = CopyEngine()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup e shutdown da aplicação"""
    logger.info("🚀 Iniciando MT5 Copy Trading System...")
    await init_db()
    asyncio.create_task(copy_engine.start())
    yield
    logger.info("🛑 Encerrando sistema...")
    await copy_engine.stop()

app = FastAPI(
    title="MT5 Copy Trading API",
    description="Sistema de gestão multiconta MT5",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()


# ─────────────────────────────────────────────
# AUTH
# ─────────────────────────────────────────────

@app.post("/api/auth/login")
async def login(request: LoginRequest, db=Depends(get_db)):
    user = await db.get_user_by_email(request.email)
    if not user or not user.verify_password(request.password):
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    
    token = create_access_token({"sub": str(user.id), "email": user.email})
    return {"access_token": token, "token_type": "bearer"}


@app.post("/api/auth/refresh")
async def refresh_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    payload = verify_token(credentials.credentials)
    new_token = create_access_token({"sub": payload["sub"], "email": payload["email"]})
    return {"access_token": new_token, "token_type": "bearer"}


# ─────────────────────────────────────────────
# CONTAS MT5
# ─────────────────────────────────────────────

@app.post("/api/accounts", response_model=AccountResponse)
async def add_account(
    account_data: AccountCreate,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db=Depends(get_db)
):
    """Adiciona e valida uma conta MT5 do cliente"""
    user = await db.get_user(verify_token(credentials.credentials)["sub"])
    
    # Testa conexão antes de salvar
    connected = await test_mt5_connection(
        account_data.login,
        account_data.password,
        account_data.server
    )
    if not connected:
        raise HTTPException(status_code=400, detail="Não foi possível conectar à conta MT5")
    
    account = await db.create_account(user.id, account_data)
    await copy_engine.register_account(account)
    return account


@app.get("/api/accounts")
async def list_accounts(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db=Depends(get_db)
):
    """Lista todas as contas do usuário"""
    user_id = verify_token(credentials.credentials)["sub"]
    accounts = await db.get_user_accounts(user_id)
    return accounts


@app.delete("/api/accounts/{account_id}")
async def remove_account(
    account_id: int,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db=Depends(get_db)
):
    user_id = verify_token(credentials.credentials)["sub"]
    await copy_engine.unregister_account(account_id)
    await db.delete_account(account_id, user_id)
    return {"message": "Conta removida com sucesso"}


@app.patch("/api/accounts/{account_id}/toggle")
async def toggle_copy(
    account_id: int,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db=Depends(get_db)
):
    """Ativa ou pausa o copy trading de uma conta"""
    user_id = verify_token(credentials.credentials)["sub"]
    account = await db.toggle_account_copy(account_id, user_id)
    if account.copy_enabled:
        await copy_engine.register_account(account)
    else:
        await copy_engine.unregister_account(account_id)
    return account


# ─────────────────────────────────────────────
# OPERAÇÕES / HISTÓRICO
# ─────────────────────────────────────────────

@app.get("/api/trades")
async def get_trades(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db=Depends(get_db),
    limit: int = 50,
    offset: int = 0
):
    user_id = verify_token(credentials.credentials)["sub"]
    return await db.get_trades(user_id, limit, offset)


@app.get("/api/trades/master")
async def get_master_trades(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db=Depends(get_db)
):
    """Histórico de operações da conta mestra"""
    return await db.get_master_trades(limit=100)


@app.get("/api/copy-logs")
async def get_copy_logs(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db=Depends(get_db),
    limit: int = 100
):
    user_id = verify_token(credentials.credentials)["sub"]
    return await db.get_copy_logs(user_id, limit)


# ─────────────────────────────────────────────
# WEBSOCKET — TEMPO REAL
# ─────────────────────────────────────────────

class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)

    def disconnect(self, websocket: WebSocket, user_id: str):
        if user_id in self.active_connections:
            self.active_connections[user_id].remove(websocket)

    async def send_to_user(self, user_id: str, message: dict):
        if user_id in self.active_connections:
            for ws in self.active_connections[user_id]:
                try:
                    await ws.send_json(message)
                except Exception:
                    pass

    async def broadcast(self, message: dict):
        for connections in self.active_connections.values():
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
            # Ping/pong keepalive
            if msg.get("type") == "ping":
                await websocket.send_json({"type": "pong", "ts": datetime.utcnow().isoformat()})
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)


# ─────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────

async def test_mt5_connection(login: int, password: str, server: str) -> bool:
    """Testa conexão com uma conta MT5"""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _sync_test_connection, login, password, server)


def _sync_test_connection(login: int, password: str, server: str) -> bool:
    if not mt5.initialize():
        return False
    result = mt5.login(login, password=password, server=server)
    mt5.shutdown()
    return result


@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "engine_running": copy_engine.running,
        "active_accounts": copy_engine.active_account_count,
        "timestamp": datetime.utcnow().isoformat()
    }
