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
        // Electric indigo — Worker CTA colour
        indigo: {
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
        },
        // Violet — Employer CTA colour
        violet: {
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
        },
        // Platinum — replaces gold
        platinum: {
          300: '#f0f5ff',
          400: '#e8f0f9',
          500: '#c8d6e5',
          600: '#94a3b8',
        },
        // Ice blue accent
        ice: {
          400: '#7dd3fc',
          500: '#38bdf8',
          600: '#0ea5e9',
        },
      },
      animation: {
        'pulse-indigo': 'pulse-indigo 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-indigo-slow': 'pulse-indigo 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-violet': 'pulse-violet 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-violet-slow': 'pulse-violet 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        'pulse-indigo': {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)',
            opacity: '1',
          },
          '50%': {
            boxShadow: '0 0 35px rgba(99, 102, 241, 0.65)',
            opacity: '0.9',
          },
        },
        'pulse-violet': {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)',
            opacity: '1',
          },
          '50%': {
            boxShadow: '0 0 35px rgba(139, 92, 246, 0.65)',
            opacity: '0.9',
          },
        },
      },
      boxShadow: {
        'indigo-glow': '0 0 20px rgba(99, 102, 241, 0.3)',
        'indigo-glow-lg': '0 0 40px rgba(99, 102, 241, 0.45)',
        'violet-glow': '0 0 20px rgba(139, 92, 246, 0.3)',
        'violet-glow-lg': '0 0 40px rgba(139, 92, 246, 0.45)',
        'ice-glow': '0 0 20px rgba(56, 189, 248, 0.3)',
        'platinum-glow': '0 0 20px rgba(200, 214, 229, 0.25)',
      },
    },
  },
  plugins: [],
}
export default config
