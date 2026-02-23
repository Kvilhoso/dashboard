'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Wallet, Activity, Trophy, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine
} from 'recharts'
import { clsx } from 'clsx'

// ─── Dados reais — EA Rage_Dev_Alvo_v5 | XAUUSD H1 | Exness ─────────────────

const MONTHLY_DATA = [
  { month: 'Jan/25', pnl: 3687.46, balance: 13302.12 },
  { month: 'Fev/25', pnl: 1316.36, balance: 14524.14 },
  { month: 'Mar/25', pnl: 2677.47, balance: 17073.41 },
  { month: 'Abr/25', pnl: 1410.06, balance: 18384.99 },
  { month: 'Mai/25', pnl: 1193.23, balance: 19499.06 },
  { month: 'Jun/25', pnl: 1442.78, balance: 20843.63 },
  { month: 'Jul/25', pnl: 1315.55, balance: 22061.99 },
  { month: 'Ago/25', pnl: 1558.20, balance: 23509.18 },
  { month: 'Set/25', pnl: 2385.26, balance: 25735.28 },
  { month: 'Out/25', pnl: 1910.79, balance: 27516.40 },
  { month: 'Nov/25', pnl: 2322.62, balance: 29674.71 },
  { month: 'Dez/25', pnl: 3564.30, balance: 33009.79 },
  { month: 'Jan/26', pnl: -82.21,  balance: 32682.62 },
  { month: 'Fev/26', pnl: 1128.14, balance: 33752.95 },
]

const RECENT_TRADES = [
  { ticket: 1345, direction: 'SELL', volume: 1.01, price: 4907.447, profit: 130.09, date: '18/02/26' },
  { ticket: 1344, direction: 'SELL', volume: 0.66, price: 4907.447, profit: 85.01,  date: '18/02/26' },
  { ticket: 1342, direction: 'SELL', volume: 1.01, price: 5076.304, profit: 65.04,  date: '12/02/26' },
  { ticket: 1341, direction: 'SELL', volume: 0.66, price: 5075.910, profit: 16.50,  date: '12/02/26' },
  { ticket: 1339, direction: 'SELL', volume: 1.01, price: 5093.778, profit: 46.76,  date: '11/02/26' },
  { ticket: 1338, direction: 'SELL', volume: 0.66, price: 5093.698, profit: 25.28,  date: '11/02/26' },
  { ticket: 1336, direction: 'SELL', volume: 1.00, price: 5060.055, profit: 68.30,  date: '09/02/26' },
  { ticket: 1335, direction: 'SELL', volume: 0.66, price: 5059.843, profit: 31.09,  date: '09/02/26' },
]

const STATS = {
  balance: 33752.95, initial: 8000,
  profit: 25830.01, returnPct: 321.9,
  trades: 883, wins: 851, losses: 32, winRate: 96.4,
  maxWin: 1164.96, maxLoss: -4926.72, avg: 29.25,
  pnlMonth: 1128.14, pnlPrev: -82.21,
}

function fmt(v: number) {
  const abs = Math.abs(v)
  const s = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(abs)
  return `${v < 0 ? '-' : ''}$${s}`
}

function BalTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-zinc-900 border border-white/10 rounded-2xl px-4 py-3 text-xs font-mono shadow-xl">
      <p className="text-gray-500 mb-1">{label}</p>
      <p className="text-white">{fmt(payload[0]?.value)}</p>
    </div>
  )
}

function PnlTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const val = payload[0]?.value
  return (
    <div className="bg-zinc-900 border border-white/10 rounded-2xl px-4 py-3 text-xs font-mono shadow-xl">
      <p className="text-gray-500 mb-1">{label}</p>
      <p className={val >= 0 ? 'text-white' : 'text-gray-400'}>{fmt(val)}</p>
    </div>
  )
}

