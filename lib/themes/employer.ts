export const EMPLOYER_THEME = {
  // Primary palette — warmer deep dark
  background: {
    primary: '#0d1117',    // Deep charcoal (calm authority)
    secondary: '#161b22',  // Soft dark (approachable premium)
    card: '#1c2333',       // Warm dark card
    hover: '#1f2937',      // Gentle hover
  },

  // Accent colors — warmer violet tones
  accent: {
    primary: '#8b5cf6',    // Violet (softer premium, approachable luxury)
    secondary: '#06b6d4',  // Cyan (clean, modern, approachable)
    platinum: '#dde6f0',   // Bright platinum (elegant finish)
    platinumLight: '#f0f5ff', // Soft platinum highlight
  },

  // Text — warm near-whites
  text: {
    primary: '#f8faff',    // Near white with cool tint
    secondary: '#a0aec0',  // Muted blue-grey
    muted: '#64748b',      // Soft muted
  },

  // CTAs — violet gradient, softer
  cta: {
    background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
    hover: 'linear-gradient(135deg, #a78bfa 0%, #c4b5fd 100%)',
    shadow: '0 0 30px rgba(139, 92, 246, 0.4)',
  },

  // Borders — soft violet/platinum tones
  border: {
    default: '#1f2937',
    platinum: '#dde6f0',
    glow: 'rgba(139, 92, 246, 0.3)',
  },
} as const

export type EmployerTheme = typeof EMPLOYER_THEME
