'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { setToken, setUser } = useAuthStore()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Preencha e-mail e senha'); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 700))
    setToken('demo-token-' + Date.now())
    setUser({ id: '1', name: email.split('@')[0] || 'Usuário', email, plan: null })
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 relative overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: `url(/gradient.png)`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', opacity: 0.4 }} />
      <div className="absolute inset-0 pointer-events-none blur-animate" />
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 55% 65% at 50% 50%, transparent 20%, rgba(0,0,0,0.7) 100%)' }} />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md border border-white/10 rounded-3xl relative z-10 backdrop-blur-sm overflow-hidden"
        style={{ background: 'rgba(0,0,0,0.6)' }}
      >
        {/* Título */}
        <div className="text-center px-8 pt-10 pb-8 border-b border-white/5">
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-4">Área restrita</p>
          <h1 style={{ fontFamily: "'Montreal Bold', sans-serif" }} className="text-4xl md:text-5xl text-white">
            projeKt Rage
          </h1>
        </div>

        {/* Formulário */}
        <div className="px-8 py-8">
          <h2 className="text-xl font-light text-white mb-1">Acessar Dashboard</h2>
          <p className="text-sm text-gray-500 mb-8">Entre com suas credenciais para continuar</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">E-mail</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required className="input-field" />
            </div>
            <div>
              <label className="label">Senha</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required className="input-field pr-12" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-gray-400 font-mono">
                ↳ {error}
              </motion.p>
            )}

           <button type="submit" disabled={loading} style={{ fontFamily: "'Bebas Neue', sans-serif" }} className="w-full bg-white text-black py-3.5 rounded-full text-xl hover:bg-gray-100 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed transition-all duration-200 mt-2 relative flex items-center justify-center">
  {loading ? (
    <span className="flex items-center justify-center gap-2">
      <span className="w-4 h-4 border-2 border-gray-500 border-t-black rounded-full animate-spin" />
      Entrando...
    </span>
  ) : (
    <>
    <img src="/logo-circle.png" alt="" className="w-12 h-12 rounded-full absolute left-2" />
      Entrar
    </>
  )}
</button>
          </form>

          {/* Divisor */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-gray-600 font-mono">ou</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Botão criar conta */}
          <Link href="/register">
            <button className="w-full bg-white/5 border border-white/10 text-white py-3.5 rounded-full text-sm font-light hover:bg-white/10 hover:border-white/20 transition-all duration-200">
              Criar conta
            </button>
          </Link>
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 text-center border-t border-white/5 pt-6">
          <p className="text-xs text-gray-700 font-mono mb-1">modo demo — qualquer credencial funciona</p>
          <p className="text-xs text-gray-700">© {new Date().getFullYear()} projeKt Rage</p>
        </div>
      </motion.div>
    </div>
  )
}
