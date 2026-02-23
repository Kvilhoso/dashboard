'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'

const STEPS = [
  {
    id: 'capital',
    question: 'Qual é o seu capital disponível para trading?',
    options: [
      { label: 'Até $3.000', value: 'entry', hint: 'Ideal para o plano Entry' },
      { label: '$3.000 – $15.000', value: 'pro', hint: 'Ideal para o plano Pro' },
      { label: '$15.000 – $200.000', value: 'dynamic', hint: 'Ideal para o plano Dynamic' },
      { label: 'Acima de $200.000', value: 'unlimited', hint: 'Ideal para o plano Unlimited' },
    ],
  },
  {
    id: 'experience',
    question: 'Qual é a sua experiência com trading automatizado?',
    options: [
      { label: 'Nenhuma', value: 'none', hint: 'Vou te guiar em cada passo' },
      { label: 'Iniciante', value: 'beginner', hint: 'Já ouvi falar, mas nunca usei' },
      { label: 'Intermediário', value: 'intermediate', hint: 'Já usei EAs antes' },
      { label: 'Avançado', value: 'advanced', hint: 'Conheço bem o mercado' },
    ],
  },
  {
    id: 'goal',
    question: 'Qual é o seu principal objetivo?',
    options: [
      { label: 'Renda passiva', value: 'passive', hint: 'Quero retornos consistentes' },
      { label: 'Crescer patrimônio', value: 'growth', hint: 'Foco no longo prazo' },
      { label: 'Alta performance', value: 'performance', hint: 'Quero maximizar ganhos' },
      { label: 'Testar a estratégia', value: 'test', hint: 'Quero conhecer antes de investir mais' },
    ],
  },
]

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [selected, setSelected] = useState<string | null>(null)
  const router = useRouter()
  const { setOnboarding } = useAuthStore()

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1
  const progress = ((step) / STEPS.length) * 100

  function handleSelect(value: string) {
    setSelected(value)
  }

  function handleNext() {
    if (!selected) return
    const newAnswers = { ...answers, [current.id]: selected }
    setAnswers(newAnswers)
    setSelected(null)

    if (isLast) {
      setOnboarding(newAnswers)
      router.push('/dashboard')
    } else {
      setStep(s => s + 1)
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 relative overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: `url(/gradient.png)`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.3 }} />
      <div className="absolute inset-0 pointer-events-none blur-animate" />
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 70% at 50% 50%, transparent 20%, rgba(0,0,0,0.8) 100%)' }} />

      <div className="w-full max-w-lg relative z-10">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <p className="text-xs uppercase tracking-wider text-gray-600 mb-2">
            {step + 1} de {STEPS.length}
          </p>
          <p style={{ fontFamily: "'Montreal Bold', sans-serif" }} className="text-xl text-white/30">
            projeKt Rage
          </p>
        </motion.div>

        {/* Progress bar */}
        <div className="w-full h-px bg-white/10 mb-10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-white/60 rounded-full"
            animate={{ width: `${progress + (100 / STEPS.length)}%` }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
        </div>

        {/* Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.35 }}
          >
            <h2 style={{ fontFamily: "'Montreal Medium', sans-serif" }} className="text-2xl text-white mb-8 leading-snug">
              {current.question}
            </h2>

            <div className="space-y-3">
              {current.options.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  className={`w-full text-left px-6 py-4 rounded-2xl border transition-all duration-200 group ${
                    selected === opt.value
                      ? 'bg-white text-black border-white'
                      : 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{opt.label}</span>
                    <span className={`text-xs font-mono ${selected === opt.value ? 'text-black/50' : 'text-gray-600'}`}>
                      {opt.hint}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={handleNext}
              disabled={!selected}
              className="w-full mt-8 bg-white text-black py-3.5 rounded-full text-sm font-medium hover:bg-gray-100 disabled:bg-white/10 disabled:text-gray-600 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLast ? 'Ir para o dashboard' : 'Continuar'}
            </button>
          </motion.div>
        </AnimatePresence>

        {/* Skip */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6"
        >
          <button onClick={() => router.push('/dashboard')} className="text-xs text-gray-700 hover:text-gray-500 font-mono transition">
            pular por agora
          </button>
        </motion.p>
      </div>
    </div>
  )
}
