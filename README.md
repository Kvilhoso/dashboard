# projeKt Rage — Dashboard

Dashboard de gestão e copy trading MT5 para clientes do projeKt Rage.

## Stack

- **Next.js 16** (App Router + Turbopack)
- **TypeScript**
- **Tailwind CSS** — tema dark com fonte Montreal + Bebas Neue
- **Framer Motion** — animações de página e componentes
- **Recharts** — gráficos de performance
- **Zustand** — estado global com persist
- **FastAPI** — backend Python (em desenvolvimento)
- **PostgreSQL** — banco de dados (em desenvolvimento)

## Estrutura de páginas

```
/                           — Redireciona para /login
/login                      — Autenticação com email/senha e OAuth Google
/register                   — Criação de conta gratuita
/verify-email               — Verificação de conta por código (a fazer)
/forgot-password            — Recuperação de senha (a fazer)
/onboarding                 — Perfil inicial do usuário (3 etapas)
/terms                      — Termos de Uso (a fazer)
/privacy                    — Política de Privacidade (a fazer)

/dashboard                  — Overview: KPIs + gráfico P&L (plano ativo)
                              Planos + stats bloqueadas (conta gratuita)
/dashboard/live             — Feed ao vivo: operação aberta + histórico + Monte Carlo
/dashboard/trades           — Histórico de operações com filtros
/dashboard/accounts         — CRUD de contas MT5
/dashboard/logs             — Logs de replicação com latência
```

## Setup local

```bash
cd frontend
npm install
npm run dev
```

> O servidor roda em `http://localhost:3000`

---

## ✅ Concluído

### Frontend
- [x] Tema visual completo — fundo preto, fontes Montreal + Bebas Neue, cards translúcidos
- [x] Animação de blur no background (CSS keyframes)
- [x] Página de login — card escuro, logo no botão, campos centralizados
- [x] Página de registro — validação de senha com requisitos visuais
- [x] Onboarding — 3 etapas (capital, experiência, objetivo)
- [x] Dashboard versão FREE — planos com CTA + stats bloqueadas
- [x] Dashboard versão ATIVA — KPIs + gráfico P&L mensal + trades recentes
- [x] Sidebar com controle de acesso por plano (cadeado para conta gratuita)
- [x] Página Ao Vivo — operação aberta em tempo real + risco de ruína Monte Carlo
- [x] Página de Contas MT5 — CRUD com dados mock
- [x] Página de Operações — tabela com filtros e ordenação
- [x] Página de Logs — histórico de replicação
- [x] Proxy/middleware — rotas públicas e proteção de rotas privadas
- [x] AuthStore (Zustand) — token, user, onboarding, plano
- [x] Rota raiz `/` redireciona para `/login`

---

## 🔴 A fazer — Frontend

### Páginas faltando
- [ ] `/verify-email` — tela de verificação de conta por código enviado ao email
- [ ] `/forgot-password` — recuperação de senha
- [ ] `/terms` — Termos de Uso (linkado no register mas página não existe)
- [ ] `/privacy` — Política de Privacidade (mesmo caso)

### Login e Registro
- [ ] OAuth Google no login e no registro
- [ ] Botão "Esqueci minha senha" na página de login
- [ ] Fluxo de verificação de email pós-registro (código de 6 dígitos)
- [ ] Links reais para /terms e /privacy no rodapé do register

### Dashboard
- [ ] Menu mobile — sidebar some em telas pequenas (responsividade)
- [ ] Número de WhatsApp real no dashboard-free.tsx (placeholder atual: `5500000000000`)
- [ ] Página `/dashboard/settings` — configurações do usuário

### Dados reais
- [ ] WebSocket conectado ao backend (live page)
- [ ] API de contas MT5 conectada (accounts page)
- [ ] API de operações conectada (trades page)
- [ ] API de logs conectada (logs page)

---

## 🔴 A fazer — Backend

### Infraestrutura
- [ ] Instalar PostgreSQL local
- [ ] Configurar SQLAlchemy + modelos de banco
- [ ] Migrations com Alembic

### Autenticação
- [ ] `POST /auth/register` — criação de conta
- [ ] `POST /auth/login` — login com email/senha + JWT (10 min) + refresh token (7 dias)
- [ ] `GET /auth/google` — OAuth Google
- [ ] `GET /auth/google/callback` — callback OAuth
- [ ] `POST /auth/refresh` — renovar JWT
- [ ] `POST /auth/logout` — invalidar sessão
- [ ] `GET /auth/me` — dados do usuário logado
- [ ] `POST /auth/verify-email` — verificar código enviado ao email
- [ ] `POST /auth/forgot-password` — enviar email de recuperação
- [ ] `POST /auth/reset-password` — redefinir senha

### Usuários e Planos
- [ ] `GET /users/me` — perfil do usuário
- [ ] `PATCH /users/me` — atualizar perfil
- [ ] `GET /admin/users` — listar usuários (admin)
- [ ] `PATCH /admin/users/:id/plan` — ativar/desativar plano manualmente

### MT5 e Copy Trading
- [ ] `GET /accounts` — listar contas MT5 do usuário
- [ ] `POST /accounts` — adicionar conta MT5
- [ ] `DELETE /accounts/:id` — remover conta
- [ ] `PATCH /accounts/:id` — editar (lot multiplier, enable/disable)
- [ ] `GET /trades` — histórico de operações
- [ ] `GET /trades/live` — operação aberta na conta mestra
- [ ] `GET /logs` — logs de replicação
- [ ] WebSocket `/ws/live` — feed em tempo real

---

## 🟡 Deploy (futuro)

- [ ] Configurar Railway (backend + PostgreSQL)
- [ ] Configurar Vercel ou Railway (frontend)
- [ ] Variáveis de ambiente de produção
- [ ] Domínio `projektrage.com.br`
- [ ] HTTPS + certificado SSL

---

## Design System

Tema dark com estética trading premium:

| Elemento | Valor |
|---|---|
| Fundo | `#000000` puro |
| Cards | `rgba(255,255,255,0.06)` |
| Bordas | `rgba(255,255,255,0.10)` |
| Texto principal | `#ffffff` |
| Texto secundário | `#6b7280` |
| Fonte display | Bebas Neue |
| Fonte corpo | Montreal (Thin/Light/Regular/Medium/Bold) |
| Fonte mono | DM Mono / system-ui |

---

© 2026 projeKt Rage