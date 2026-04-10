export const WORKER_THEME = {
  // Primary palette
  background: {
    primary: '#0f172a',   // Deep navy (professional)
    secondary: '#1e293b', // Charcoal slate
    card: '#1e293b',      // Dark cards
    hover: '#334155',     // Hover state
  },

  // Accent colors (cooler, bold)
  accent: {
    primary: '#ff6b35',   // Bold orange (action)
    secondary: '#0066cc', // Trust blue
    gold: '#c5a05a',      // 24K gold (achievement)
    goldLight: '#ffd700', // Bright gold (highlights)
  },

  // Text
  text: {
    primary: '#f8fafc',  // Crisp white
    secondary: '#cbd5e1', // Light gray
    muted: '#64748b',    // Muted gray
  },

  // CTAs (bolder, more aggressive)
  cta: {
    background: 'linear-gradient(135deg, #ff6b35 0%, #ff8555 100%)',
    hover: 'linear-gradient(135deg, #ff8555 0%, #ff9f75 100%)',
    shadow: '0 0 30px rgba(255, 107, 53, 0.4)',
  },

  // Borders (sharper, cooler tones)
  border: {
    default: '#334155',
    gold: '#c5a05a',
    glow: 'rgba(197, 160, 90, 0.3)',
  },
} as const

export type WorkerTheme = typeof WORKER_THEME
