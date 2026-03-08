# projeKt Rage — Dashboard

Dashboard de gestão e copy trading MT5 para clientes do projeKt Rage.

## Stack

- **Next.js 16** — (App Router + Turbopack)
- **PNPM** — gerenciador de pacotes
- **TypeScript** — superset do JavaScript
- **Tailwind CSS** — tema dark com fonte Montreal + Bebas Neue
- **Framer Motion** — animações de página e componentes
- **Recharts** — gráficos de performance
- **Zustand** — estado global com persist
- **FastAPI** — backend Python (em desenvolvimento)
- **PostgreSQL** — banco de dados (em desenvolvimento)

## Estrutura de páginas

```
/                           — Redireciona para /auth/login
/auth/login                      — Autenticação com email/senha e OAuth Google
/auth/register                   — Criação de conta gratuita
/auth/verify-email               — Verificação de conta por código (a fazer)
/auth/forgot-password            — Recuperação de senha (a fazer)
/auth/onboarding                 — Perfil inicial do usuário (3 etapas)
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

### Frontend

```bash
cd frontend
npm install
npm run dev
```

> Roda em `http://localhost:3000`

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

> Roda em `http://localhost:8000`
> Documentação automática da API: `http://localhost:8000/docs`

### Banco de dados (PostgreSQL)

```bash
# Adicionar PostgreSQL ao PATH (PowerShell)
$env:PATH += ";C:\Program Files\PostgreSQL\18\bin"

# Conectar
psql -U postgres

# Criar banco (só na primeira vez)
CREATE DATABASE projektrage;
\q
```

> O banco é criado automaticamente ao subir o backend pela primeira vez.

### Variáveis de ambiente

Copie o `.env` de exemplo e preencha:

```bash
cd backend
# edite o arquivo .env com sua senha do PostgreSQL e credenciais Google OAuth
```

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
- [x] Rota raiz `/` redireciona para `/auth/login`
- [x] `.gitignore` configurado — node_modules e .next ignorados

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

## ✅ Concluído — Backend

### Infraestrutura

- [x] PostgreSQL 18 instalado e configurado
- [x] Banco `projektrage` criado
- [x] SQLAlchemy async + modelos completos
- [x] Servidor FastAPI rodando em `localhost:8000`
- [x] Copy Engine integrado e iniciando com o servidor
- [x] MetaTrader5 conectado ao copy engine

### Autenticação

- [x] `POST /api/auth/register` — criação de conta
- [x] `POST /api/auth/login` — login com email/senha + JWT (10 min) + refresh token (7 dias)
- [x] `GET /api/auth/google` — OAuth Google
- [x] `GET /api/auth/google/callback` — callback OAuth
- [x] `POST /api/auth/refresh` — renovar JWT
- [x] `POST /api/auth/logout` — invalidar sessão
- [x] `GET /api/auth/me` — dados do usuário logado
- [x] `POST /api/auth/verify-email` — verificar código enviado ao email
- [x] `POST /api/auth/resend-code` — reenviar código de verificação
- [x] `POST /api/auth/forgot-password` — enviar email de recuperação
- [x] `POST /api/auth/reset-password` — redefinir senha

### Usuários e Planos

- [x] `PATCH /api/admin/users/:id/plan` — ativar/desativar plano manualmente (admin)

### MT5 e Copy Trading

- [x] `GET /api/accounts` — listar contas MT5 do usuário
- [x] `POST /api/accounts` — adicionar conta MT5
- [x] `DELETE /api/accounts/:id` — remover conta
- [x] `PATCH /api/accounts/:id/toggle` — ativar/pausar copy
- [x] `GET /api/trades` — histórico de operações
- [x] `GET /api/trades/master` — operações da conta mestra
- [x] `GET /api/copy-logs` — logs de replicação
- [x] WebSocket `/ws/{token}` — feed em tempo real

---

## 🔴 A fazer — Backend

### Pendente

- [ ] Migrations com Alembic
- [ ] Integração SMTP — envio real de emails (verificação + reset de senha)
- [ ] Credenciais Google OAuth configuradas no `.env`
- [ ] `GET /api/users/me` — atualizar perfil
- [ ] `GET /api/trades/live` — operação aberta na conta mestra em tempo real

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

| Elemento         | Valor                                     |
| ---------------- | ----------------------------------------- |
| Fundo            | `#000000` puro                            |
| Cards            | `rgba(255,255,255,0.06)`                  |
| Bordas           | `rgba(255,255,255,0.10)`                  |
| Texto principal  | `#ffffff`                                 |
| Texto secundário | `#6b7280`                                 |
| Fonte display    | Bebas Neue                                |
| Fonte corpo      | Montreal (Thin/Light/Regular/Medium/Bold) |
| Fonte mono       | DM Mono / system-ui                       |

---

© 2026 projeKt Rage
