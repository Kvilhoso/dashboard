# MT5 Dashboard — Frontend Next.js

Dashboard de gestão multiconta MT5 servido em `projektrage.com.br/dashboard`.

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** com design system dark/terminal
- **Framer Motion** para animações
- **Recharts** para gráficos
- **Zustand** para estado global
- **Axios** com interceptor JWT + auto-refresh

## Estrutura de páginas

```
/login                      — Autenticação
/dashboard                  — Overview (KPIs + gráfico P&L + trades recentes)
/dashboard/accounts         — CRUD de contas MT5
/dashboard/trades           — Histórico de operações com filtros e ordenação
/dashboard/live             — Feed ao vivo via WebSocket
/dashboard/logs             — Logs de replicação com latência
/dashboard/settings         — Configurações do usuário
```

## Setup local

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.local.example .env.local
# Editar .env.local com as URLs do backend

# 3. Rodar em desenvolvimento
npm run dev

# 4. Build para produção
npm run build
npm start
```

## Deploy em produção (VPS Linux)

```bash
# Build
npm run build

# Iniciar com PM2
npm install -g pm2
pm2 start npm --name "mt5-frontend" -- start
pm2 save
pm2 startup
```

O Nginx encaminha `/dashboard` para `localhost:3000` automaticamente.

## Design System

O design usa uma estética **dark industrial / trading terminal**:

| Token | Valor | Uso |
|---|---|---|
| `bg-base` | `#080C14` | Fundo principal |
| `bg-surface` | `#0D1220` | Sidebar, headers |
| `bg-card` | `#111827` | Cards |
| `accent` | `#00E5FF` | CTAs, status ativo |
| `bull` | `#00D68F` | Lucro, compra |
| `bear` | `#FF4D6D` | Prejuízo, venda |
| `warn` | `#FFB800` | Alertas |

Fontes: **Syne** (display/títulos) + **DM Mono** (números/código) + **DM Sans** (corpo)
