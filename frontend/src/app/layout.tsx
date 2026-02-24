import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export const metadata: Metadata = {
  title: 'projeKt Rage — Dashboard',
  description: 'Gestão multiconta MetaTrader 5',
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    localStorage.removeItem('auth-storage');
  }
  return (
    <html lang='pt-BR'>
      <body className='bg-black text-white min-h-screen'>
        {children}
        <Toaster
          position='bottom-right'
          toastOptions={{
            style: {
              background: '#111',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
              fontFamily: 'DM Mono, monospace',
              fontSize: '12px',
              borderRadius: '16px',
            },
          }}
        />
      </body>
    </html>
  );
}
