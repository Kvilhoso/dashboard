'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Check } from 'lucide-react'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { setToken, setUser } = useAuthStore()

  function update(field: string, value: string) {
    setForm(p => ({ ...p, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!form.name || !form.email || !form.password) { setError('Preencha todos os campos'); return }
    if (form.password !== form.confirm) { setError('As senhas não coincidem'); return }
    if (form.password.length < 8) { setError('A senha deve ter pelo menos 8 caracteres'); return }

    setLoading(true)
    await new Promise(r => setTimeout(r, 800))

    // MODO DEMO — no backend real: POST /auth/register
    setToken('demo-token-' + Date.now())
    setUser({ id: '1', name: form.name, email: form.email, plan: null })
    router.push('/onboarding')
  }

  const requirements = [
    { label: 'Mínimo 8 caracteres', ok: form.password.length >= 8 },
    { label: 'Letra maiúscula', ok: /[A-Z]/.test(form.password) },
    { label: 'Número', ok: /[0-9]/.test(form.password) },
  ]

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: `url(/gradient.png)`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', opacity: 0.4 }} />
      <div className="absolute inset-0 pointer-events-none blur-animate" />
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 55% 70% at 50% 50%, transparent 20%, rgba(0,0,0,0.75) 100%)' }} />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md border border-white/10 rounded-3xl relative z-10 backdrop-blur-sm overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.06)' }}
      >
        {/* Título */}
        <div className="text-center px-8 pt-10 pb-8 border-b border-white/5">
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-4">Bem-vindo</p>
          <h1 style={{ fontFamily: "'Montreal Bold', sans-serif" }} className="text-4xl md:text-5xl text-white">
            projeKt Rage
          </h1>
        </div>

        {/* Formulário */}
        <div className="px-8 py-8">
          <h2 className="text-xl font-light text-white mb-1">Criar conta</h2>
          <p className="text-sm text-gray-500 mb-8">Comece gratuitamente, escolha seu plano depois</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Nome completo</label>
              <input value={form.name} onChange={e => update('name', e.target.value)} placeholder="Seu nome" required className="input-field" />
            </div>
            <div>
              <label className="label">E-mail</label>
              <input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="seu@email.com" required className="input-field" />
            </div>
            <div>
              <label className="label">Senha</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => update('password', e.target.value)} placeholder="Mínimo 8 caracteres" required className="input-field pr-12" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Requisitos */}
              {form.password.length > 0 && (
                <div className="mt-2 space-y-1">
                  {requirements.map(r => (
                    <div key={r.label} className="flex items-center gap-2">
                      <Check className={`w-3 h-3 ${r.ok ? 'text-white' : 'text-gray-700'}`} />
                      <span className={`text-[10px] font-mono ${r.ok ? 'text-gray-400' : 'text-gray-700'}`}>{r.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="label">Confirmar senha</label>
              <input type="password" value={form.confirm} onChange={e => update('confirm', e.target.value)} placeholder="Repita a senha" required className="input-field" />
            </div>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-gray-400 font-mono">
                ↳ {error}
              </motion.p>
            )}

            <button type="submit" disabled={loading} className="w-full bg-white text-black py-3.5 rounded-full text-sm font-medium hover:bg-gray-100 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed transition-all duration-200 mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-gray-500 border-t-black rounded-full animate-spin" />
                  Criando conta...
                </span>
              ) : 'Criar conta'}
            </button>
          </form>

          {/* Divisor */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-gray-600 font-mono">ou</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <Link href="/login">
            <button className="w-full bg-white/5 border border-white/10 text-white py-3.5 rounded-full text-sm font-light hover:bg-white/10 hover:border-white/20 transition-all duration-200">
              Já tenho conta
            </button>
          </Link>
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 text-center border-t border-white/5 pt-6">
          <p className="text-xs text-gray-700 leading-relaxed">
            Ao criar uma conta você concorda com os{' '}
            <span className="text-gray-500 hover:text-white cursor-pointer transition">Termos de Uso</span>
            {' '}e{' '}
            <span className="text-gray-500 hover:text-white cursor-pointer transition">Política de Privacidade</span>
          </p>
          <p className="text-xs text-gray-700 mt-3">© {new Date().getFullYear()} projeKt Rage</p>
        </div>
      </motion.div>
    </div>
  )
}