export default function OverviewPage() {
  const [chartView, setChartView] = useState<'balance' | 'pnl'>('balance')

  return (
    <div className="p-8 max-w-6xl mx-auto">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-10"
      >
        <p className="text-xs uppercase tracking-wider text-gray-500 mb-3">
          Rage_Dev_Alvo_v5 · XAUUSD H1 · Exness · Jan/2025 – Fev/2026
        </p>
        <div className="flex items-end justify-between">
          <h1 className="text-4xl md:text-5xl font-light text-white">Overview</h1>
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-1 font-mono">retorno total</p>
            <p className="num text-3xl font-light text-white">+{STATS.returnPct}%</p>
          </div>
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Balance Final',  value: fmt(STATS.balance),  sub: `de ${fmt(STATS.initial)}`,  positive: true,  delay: 0 },
          { label: 'Lucro Total',    value: fmt(STATS.profit),   sub: `+${STATS.returnPct}%`,      positive: true,  delay: 0.06 },
          { label: 'Win Rate',       value: `${STATS.winRate}%`, sub: `${STATS.wins}W · ${STATS.losses}L · ${STATS.trades} trades`, positive: true, delay: 0.12 },
          { label: 'P&L Fev/26',    value: fmt(STATS.pnlMonth), sub: `Jan/26: ${fmt(STATS.pnlPrev)}`, positive: STATS.pnlMonth >= 0, delay: 0.18 },
        ].map(({ label, value, sub, positive, delay }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            className="card p-5 hover:border-white/20 transition-all duration-300"
          >
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-mono">{label}</p>
            <p className="num text-xl font-light text-white mb-1">{value}</p>
            <div className="flex items-center gap-1">
              {positive
                ? <ArrowUpRight className="w-3 h-3 text-gray-400" />
                : <ArrowDownRight className="w-3 h-3 text-gray-600" />
              }
              <span className="text-xs text-gray-500 font-mono">{sub}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Linha extra de stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Maior Ganho', value: fmt(STATS.maxWin) },
          { label: 'Média / Trade', value: fmt(STATS.avg) },
          { label: 'Maior Perda',  value: fmt(STATS.maxLoss) },
        ].map(({ label, value }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="card px-5 py-4 flex items-center justify-between hover:border-white/20 transition-all duration-300"
          >
            <span className="text-xs text-gray-500 font-mono uppercase tracking-wider">{label}</span>
            <span className="num text-sm text-white">{value}</span>
          </motion.div>
        ))}
      </div>

      {/* Gráfico + Trades */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Gráfico */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="card p-6 lg:col-span-2 hover:border-white/20 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-light text-white">
              {chartView === 'balance' ? 'Evolução do Balance' : 'P&L Mensal'}
            </h2>
            <div className="flex items-center bg-white/5 border border-white/10 rounded-full overflow-hidden">
              {(['balance', 'pnl'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setChartView(v)}
                  className={clsx(
                    'px-4 py-1.5 text-xs font-mono transition-all duration-200',
                    chartView === v ? 'bg-white text-black' : 'text-gray-500 hover:text-white'
                  )}
                >
                  {v === 'balance' ? 'Balance' : 'P&L'}
                </button>
              ))}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            {chartView === 'balance' ? (
              <AreaChart data={MONTHLY_DATA} margin={{ top: 0, right: 0, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#ffffff" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#555', fontSize: 10, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#555', fontSize: 10, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<BalTooltip />} />
                <Area type="monotone" dataKey="balance" stroke="rgba(255,255,255,0.6)" strokeWidth={1.5} fill="url(#balGrad)" dot={false} activeDot={{ r: 3, fill: '#fff' }} />
              </AreaChart>
            ) : (
              <BarChart data={MONTHLY_DATA} margin={{ top: 0, right: 0, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#555', fontSize: 10, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#555', fontSize: 10, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} />
                <Tooltip content={<PnlTooltip />} />
                <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
                <Bar dataKey="pnl" radius={[3, 3, 0, 0]}
                  fill="rgba(255,255,255,0.3)"
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </motion.div>

        {/* Últimas operações */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.36, duration: 0.5 }}
          className="card p-6 hover:border-white/20 transition-all duration-300"
        >
          <h2 className="font-light text-white mb-5">Últimas Operações</h2>
          <div className="space-y-1">
            {RECENT_TRADES.map(t => (
              <div key={t.ticket} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className={clsx(
                      'text-[9px] font-mono border px-1.5 py-0.5 rounded-full',
                      t.direction === 'BUY'
                        ? 'border-white/20 text-white'
                        : 'border-white/10 text-gray-500'
                    )}>
                      {t.direction}
                    </span>
                    <span className="text-xs text-gray-400">XAUUSD</span>
                  </div>
                  <p className="text-[10px] text-gray-600 font-mono">
                    #{t.ticket} · {t.volume} lot · {t.date}
                  </p>
                </div>
                <p className={clsx('num text-sm', t.profit >= 0 ? 'text-white' : 'text-gray-500')}>
                  +{fmt(t.profit)}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Rodapé do backtest */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 text-xs text-gray-700 font-mono"
      >
        ↳ backtest · Rage_Dev_Alvo_v5 · XAUUSD H1 · Exness-MT5Real12 · capital inicial $8.000 · Jan/2025–Fev/2026
      </motion.p>
    </div>
  )
}