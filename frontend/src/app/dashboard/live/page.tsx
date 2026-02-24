'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Activity,
  AlertTriangle,
} from 'lucide-react';

const MOCK_OPEN_TRADE = {
  symbol: 'XAUUSD',
  direction: 'BUY' as 'BUY' | 'SELL',
  openPrice: 2318.45,
  currentPrice: 2324.8,
  volume: 0.1,
  openTime: '14:32:15',
  profit: +63.5,
  swap: -0.12,
  duration: '01:24:38',
};

const MOCK_HISTORY = [
  {
    ticket: 1042881,
    symbol: 'XAUUSD',
    dir: 'BUY',
    open: 2301.2,
    close: 2318.45,
    profit: +172.5,
    date: '21/02/2026',
  },
  {
    ticket: 1042756,
    symbol: 'XAUUSD',
    dir: 'SELL',
    open: 2334.1,
    close: 2318.9,
    profit: +152.0,
    date: '20/02/2026',
  },
  {
    ticket: 1042634,
    symbol: 'XAUUSD',
    dir: 'BUY',
    open: 2289.3,
    close: 2301.2,
    profit: +119.0,
    date: '19/02/2026',
  },
  {
    ticket: 1042501,
    symbol: 'XAUUSD',
    dir: 'BUY',
    open: 2276.8,
    close: 2289.3,
    profit: +125.0,
    date: '18/02/2026',
  },
  {
    ticket: 1042388,
    symbol: 'XAUUSD',
    dir: 'SELL',
    open: 2298.4,
    close: 2290.1,
    profit: +83.0,
    date: '17/02/2026',
  },
  {
    ticket: 1042270,
    symbol: 'XAUUSD',
    dir: 'BUY',
    open: 2261.5,
    close: 2276.8,
    profit: +153.0,
    date: '14/02/2026',
  },
  {
    ticket: 1042150,
    symbol: 'XAUUSD',
    dir: 'SELL',
    open: 2284.2,
    close: 2275.6,
    profit: +86.0,
    date: '13/02/2026',
  },
  {
    ticket: 1042031,
    symbol: 'XAUUSD',
    dir: 'BUY',
    open: 2249.8,
    close: 2261.5,
    profit: +117.0,
    date: '12/02/2026',
  },
  {
    ticket: 1041912,
    symbol: 'XAUUSD',
    dir: 'BUY',
    open: 2238.1,
    close: 2249.8,
    profit: +117.0,
    date: '11/02/2026',
  },
  {
    ticket: 1041800,
    symbol: 'XAUUSD',
    dir: 'SELL',
    open: 2260.3,
    close: 2250.9,
    profit: +94.0,
    date: '10/02/2026',
  },
];

const ACCOUNT_STATS = {
  deposit: 7922.05,
  profit: 25830.01,
  balance: 33752.06,
  maxDrawdown: 2.1,
  winRate: 96.4,
  totalTrades: 883,
};

function calcRiskOfRuin(
  winRate: number,
  avgWin: number,
  avgLoss: number,
  riskPct: number,
  simulations = 5000,
  trades = 200,
): number {
  let ruins = 0;
  for (let i = 0; i < simulations; i++) {
    let balance = 1.0;
    for (let t = 0; t < trades; t++) {
      const win = Math.random() < winRate / 100;
      balance += win ? avgWin * riskPct : -avgLoss * riskPct;
      if (balance <= 0.5) {
        ruins++;
        break;
      }
    }
  }
  return parseFloat(((ruins / simulations) * 100).toFixed(2));
}

const riskOfRuin = calcRiskOfRuin(96.4, 1.8, 1.0, 0.02);

