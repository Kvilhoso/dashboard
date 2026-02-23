'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Power, X, Check } from 'lucide-react'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'

interface Account {
  id: number; nickname: string; mt5_login: number
  mt5_server: string; copy_enabled: boolean; lot_multiplier: number
}

const MOCK: Account[] = [
  { id: 1, nickname: 'Conta Principal',       mt5_login: 12345678, mt5_server: 'ClearBroker-Live',    copy_enabled: true,  lot_multiplier: 1.0 },
  { id: 2, nickname: 'Carteira Conservadora', mt5_login: 87654321, mt5_server: 'XPInvestimentos-PRD', copy_enabled: true,  lot_multiplier: 0.5 },
  { id: 3, nickname: 'Agressiva Mini',        mt5_login: 11223344, mt5_server: 'BTGPactual-Real',     copy_enabled: false, lot_multiplier: 2.0 },
]

const EMPTY = { nickname: '', mt5_login: '', mt5_password: '', mt5_server: '', lot_multiplier: '1.0' }

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  useEffect(() => {
    api.get('/accounts').then(r => setAccounts(r.data)).catch(() => setAccounts(MOCK))
  }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const { data } = await api.post('/accounts', {
        ...form, mt5_login: parseInt(form.mt5_login), lot_multiplier: parseFloat(form.lot_multiplier)
      })
      setAccounts(p => [data, ...p])
      setModal(false); setForm(EMPTY)
      toast.success('Conta adicionada')
    } catch {
      toast.error('Erro ao adicionar conta')
    } finally { setSubmitting(false) }
  }

  async function handleToggle(id: number) {
    try {
      const { data } = await api.patch(`/accounts/${id}/toggle`)
      setAccounts(p => p.map(a => a.id === id ? data : a))
    } catch { toast.error('Erro ao alterar status') }
  }

  async function handleDelete(id: number) {
    try {
      await api.delete(`/accounts/${id}`)
      setAccounts(p => p.filter(a => a.id !== id))
      setDeleteId(null)
      toast.success('Conta removida')
    } catch { toast.error('Erro ao remover') }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-end justify-between mb-10">
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-3">Gestão</p>
          <h1 className="text-4xl font-light text-white">Contas MT5</h1>
          <p className="text-gray-500 text-sm mt-2">
            {accounts.filter(a => a.copy_enabled).length} de {accounts.length} contas ativas
          </p>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Adicionar
        </button>
      </motion.div>

      {/* Lista */}
      <div className="space-y-3">
        <AnimatePresence>
          {accounts.map((acc, i) => (
            <motion.div
              key={acc.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className={clsx(
                'card p-6 flex items-center gap-5 hover:border-white/20 transition-all duration-300',
                !acc.copy_enabled && 'opacity-50'
              )}
            >
              {/* Status */}
              <div className={clsx('w-2 h-2 rounded-full shrink-0', acc.copy_enabled ? 'bg-white' : 'bg-gray-700')} />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-light">{acc.nickname || `Conta ${acc.mt5_login}`}</p>
                <p className="text-gray-600 text-xs font-mono mt-0.5">
                  #{acc.mt5_login} · {acc.mt5_server}
                </p>
              </div>

              {/* Multiplicador */}
              <div className="text-center shrink-0">
                <p className="text-xs text-gray-600 font-mono uppercase tracking-wider">Lote ×</p>
                <p className="num text-lg font-light text-white">{acc.lot_multiplier}</p>
              </div>

              {/* Status badge */}
              {acc.copy_enabled && (
                <span className="text-[9px] font-mono border border-white/20 text-gray-400 px-2 py-1 rounded-full uppercase shrink-0">
                  copiando
                </span>
              )}

              {/* Ações */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleToggle(acc.id)}
                  className={clsx(
                    'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200',
                    acc.copy_enabled ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white/5 text-gray-600 hover:bg-white/10'
                  )}
                >
                  <Power className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeleteId(acc.id)}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 text-gray-600 hover:bg-white/10 hover:text-white transition-all duration-200"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {accounts.length === 0 && (
          <div className="card p-16 text-center">
            <p className="text-gray-600 text-sm">Nenhuma conta cadastrada.</p>
          </div>
        )}
      </div>

      {/* ─── Modal Adicionar ─── */}
      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={e => e.target === e.currentTarget && setModal(false)}
          >
            <motion.div
              initial={{ scale: 0.96, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 16 }}
              transition={{ duration: 0.25 }}
              className="bg-zinc-950 border border-white/10 rounded-3xl w-full max-w-md"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h2 className="font-light text-white text-xl">Adicionar Conta</h2>
                <button onClick={() => setModal(false)} className="text-gray-600 hover:text-white transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAdd} className="p-6 space-y-4">
                <div>
                  <label className="label">Nome amigável</label>
                  <input value={form.nickname} onChange={e => setForm(p => ({ ...p, nickname: e.target.value }))} className="input-field" placeholder="Ex: Conta Principal" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Login MT5</label>
                    <input required value={form.mt5_login} onChange={e => setForm(p => ({ ...p, mt5_login: e.target.value }))} className="input-field" placeholder="12345678" type="number" />
                  </div>
                  <div>
                    <label className="label">Lote ×</label>
                    <input required value={form.lot_multiplier} onChange={e => setForm(p => ({ ...p, lot_multiplier: e.target.value }))} className="input-field" placeholder="1.0" type="number" step="0.1" min="0.01" />
                  </div>
                </div>
                <div>
                  <label className="label">Senha MT5</label>
                  <input required value={form.mt5_password} onChange={e => setForm(p => ({ ...p, mt5_password: e.target.value }))} className="input-field" type="password" placeholder="Senha de operação" />
                  <p className="text-[10px] text-gray-700 font-mono mt-1.5">Criptografada com AES-256 antes de armazenar.</p>
                </div>
                <div>
                  <label className="label">Servidor</label>
                  <input required value={form.mt5_server} onChange={e => setForm(p => ({ ...p, mt5_server: e.target.value }))} className="input-field" placeholder="BrokerName-Live" />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-white text-black py-3.5 rounded-full text-sm font-medium hover:bg-gray-100 disabled:bg-gray-800 disabled:text-gray-600 transition-all duration-200 mt-2 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <><span className="w-4 h-4 border-2 border-gray-500 border-t-black rounded-full animate-spin" /> Conectando...</>
                  ) : (
                    <><Check className="w-4 h-4" /> Adicionar e Conectar</>
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Confirm Delete ─── */}
      <AnimatePresence>
        {deleteId !== null && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.96 }} animate={{ scale: 1 }} exit={{ scale: 0.96 }}
              className="bg-zinc-950 border border-white/10 rounded-3xl p-8 w-full max-w-sm text-center"
            >
              <h3 className="font-light text-white text-xl mb-3">Remover conta?</h3>
              <p className="text-gray-500 text-sm mb-8">O copy trading será interrompido imediatamente.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-3 bg-white/5 border border-white/10 rounded-full text-sm text-gray-400 hover:text-white transition">
                  Cancelar
                </button>
                <button onClick={() => handleDelete(deleteId!)} className="flex-1 py-3 bg-white text-black rounded-full text-sm font-medium hover:bg-gray-100 transition">
                  Remover
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
