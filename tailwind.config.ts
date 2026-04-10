import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
        accent: {
          500: '#f59e0b',
          600: '#d97706',
        },
        gold: {
          300: '#fde68a',
          400: '#f3c969',
          500: '#d4af37',
          600: '#b8860b',
        },
      },
      animation: {
        'pulse-gold': 'pulse-gold 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-gold-slow': 'pulse-gold 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        'pulse-gold': {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(212, 175, 55, 0.3)',
            opacity: '1',
          },
          '50%': {
            boxShadow: '0 0 35px rgba(212, 175, 55, 0.65)',
            opacity: '0.9',
          },
        },
      },
      boxShadow: {
        'gold-glow': '0 0 20px rgba(212, 175, 55, 0.3)',
        'gold-glow-lg': '0 0 40px rgba(212, 175, 55, 0.45)',
      },
    },
  },
  plugins: [],
}
export default config
