import { ImageResponse } from 'next/og'
import { getServiceBySlug } from '@/lib/seo/servicesData'

export const runtime = 'edge'

export const alt = 'QuickTrade NZ — Service'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

interface Props {
  params: { service: string }
}

export default function Image({ params }: Props) {
  const service = getServiceBySlug(params.service)
  const title = service ? `${service.name} in New Zealand` : 'Services'
  const tagline = service
    ? `Find trusted ${service.namePlural} across New Zealand on QuickTrade`
    : 'Browse trusted tradespeople across New Zealand'

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
        {/* Brand + NZ badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'rgba(99,102,241,0.15)',
            border: '1px solid rgba(99,102,241,0.35)',
            borderRadius: 999,
            padding: '8px 20px',
            marginBottom: 28,
          }}
        >
          <span style={{ fontSize: 18 }}>🇳🇿</span>
          <span style={{ color: '#a5b4fc', fontSize: 18, fontWeight: 600 }}>QuickTrade NZ</span>
        </div>
        {/* Title */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: -1.5,
            textAlign: 'center',
            lineHeight: 1.1,
            marginBottom: 20,
            maxWidth: 900,
          }}
        >
          {title}
        </div>
        {/* Tagline */}
        <div
          style={{
            fontSize: 26,
            color: '#94a3b8',
            textAlign: 'center',
            maxWidth: 700,
            lineHeight: 1.4,
          }}
        >
          {tagline}
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
