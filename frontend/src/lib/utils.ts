import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDate(dateString: string, fmt = 'dd/MM/yy HH:mm'): string {
  try {
    return format(new Date(dateString), fmt, { locale: ptBR });
  } catch {
    return '--';
  }
}

export function formatLatency(ms: number): string {
  if (ms < 100) return `${ms}ms ✓`;
  if (ms < 300) return `${ms}ms ⚡`;
  return `${ms}ms ⚠`;
}

export function pnlColor(value: number): string {
  if (value > 0) return 'text-bull';
  if (value < 0) return 'text-bear';
  return 'text-ink-muted';
}
