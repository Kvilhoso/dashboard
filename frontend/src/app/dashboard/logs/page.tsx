'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle } from 'lucide-react'
import { api } from '@/lib/api'
import { clsx } from 'clsx'

interface Log {
  id: number; event_type: string; symbol: string; message: string
  success: boolean; latency_ms: number; created_at: string; account_nickname?: string
}

const MOCK: Log[] = Array.from({ length: 24 }, (_, i) => ({
  id: i + 1,
  event_type: ['trade_opened','trade_closed','trade_modified','error'][i % 4],
  symbol: 'XAUUSD',
  message: i % 7 === 0 ? 'retcode: 10004 — Requote' : 'Replicação bem-sucedida',
  success: i % 7 !== 0,
  latency_ms: Math.floor(Math.random() * 150 + 20),
  created_at: new Date(Date.now() - i * 120000).toISOString(),
  account_nickname: ['Principal','Conservadora','Agressiva'][i % 3],
}))

function fmtDate(d: string) {
  try { return new Date(d).toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' }) }
  catch { return '--' }
}

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([])
  const [filter, setFilter] = useState<'all'|'success'|'error'>('all')

  useEffect(() => {
    api.get('/copy-logs?limit=200').then(r => setLogs(r.data)).catch(() => setLogs(MOCK))
  }, [])

  const filtered = logs.filter(l =>
    filter === 'all' ? true : filter === 'error' ? !l.success : l.success
  )

  const errors = logs.filter(l => !l.success).length
  const avgLat = Math.floor(logs.reduce((s,l) => s + l.latency_ms, 0) / (logs.length || 1))

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <p className="text-xs uppercase tracking-wider text-gray-500 mb-3">Sistema</p>
        <div className="flex items-end justify-between">
          <h1 className="text-4xl font-light text-white">Logs de Replicação</h1>
          <p className="text-gray-600 text-sm font-mono">latência avg {avgLat}ms · {errors} erros</p>
        </div>
      </motion.div>

      {/* Filtros */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center bg-white/5 border border-white/10 rounded-full overflow-hidden">
          {(['all','success','error'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={clsx('px-4 py-2 text-xs font-mono transition-all duration-200',
                filter === f ? 'bg-white text-black' : 'text-gray-500 hover:text-white'
              )}>
              {f === 'all' ? 'Todos' : f === 'success' ? 'Sucesso' : 'Erros'}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="card overflow-hidden hover:border-white/20 transition-all duration-300">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              {['Status','Evento','Símbolo','Conta','Mensagem','Latência','Horário'].map(h => (
                <th key={h} className="px-5 py-4 text-left text-[10px] font-mono text-gray-600 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((log, i) => (
              <motion.tr key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: i * 0.015 }} className="tr-row">
                <td className="px-5 py-4">
                  {log.success
                    ? <CheckCircle className="w-4 h-4 text-gray-400" />
                    : <XCircle className="w-4 h-4 text-gray-600" />
                  }
                </td>
                <td className="px-5 py-4">
                  <span className="text-[9px] font-mono border border-white/10 text-gray-500 px-2 py-0.5 rounded-full uppercase">
                    {log.event_type.replace('trade_','')}
                  </span>
                </td>
                <td className="px-5 py-4 font-mono text-sm text-white">{log.symbol}</td>
                <td className="px-5 py-4 font-mono text-xs text-gray-600">{log.account_nickname}</td>
                <td className="px-5 py-4 font-mono text-xs text-gray-500 max-w-[200px] truncate">{log.message}</td>
                <td className="px-5 py-4 font-mono text-xs text-gray-600">{log.latency_ms}ms</td>
                <td className="px-5 py-4 font-mono text-xs text-gray-600">{fmtDate(log.created_at)}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  )
}
