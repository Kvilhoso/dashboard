'use client'
// ─── TRADES PAGE ──────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, TrendingUp, TrendingDown, ChevronUp, ChevronDown } from 'lucide-react'
import { api } from '@/lib/api'
import { clsx } from 'clsx'

interface Trade {
  id: number; symbol: string; trade_type: 'BUY'|'SELL'; volume: number
  price_open: number; profit: number; status: string
  opened_at: string; account_nickname: string; latency_ms?: number
}

const MOCK: Trade[] = Array.from({ length: 16 }, (_, i) => ({
  id: i + 1, symbol: ['XAUUSD','XAUUSD','XAUUSD','XAUUSD','XAUUSD'][i % 5],
  trade_type: i % 3 === 0 ? 'BUY' : 'SELL',
  volume: parseFloat((Math.random() * 1.5 + 0.5).toFixed(2)),
  price_open: parseFloat((4800 + Math.random() * 300).toFixed(3)),
  profit: parseFloat((Math.random() * 200 - 30).toFixed(2)),
  status: i < 3 ? 'open' : 'closed',
  opened_at: new Date(Date.now() - i * 3600000).toISOString(),
  account_nickname: ['Principal','Conservadora','Agressiva'][i % 3],
  latency_ms: Math.floor(Math.random() * 150 + 20),
}))

function fmt(v: number) {
  const s = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(Math.abs(v))
  return `${v < 0 ? '-' : '+'}$${s}`
}

function fmtDate(d: string) {
  try { return new Date(d).toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' }) }
  catch { return '--' }
}

export default function TradesPage() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'all'|'open'|'closed'>('all')
  const [sortField, setSortField] = useState<'profit'|'opened_at'>('opened_at')
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('desc')

  useEffect(() => {
    api.get('/trades?limit=100').then(r => setTrades(r.data)).catch(() => setTrades(MOCK))
  }, [])

  const filtered = trades
    .filter(t => status === 'all' || t.status === status)
    .filter(t => !search || t.symbol.toLowerCase().includes(search.toLowerCase()) || t.account_nickname.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const va = sortField === 'profit' ? a.profit : new Date(a.opened_at).getTime()
      const vb = sortField === 'profit' ? b.profit : new Date(b.opened_at).getTime()
      return sortDir === 'desc' ? vb - va : va - vb
    })

  const totalPnl = filtered.reduce((s, t) => s + t.profit, 0)

  function toggleSort(f: typeof sortField) {
    if (sortField === f) setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    else { setSortField(f); setSortDir('desc') }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <p className="text-xs uppercase tracking-wider text-gray-500 mb-3">Histórico</p>
        <div className="flex items-end justify-between">
          <h1 className="text-4xl font-light text-white">Operações</h1>
          <p className="num text-lg font-light text-white">{fmt(totalPnl)}</p>
        </div>
      </motion.div>

      {/* Filtros */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar..." className="input-field pl-10 w-52" />
        </div>
        <div className="flex items-center bg-white/5 border border-white/10 rounded-full overflow-hidden">
          {(['all','open','closed'] as const).map(s => (
            <button key={s} onClick={() => setStatus(s)}
              className={clsx('px-4 py-2 text-xs font-mono transition-all duration-200',
                status === s ? 'bg-white text-black' : 'text-gray-500 hover:text-white'
              )}>
              {s === 'all' ? 'Todas' : s === 'open' ? 'Abertas' : 'Fechadas'}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="card overflow-hidden hover:border-white/20 transition-all duration-300">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {[
                  { l: 'Símbolo', f: null }, { l: 'Tipo', f: null }, { l: 'Volume', f: null },
                  { l: 'Abertura', f: 'opened_at' as const }, { l: 'P&L', f: 'profit' as const },
                  { l: 'Status', f: null }, { l: 'Conta', f: null }, { l: 'Latência', f: null },
                ].map(col => (
                  <th key={col.l} onClick={() => col.f && toggleSort(col.f)}
                    className={clsx('px-5 py-4 text-left text-[10px] font-mono text-gray-600 uppercase tracking-wider',
                      col.f && 'cursor-pointer hover:text-gray-400 select-none'
                    )}>
                    <span className="flex items-center gap-1">{col.l}
                      {col.f && sortField === col.f && (
                        sortDir === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => (
                <motion.tr key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }} className="tr-row">
                  <td className="px-5 py-4 font-mono text-sm text-white">{t.symbol}</td>
                  <td className="px-5 py-4">
                    <span className={clsx('flex items-center gap-1 text-xs font-mono',
                      t.trade_type === 'BUY' ? 'text-white' : 'text-gray-500'
                    )}>
                      {t.trade_type === 'BUY' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {t.trade_type}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-mono text-gray-400 text-sm">{t.volume}</td>
                  <td className="px-5 py-4 font-mono text-gray-600 text-xs">{fmtDate(t.opened_at)}</td>
                  <td className={clsx('px-5 py-4 num text-sm', t.profit >= 0 ? 'text-white' : 'text-gray-500')}>{fmt(t.profit)}</td>
                  <td className="px-5 py-4">
                    <span className={clsx('text-[9px] font-mono border px-2 py-0.5 rounded-full',
                      t.status === 'open' ? 'border-white/20 text-gray-400' : 'border-white/5 text-gray-700'
                    )}>{t.status === 'open' ? 'ABERTA' : 'FECHADA'}</span>
                  </td>
                  <td className="px-5 py-4 font-mono text-gray-600 text-xs">{t.account_nickname}</td>
                  <td className="px-5 py-4 font-mono text-xs text-gray-600">
                    {t.latency_ms ? `${t.latency_ms}ms` : '--'}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-16 text-center text-gray-600 font-mono text-sm">Nenhuma operação encontrada.</div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
