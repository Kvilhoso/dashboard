"""
Copy Engine — Coração do Sistema de Copy Trading
Monitora a conta mestra e replica operações para todas as contas ativas.
"""

import asyncio
import logging
from datetime import datetime
from typing import Optional

import MetaTrader5 as mt5

from config import settings
from crypto import decrypt_password

logger = logging.getLogger(__name__)


class MT5Connection:
    """Gerencia uma conexão com uma conta MT5"""

    def __init__(self, account):
        self.account = account
        self.login = account.mt5_login
        self.password = decrypt_password(account.mt5_password_encrypted)
        self.server = account.mt5_server
        self.initialized = False

    def connect(self) -> bool:
        try:
            if not mt5.initialize():
                logger.error(f"mt5.initialize() falhou para conta {self.login}")
                return False
            result = mt5.login(self.login, password=self.password, server=self.server)
            if result:
                self.initialized = True
                logger.info(f"✅ Conectado: conta {self.login} @ {self.server}")
            return result
        except Exception as e:
            logger.error(f"Erro ao conectar conta {self.login}: {e}")
            return False

    def disconnect(self):
        mt5.shutdown()
        self.initialized = False


class CopyEngine:
    """
    Engine principal de copy trading.
    
    Fluxo:
    1. Conecta na conta mestra
    2. A cada ciclo, verifica posições abertas e ordens pendentes
    3. Para cada evento novo (abertura, fechamento, modificação), replica nas contas escravas
    """

    def __init__(self):
        self.running = False
        self.active_accounts: dict[int, dict] = {}  # {account_id: {connection, account}}
        self.master_positions: dict[int, dict] = {}  # {ticket: position_data}
        self.master_orders: dict[int, dict] = {}     # {ticket: order_data}
        self.notification_manager = None
        self._task: Optional[asyncio.Task] = None
        self._lock = asyncio.Lock()

    def set_notification_manager(self, manager):
        self.notification_manager = manager

    @property
    def active_account_count(self) -> int:
        return len(self.active_accounts)

    async def start(self):
        self.running = True
        logger.info("🔄 Copy Engine iniciado")
        self._task = asyncio.create_task(self._main_loop())

    async def stop(self):
        self.running = False
        if self._task:
            self._task.cancel()
        logger.info("🛑 Copy Engine parado")

    async def register_account(self, account):
        """Registra uma conta para receber cópias"""
        async with self._lock:
            loop = asyncio.get_event_loop()
            conn = MT5Connection(account)
            connected = await loop.run_in_executor(None, conn.connect)
            if connected:
                self.active_accounts[account.id] = {
                    "connection": conn,
                    "account": account,
                    "position_map": {}  # master_ticket -> slave_ticket
                }
                logger.info(f"📋 Conta {account.mt5_login} registrada no engine")
            else:
                logger.warning(f"⚠️ Não foi possível registrar conta {account.mt5_login}")

    async def unregister_account(self, account_id: int):
        """Remove uma conta do engine"""
        async with self._lock:
            if account_id in self.active_accounts:
                self.active_accounts[account_id]["connection"].disconnect()
                del self.active_accounts[account_id]

    async def _main_loop(self):
        """Loop principal — executa a cada POLL_INTERVAL ms"""
        while self.running:
            try:
                await self._tick()
            except Exception as e:
                logger.error(f"Erro no tick do engine: {e}")
            await asyncio.sleep(settings.POLL_INTERVAL_MS / 1000)

    async def _tick(self):
        """Um ciclo de verificação e replicação"""
        loop = asyncio.get_event_loop()

        # 1. Lê estado atual da conta mestra
        current_positions, current_orders = await loop.run_in_executor(
            None, self._get_master_state
        )

        if current_positions is None:
            return  # MT5 não disponível neste ciclo

        # 2. Detecta eventos
        opened_positions = {
            ticket: pos for ticket, pos in current_positions.items()
            if ticket not in self.master_positions
        }
        closed_positions = {
            ticket: pos for ticket, pos in self.master_positions.items()
            if ticket not in current_positions
        }
        modified_positions = {
            ticket: pos for ticket, pos in current_positions.items()
            if ticket in self.master_positions and self._position_modified(
                pos, self.master_positions[ticket]
            )
        }

        # 3. Replica eventos para todas as contas ativas
        tasks = []
        for account_id, account_data in list(self.active_accounts.items()):
            tasks.append(self._replicate_to_account(
                account_id, account_data,
                opened_positions, closed_positions, modified_positions
            ))

        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)

        # 4. Atualiza estado salvo
        self.master_positions = current_positions

    def _get_master_state(self) -> tuple[dict, dict]:
        """Lê posições e ordens da conta mestra (executado em thread separada)"""
        if not mt5.initialize():
            return None, None

        if not mt5.login(settings.MASTER_LOGIN, password=settings.MASTER_PASSWORD,
                         server=settings.MASTER_SERVER):
            return None, None

        positions_raw = mt5.positions_get()
        orders_raw = mt5.orders_get()
        mt5.shutdown()

        positions = {}
        if positions_raw:
            for p in positions_raw:
                positions[p.ticket] = {
                    "ticket": p.ticket,
                    "symbol": p.symbol,
                    "type": p.type,  # 0=BUY, 1=SELL
                    "volume": p.volume,
                    "price_open": p.price_open,
                    "sl": p.sl,
                    "tp": p.tp,
                    "comment": p.comment,
                    "magic": p.magic,
                    "time": p.time,
                }

        orders = {}
        if orders_raw:
            for o in orders_raw:
                orders[o.ticket] = {
                    "ticket": o.ticket,
                    "symbol": o.symbol,
                    "type": o.type,
                    "volume_current": o.volume_current,
                    "price_open": o.price_open,
                    "sl": o.sl,
                    "tp": o.tp,
                }

        return positions, orders

    async def _replicate_to_account(
        self,
        account_id: int,
        account_data: dict,
        opened: dict,
        closed: dict,
        modified: dict
    ):
        """Replica todos os eventos para uma conta escravo"""
        conn = account_data["connection"]
        account = account_data["account"]
        position_map = account_data["position_map"]
        loop = asyncio.get_event_loop()

        # Calcula fator de lote
        lot_factor = account.lot_multiplier if account.lot_multiplier else 1.0

        # Abre novas posições
        for ticket, pos in opened.items():
            slave_ticket = await loop.run_in_executor(
                None, self._open_position_sync, conn, pos, lot_factor
            )
            if slave_ticket:
                position_map[ticket] = slave_ticket
                await self._notify(account_id, "trade_opened", {
                    "master_ticket": ticket,
                    "slave_ticket": slave_ticket,
                    "symbol": pos["symbol"],
                    "volume": pos["volume"] * lot_factor,
                    "type": "BUY" if pos["type"] == 0 else "SELL",
                    "ts": datetime.utcnow().isoformat()
                })

        # Fecha posições encerradas na mestra
        for ticket, pos in closed.items():
            slave_ticket = position_map.get(ticket)
            if slave_ticket:
                success = await loop.run_in_executor(
                    None, self._close_position_sync, conn, slave_ticket, pos
                )
                if success:
                    del position_map[ticket]
                    await self._notify(account_id, "trade_closed", {
                        "master_ticket": ticket,
                        "slave_ticket": slave_ticket,
                        "symbol": pos["symbol"],
                        "ts": datetime.utcnow().isoformat()
                    })

        # Atualiza SL/TP modificados
        for ticket, pos in modified.items():
            slave_ticket = position_map.get(ticket)
            if slave_ticket:
                await loop.run_in_executor(
                    None, self._modify_position_sync, conn, slave_ticket, pos
                )

    def _open_position_sync(self, conn: MT5Connection, pos: dict, lot_factor: float) -> Optional[int]:
        """Abre posição na conta escravo"""
        if not conn.initialized:
            conn.connect()

        symbol = pos["symbol"]
        order_type = mt5.ORDER_TYPE_BUY if pos["type"] == 0 else mt5.ORDER_TYPE_SELL
        volume = round(pos["volume"] * lot_factor, 2)

        symbol_info = mt5.symbol_info(symbol)
        if not symbol_info:
            logger.warning(f"Símbolo {symbol} não encontrado na conta {conn.login}")
            return None

        # Garante volume mínimo
        volume = max(volume, symbol_info.volume_min)

        tick = mt5.symbol_info_tick(symbol)
        price = tick.ask if pos["type"] == 0 else tick.bid

        request = {
            "action": mt5.TRADE_ACTION_DEAL,
            "symbol": symbol,
            "volume": volume,
            "type": order_type,
            "price": price,
            "sl": pos["sl"],
            "tp": pos["tp"],
            "deviation": settings.MAX_SLIPPAGE_POINTS,
            "magic": settings.MAGIC_NUMBER,
            "comment": f"COPY:{pos['ticket']}",
            "type_time": mt5.ORDER_TIME_GTC,
            "type_filling": mt5.ORDER_FILLING_IOC,
        }

        result = mt5.order_send(request)

        if result and result.retcode == mt5.TRADE_RETCODE_DONE:
            logger.info(f"✅ Posição copiada: {symbol} {volume} lote(s) | conta {conn.login}")
            return result.order
        else:
            retcode = result.retcode if result else "N/A"
            logger.error(f"❌ Falha ao copiar {symbol} para conta {conn.login}: retcode {retcode}")
            return None

    def _close_position_sync(self, conn: MT5Connection, slave_ticket: int, pos: dict) -> bool:
        """Fecha posição na conta escravo"""
        positions = mt5.positions_get(ticket=slave_ticket)
        if not positions:
            return False

        p = positions[0]
        close_type = mt5.ORDER_TYPE_SELL if p.type == 0 else mt5.ORDER_TYPE_BUY
        tick = mt5.symbol_info_tick(p.symbol)
        price = tick.bid if p.type == 0 else tick.ask

        request = {
            "action": mt5.TRADE_ACTION_DEAL,
            "symbol": p.symbol,
            "volume": p.volume,
            "type": close_type,
            "position": slave_ticket,
            "price": price,
            "deviation": settings.MAX_SLIPPAGE_POINTS,
            "magic": settings.MAGIC_NUMBER,
            "comment": f"CLOSE_COPY:{pos['ticket']}",
            "type_time": mt5.ORDER_TIME_GTC,
            "type_filling": mt5.ORDER_FILLING_IOC,
        }

        result = mt5.order_send(request)
        return result and result.retcode == mt5.TRADE_RETCODE_DONE

    def _modify_position_sync(self, conn: MT5Connection, slave_ticket: int, pos: dict) -> bool:
        """Atualiza SL/TP na conta escravo"""
        request = {
            "action": mt5.TRADE_ACTION_SLTP,
            "position": slave_ticket,
            "sl": pos["sl"],
            "tp": pos["tp"],
        }
        result = mt5.order_send(request)
        return result and result.retcode == mt5.TRADE_RETCODE_DONE

    def _position_modified(self, new: dict, old: dict) -> bool:
        """Verifica se SL ou TP foram alterados"""
        return new["sl"] != old["sl"] or new["tp"] != old["tp"]

    async def _notify(self, account_id: int, event_type: str, data: dict):
        """Envia notificação via WebSocket para o usuário dono da conta"""
        if not self.notification_manager:
            return
        account_data = self.active_accounts.get(account_id)
        if account_data:
            user_id = str(account_data["account"].user_id)
            await self.notification_manager.send_to_user(user_id, {
                "type": event_type,
                "account_id": account_id,
                **data
            })
