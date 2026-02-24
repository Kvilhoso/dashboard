'use client';

import { motion } from 'framer-motion';
import {
  Lock,
  MessageCircle,
  TrendingUp,
  Shield,
  Zap,
  Star,
} from 'lucide-react';

const PLANS = [
  {
    name: 'Rage ENTRY',
    price: '$499.90',
    description: 'Para quem está começando',
    badge: 'entry',
    features: [
      'Saldo máximo: $3.000',
      'Algoritmo básico',
      'Monitoramento em tempo real',
      'Relatórios semanais',
      'Suporte por email',
    ],
    highlight: false,
    cta: 'Contratar',
  },
  {
    name: 'Rage PRO',
    price: '$2.499.90',
    description: 'Para traders experientes',
    badge: 'pro',
    features: [
      'Saldo máximo: $15.000',
      'Algoritmo completo',
      'Análise avançada',
      'Relatórios diários',
      'Suporte 24/7',
      'Gestão de risco avançada',
    ],
    highlight: true,
    cta: 'Contratar',
  },
  {
    name: 'Rage Dynamic',
    price: 'Sob consulta',
    description: 'Máxima flexibilidade',
    badge: 'dynamic',
    features: [
      'Saldo máximo: $200.000',
      'Parâmetros dinâmicos',
      'Machine learning',
      'API customizada',
      'Suporte especializado',
    ],
    highlight: false,
    cta: 'Solicitar cotação',
  },
  {
    name: 'Rage Unlimited',
    price: 'Pagamento único',
    description: 'Solução enterprise',
    badge: 'unlimited',
    features: [
      'Saldo ilimitado',
      'Conta vitalícia',
      'Estratégias customizadas',
      'Gerente dedicado',
      'Suporte VIP',
    ],
    highlight: false,
    cta: 'Solicitar cotação',
  },
];

const WHATSAPP = 'https://wa.me/5500000000000';

const LOCKED_STATS = [
  { label: 'Retorno acumulado', value: '+321.9%' },
  { label: 'Win Rate', value: '96.4%' },
  { label: 'Operações', value: '883' },
  { label: 'Drawdown máx.', value: '2.1%' },
];

export default function DashboardFreePage() {
  return (
    <div className='space-y-8'>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className='rounded-3xl border border-white/10 p-8'
        style={{ background: 'rgba(255,255,255,0.03)' }}
      >
        <div className='flex flex-col md:flex-row md:items-center justify-between gap-6'>
          <div>
            <p className='text-xs uppercase tracking-wider text-gray-600 mb-2'>
              Conta criada com sucesso
            </p>
            <h1
              style={{ fontFamily: "'Montreal Bold', sans-serif" }}
              className='text-3xl text-white mb-2'
            >
              Bem-vindo ao projeKt Rage
            </h1>
            <p className='text-gray-500 text-sm max-w-md'>
              Sua conta está ativa. Escolha um plano para começar a operar com o
              algoritmo e acompanhar seus resultados em tempo real.
            </p>
          </div>
          <a href={WHATSAPP} target='_blank' rel='noopener noreferrer'>
            <button className='flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full text-sm font-medium hover:bg-gray-100 transition whitespace-nowrap'>
              <MessageCircle className='w-4 h-4' />
              Falar com um especialista
            </button>
          </a>
        </div>
      </motion.div>

      <div>
        <p className='text-xs uppercase tracking-wider text-gray-600 mb-4'>
          Performance do algoritmo
        </p>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          {LOCKED_STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className='rounded-2xl border border-white/10 p-5 relative overflow-hidden'
              style={{ background: 'rgba(255,255,255,0.03)' }}
            >
              {/* Blur de bloqueio */}
              <div className='absolute inset-0 backdrop-blur-sm flex items-center justify-center bg-black/20 rounded-2xl z-10'>
                <Lock className='w-4 h-4 text-gray-600' />
              </div>
              <p className='text-xs text-gray-600 mb-1'>{stat.label}</p>
              <p className='text-2xl font-light text-white'>{stat.value}</p>
            </motion.div>
          ))}
        </div>
        <p className='text-xs text-gray-700 font-mono mt-3 text-center'>
          ↳ assine um plano para desbloquear todas as métricas
        </p>
      </div>

      <div>
        <p className='text-xs uppercase tracking-wider text-gray-600 mb-6'>
          Escolha seu plano
        </p>
        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4'>
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              className={`rounded-3xl border p-6 flex flex-col relative ${
                plan.highlight
                  ? 'border-white/30 bg-white/8'
                  : 'border-white/10 bg-white/3'
              }`}
              style={{
                background: plan.highlight
                  ? 'rgba(255,255,255,0.08)'
                  : 'rgba(255,255,255,0.03)',
              }}
            >
              {plan.highlight && (
                <div className='absolute -top-3 left-1/2 -translate-x-1/2'>
                  <span className='bg-white text-black text-[10px] font-medium px-3 py-1 rounded-full flex items-center gap-1'>
                    <Star className='w-2.5 h-2.5' /> Mais popular
                  </span>
                </div>
              )}

              <div className='mb-6'>
                <p className='text-xs uppercase tracking-wider text-gray-600 mb-2'>
                  {plan.badge}
                </p>
                <h3
                  style={{ fontFamily: "'Montreal Bold', sans-serif" }}
                  className='text-lg text-white mb-1'
                >
                  {plan.name}
                </h3>
                <p className='text-xs text-gray-500 mb-4'>{plan.description}</p>
                <p className='text-2xl font-light text-white'>{plan.price}</p>
              </div>

              <ul className='space-y-2 mb-8 flex-1'>
                {plan.features.map(f => (
                  <li
                    key={f}
                    className='flex items-start gap-2 text-xs text-gray-400'
                  >
                    <span className='text-white/40 mt-0.5'>—</span>
                    {f}
                  </li>
                ))}
              </ul>

              <a href={WHATSAPP} target='_blank' rel='noopener noreferrer'>
                <button
                  className={`w-full py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                    plan.highlight
                      ? 'bg-white text-black hover:bg-gray-100'
                      : 'bg-white/10 text-white border border-white/10 hover:bg-white/20'
                  }`}
                >
                  {plan.cta}
                </button>
              </a>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className='grid grid-cols-1 md:grid-cols-3 gap-4'
      >
        {[
          {
            icon: TrendingUp,
            title: '+321.9% retorno',
            desc: 'Resultado comprovado em backtest com 883 operações no XAUUSD H1',
          },
          {
            icon: Shield,
            title: '96.4% win rate',
            desc: 'Alta taxa de acerto com gestão de risco rigorosa e drawdown controlado',
          },
          {
            icon: Zap,
            title: 'Tempo real',
            desc: 'Acompanhe cada operação ao vivo com latência de milissegundos',
          },
        ].map((item, i) => (
          <div
            key={item.title}
            className='rounded-2xl border border-white/10 p-6'
            style={{ background: 'rgba(255,255,255,0.03)' }}
          >
            <item.icon className='w-5 h-5 text-white/40 mb-4' />
            <h4 className='text-sm font-medium text-white mb-2'>
              {item.title}
            </h4>
            <p className='text-xs text-gray-500 leading-relaxed'>{item.desc}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
