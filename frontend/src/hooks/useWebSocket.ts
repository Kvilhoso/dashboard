'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';

const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL || 'wss://www.projektrage.com.br/ws';
const RECONNECT_DELAY_MS = 3000;
const MAX_RECONNECT_ATTEMPTS = 10;

export function useWebSocket() {
  const { token } = useAuthStore();
  const ws = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);
  const pingTimer = useRef<NodeJS.Timeout | null>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);

  const connect = useCallback(() => {
    if (!token) return;
    if (ws.current?.readyState === WebSocket.OPEN) return;

    const socket = new WebSocket(`${WS_URL}/${token}`);

    socket.onopen = () => {
      setIsConnected(true);
      reconnectAttempts.current = 0;

      pingTimer.current = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: 'ping' }));
        }
      }, 30_000);
    };

    socket.onmessage = event => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type !== 'pong') {
          setLastMessage(msg);
        }
      } catch {}
    };

    socket.onclose = () => {
      setIsConnected(false);
      if (pingTimer.current) {
        clearInterval(pingTimer.current);
      }

      if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
        const delay =
          RECONNECT_DELAY_MS * Math.min(reconnectAttempts.current + 1, 5);
        reconnectTimer.current = setTimeout(() => {
          reconnectAttempts.current++;
          connect();
        }, delay);
      }
    };

    socket.onerror = () => {
      socket.close();
    };

    ws.current = socket;
  }, [token]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
      }
      if (pingTimer.current) {
        clearInterval(pingTimer.current);
      }
      ws.current?.close();
    };
  }, [connect]);

  const send = useCallback((data: object) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(data));
    }
  }, []);

  return { isConnected, lastMessage, send };
}