export default function LivePage() {
  const [profit, setProfit] = useState(MOCK_OPEN_TRADE.profit);
  const [currentPrice, setCurrentPrice] = useState(
    MOCK_OPEN_TRADE.currentPrice,
  );
  const [hasOpen, setHasOpen] = useState(true);
  const [duration, setDuration] = useState(MOCK_OPEN_TRADE.duration);

  useEffect(() => {
    if (!hasOpen) return;
    const interval = setInterval(() => {
      setProfit(p => parseFloat((p + (Math.random() - 0.48) * 4).toFixed(2)));
      setCurrentPrice(p =>
        parseFloat((p + (Math.random() - 0.48) * 0.5).toFixed(2)),
      );
    }, 1500);
    return () => clearInterval(interval);
  }, [hasOpen]);

  const isProfit = profit >= 0;
  const totalProfit = ACCOUNT_STATS.profit;
  const depositRatio = ((totalProfit / ACCOUNT_STATS.deposit) * 100).toFixed(1);

  return (
    <div className='space-y-6'>
      <div>
        <p className='text-xs uppercase tracking-wider text-gray-600 mb-1'>
          Conta mestra
        </p>
        <h1
          style={{ fontFamily: "'Montreal Bold', sans-serif" }}
          className='text-2xl text-white'
        >
          Ao Vivo
        </h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className='rounded-3xl border border-white/10 p-6'
        style={{ background: 'rgba(255,255,255,0.03)' }}
      >
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-2'>
            <span
              className={`w-2 h-2 rounded-full animate-pulse ${hasOpen ? 'bg-white' : 'bg-gray-700'}`}
            />
            <p className='text-xs uppercase tracking-wider text-gray-500'>
              {hasOpen ? 'Operação em aberto' : 'Nenhuma operação aberta'}
            </p>
          </div>
          {hasOpen && (
            <div className='flex items-center gap-1.5 text-xs font-mono text-gray-500'>
              <Clock className='w-3 h-3' />
              {duration}
            </div>
          )}
        </div>

        {hasOpen ? (
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div>
              <p className='text-xs text-gray-600 mb-1'>Par</p>
              <p className='text-lg text-white font-light'>
                {MOCK_OPEN_TRADE.symbol}
              </p>
            </div>
            <div>
              <p className='text-xs text-gray-600 mb-1'>Direção</p>
              <div className='flex items-center gap-1.5'>
                {MOCK_OPEN_TRADE.direction === 'BUY' ? (
                  <TrendingUp className='w-4 h-4 text-white' />
                ) : (
                  <TrendingDown className='w-4 h-4 text-white' />
                )}
                <p className='text-lg text-white font-light'>
                  {MOCK_OPEN_TRADE.direction}
                </p>
              </div>
            </div>
            <div>
              <p className='text-xs text-gray-600 mb-1'>Preço atual</p>
              <p className='text-lg text-white font-light'>
                {currentPrice.toFixed(2)}
              </p>
              <p className='text-xs text-gray-600 font-mono'>
                abertura {MOCK_OPEN_TRADE.openPrice}
              </p>
            </div>
            <div>
              <p className='text-xs text-gray-600 mb-1'>P&L flutuante</p>
              <motion.p
                key={profit}
                animate={{ opacity: [0.6, 1] }}
                className={`text-2xl font-light ${isProfit ? 'text-white' : 'text-gray-400'}`}
              >
                {isProfit ? '+' : ''}${profit.toFixed(2)}
              </motion.p>
            </div>
          </div>
        ) : (
          <div className='flex items-center gap-3 text-gray-600'>
            <Activity className='w-5 h-5' />
            <p className='text-sm'>Aguardando sinal do algoritmo...</p>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className='rounded-3xl border border-white/10 p-6'
        style={{ background: 'rgba(255,255,255,0.03)' }}
      >
        <p className='text-xs uppercase tracking-wider text-gray-600 mb-6'>
          Resumo da conta mestra
        </p>

        <div className='grid grid-cols-2 md:grid-cols-3 gap-6 mb-8'>
          <div>
            <p className='text-xs text-gray-600 mb-1'>Depósito inicial</p>
            <p className='text-xl text-white font-light'>
              $
              {ACCOUNT_STATS.deposit.toLocaleString('en-US', {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
          <div>
            <p className='text-xs text-gray-600 mb-1'>Lucro total</p>
            <p className='text-xl text-white font-light'>
              +$
              {ACCOUNT_STATS.profit.toLocaleString('en-US', {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
          <div>
            <p className='text-xs text-gray-600 mb-1'>Saldo atual</p>
            <p className='text-xl text-white font-light'>
              $
              {ACCOUNT_STATS.balance.toLocaleString('en-US', {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
          <div>
            <p className='text-xs text-gray-600 mb-1'>Relação lucro/depósito</p>
            <p className='text-xl text-white font-light'>+{depositRatio}%</p>
          </div>
          <div>
            <p className='text-xs text-gray-600 mb-1'>Drawdown máximo</p>
            <p className='text-xl text-white font-light'>
              {ACCOUNT_STATS.maxDrawdown}%
            </p>
          </div>
          <div>
            <p className='text-xs text-gray-600 mb-1'>Win rate</p>
            <p className='text-xl text-white font-light'>
              {ACCOUNT_STATS.winRate}%
            </p>
          </div>
        </div>

        <div className='border-t border-white/5 pt-6'>
          <div className='flex items-start gap-3'>
            <AlertTriangle className='w-4 h-4 text-gray-600 mt-0.5 shrink-0' />
            <div>
              <p className='text-xs uppercase tracking-wider text-gray-600 mb-1'>
                Risco de ruína — Monte Carlo
              </p>
              <p className='text-2xl text-white font-light mb-1'>
                {riskOfRuin}%
              </p>
              <p className='text-xs text-gray-600 font-mono'>
                5.000 simulações · 200 trades · risco 2% por operação · win rate{' '}
                {ACCOUNT_STATS.winRate}%
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className='rounded-3xl border border-white/10 overflow-hidden'
        style={{ background: 'rgba(255,255,255,0.03)' }}
      >
        <div className='px-6 py-5 border-b border-white/5'>
          <p className='text-xs uppercase tracking-wider text-gray-600'>
            Histórico de operações
          </p>
        </div>

        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='border-b border-white/5'>
                {[
                  'Ticket',
                  'Data',
                  'Par',
                  'Dir.',
                  'Abertura',
                  'Fechamento',
                  'P&L',
                ].map(h => (
                  <th
                    key={h}
                    className='text-left px-6 py-3 text-xs text-gray-600 font-normal uppercase tracking-wider'
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_HISTORY.map((t, i) => (
                <tr
                  key={t.ticket}
                  className='border-b border-white/5 hover:bg-white/3 transition'
                >
                  <td className='px-6 py-4 text-xs text-gray-500 font-mono'>
                    {t.ticket}
                  </td>
                  <td className='px-6 py-4 text-xs text-gray-500 font-mono'>
                    {t.date}
                  </td>
                  <td className='px-6 py-4 text-sm text-white'>{t.symbol}</td>
                  <td className='px-6 py-4'>
                    <div className='flex items-center gap-1'>
                      {t.dir === 'BUY' ? (
                        <TrendingUp className='w-3 h-3 text-white/60' />
                      ) : (
                        <TrendingDown className='w-3 h-3 text-white/40' />
                      )}
                      <span className='text-xs text-gray-400'>{t.dir}</span>
                    </div>
                  </td>
                  <td className='px-6 py-4 text-sm text-gray-400 font-mono'>
                    {t.open.toFixed(2)}
                  </td>
                  <td className='px-6 py-4 text-sm text-gray-400 font-mono'>
                    {t.close.toFixed(2)}
                  </td>
                  <td className='px-6 py-4 text-sm font-mono text-white'>
                    +${t.profit.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className='px-6 py-4 border-t border-white/5'>
          <p className='text-xs text-gray-700 font-mono'>
            mostrando 10 de {ACCOUNT_STATS.totalTrades} operações · backtest
            Rage_Dev_Alvo_v5 XAUUSD H1
          </p>
        </div>
      </motion.div>
    </div>
  );
}
