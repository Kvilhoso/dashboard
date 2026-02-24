/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        mono: ['var(--font-mono)', 'monospace'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      colors: {
        bg: {
          base: '#080C14',
          surface: '#0D1220',
          card: '#111827',
          border: '#1E2D45',
          hover: '#162033',
        },
        accent: {
          DEFAULT: '#00E5FF',
          dim: '#00B8CC',
          glow: 'rgba(0,229,255,0.15)',
          muted: 'rgba(0,229,255,0.06)',
        },
        bull: '#00D68F',
        bear: '#FF4D6D',
        warn: '#FFB800',
        ink: {
          primary: '#E8F0FE',
          secondary: '#7B90B2',
          muted: '#3D5170',
        },
      },
      boxShadow: {
        'glow-accent': '0 0 20px rgba(0,229,255,0.25)',
        'glow-bull': '0 0 20px rgba(0,214,143,0.25)',
        'glow-bear': '0 0 20px rgba(255,77,109,0.25)',
        card: '0 1px 3px rgba(0,0,0,0.5), 0 0 0 1px rgba(30,45,69,0.8)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.4s ease forwards',
        'slide-up': 'slideUp 0.4s ease forwards',
        blink: 'blink 1.2s step-end infinite',
        ticker: 'ticker 20s linear infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        blink: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0' } },
        ticker: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
};
