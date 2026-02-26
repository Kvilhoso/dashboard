import { formatCurrency } from '@/lib';

export const STEPS = [
  {
    id: 'capital',
    question: 'Qual é o seu capital disponível para trading?',
    options: [
      {
        label: `Até ${formatCurrency(3000)}`,
        value: 'entry',
        hint: 'Entry',
      },
      {
        label: `${formatCurrency(3000)} – ${formatCurrency(15000)}`,
        value: 'pro',
        hint: 'Pro',
      },
      {
        label: `${formatCurrency(15000)} – ${formatCurrency(200000)}`,
        value: 'dynamic',
        hint: 'Dynamic',
      },
      {
        label: `Acima de ${formatCurrency(200000)}`,
        value: 'unlimited',
        hint: 'Unlimited',
      },
    ],
  },
  {
    id: 'experience',
    question: 'Qual é a sua experiência com trading automatizado?',
    options: [
      { label: 'Nenhuma', value: 'none', hint: 'Vou te guiar em cada passo' },
      {
        label: 'Iniciante',
        value: 'beginner',
        hint: 'Já ouvi falar, mas nunca usei',
      },
      {
        label: 'Intermediário',
        value: 'intermediate',
        hint: 'Já usei EAs antes',
      },
      { label: 'Avançado', value: 'advanced', hint: 'Conheço bem o mercado' },
    ],
  },
  {
    id: 'goal',
    question: 'Qual é o seu principal objetivo?',
    options: [
      {
        label: 'Renda passiva',
        value: 'passive',
        hint: 'Quero retornos consistentes',
      },
      {
        label: 'Crescer patrimônio',
        value: 'growth',
        hint: 'Foco no longo prazo',
      },
      {
        label: 'Alta performance',
        value: 'performance',
        hint: 'Quero maximizar ganhos',
      },
      {
        label: 'Testar a estratégia',
        value: 'test',
        hint: 'Quero conhecer antes de investir',
      },
    ],
  },
] as const;
