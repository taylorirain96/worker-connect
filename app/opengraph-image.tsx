import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'QuickTrade NZ — New Zealand\'s trusted home services marketplace'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0a0f1e 0%, #111827 60%, #0a0f1e 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Radial glow */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(99,102,241,0.25) 0%, transparent 70%)',
          }}
        />
        {/* NZ badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(99,102,241,0.15)',
            border: '1px solid rgba(99,102,241,0.35)',
            borderRadius: 999,
            padding: '8px 20px',
            marginBottom: 28,
          }}
        >
          <span style={{ fontSize: 20 }}>🇳🇿</span>
          <span style={{ color: '#a5b4fc', fontSize: 18, fontWeight: 500 }}>New Zealand</span>
        </div>
        {/* Main heading */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: -2,
            textAlign: 'center',
            lineHeight: 1.1,
            marginBottom: 20,
          }}
        >
          QuickTrade{' '}
          <span style={{ color: '#818cf8' }}>NZ</span>
        </div>
        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            color: '#94a3b8',
            textAlign: 'center',
            maxWidth: 700,
            lineHeight: 1.4,
          }}
        >
          New Zealand&apos;s trusted home services marketplace
        </div>
        {/* URL strip */}
        <div
          style={{
            position: 'absolute',
            bottom: 36,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1' }} />
          <span style={{ color: '#475569', fontSize: 18 }}>quicktrade.co.nz</span>
        </div>
      </div>
    ),
    { ...size },
  )
}
