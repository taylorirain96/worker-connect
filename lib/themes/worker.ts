export const WORKER_THEME = {
  // Primary palette — cool deep navy
  background: {
    primary: '#0a0f1e',    // Ultra deep navy (authority, trust)
    secondary: '#111827',  // Rich dark (sophistication)
    card: '#111827',       // Dark cards
    hover: '#1e2a3a',      // Deep blue-slate hover
  },

  // Accent colors — precision & intelligence
  accent: {
    primary: '#6366f1',    // Electric indigo (premium tech, forward-thinking)
    secondary: '#38bdf8',  // Ice blue (precision, skill, expertise)
    platinum: '#c8d6e5',   // Platinum shimmer (ranks above gold in luxury perception)
    platinumLight: '#e8f0f9', // Bright platinum highlight
  },

  // Text — blue-tinted whites
  text: {
    primary: '#f0f4ff',    // Blue-tinted crisp white
    secondary: '#94a3b8',  // Cool slate gray
    muted: '#475569',      // Muted slate
  },

  // CTAs — indigo gradient, bold
  cta: {
    background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
    hover: 'linear-gradient(135deg, #818cf8 0%, #a5b4fc 100%)',
    shadow: '0 0 30px rgba(99, 102, 241, 0.5)',
  },

  // Borders — cool indigo/platinum tones
  border: {
    default: '#1e2a3a',
    platinum: '#c8d6e5',
    glow: 'rgba(99, 102, 241, 0.3)',
  },
} as const

export type WorkerTheme = typeof WORKER_THEME
