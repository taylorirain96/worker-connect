export const EMPLOYER_THEME = {
  // Primary palette (warmer blacks)
  background: {
    primary: '#1a1a2e',   // Warm dark navy
    secondary: '#252540', // Warmer charcoal
    card: '#2d2d44',      // Warm card background
    hover: '#3a3a5c',     // Soft hover
  },

  // Accent colors (warmer, softer)
  accent: {
    primary: '#f59e0b',   // Warm amber (inviting)
    secondary: '#3b82f6', // Softer blue (approachable)
    gold: '#d4af37',      // Champagne gold (elegant)
    goldLight: '#f3c969', // Soft gold (highlights)
  },

  // Text (slightly softer whites)
  text: {
    primary: '#fef3c7',  // Warm white
    secondary: '#d4d4d8', // Warm gray
    muted: '#71717a',    // Softer muted
  },

  // CTAs (warmer, less aggressive)
  cta: {
    background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
    hover: 'linear-gradient(135deg, #fbbf24 0%, #fcd34d 100%)',
    shadow: '0 0 30px rgba(245, 158, 11, 0.3)',
  },

  // Borders (softer, warmer tones)
  border: {
    default: '#3a3a5c',
    gold: '#d4af37',
    glow: 'rgba(212, 175, 55, 0.3)',
  },
} as const

export type EmployerTheme = typeof EMPLOYER_THEME
