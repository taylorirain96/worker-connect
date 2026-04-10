'use client'

import {
  Droplet,
  Zap,
  Hammer,
  Wind,
  Home,
  Trees,
  Paintbrush,
  Layers,
  Sparkles,
  Package,
  Wrench,
  Star,
  Bell,
  Search,
  Trophy,
  MapPin,
  Clock,
  CheckCircle,
} from 'lucide-react'
import { WORKER_THEME } from '@/lib/themes/worker'
import { EMPLOYER_THEME } from '@/lib/themes/employer'
import type { RoleTheme } from '@/lib/themes'
import ColorSwatches from './ColorSwatches'

interface Props {
  theme: RoleTheme
}

const CATEGORIES = [
  { Icon: Droplet, label: 'Plumbing' },
  { Icon: Zap, label: 'Electrical' },
  { Icon: Hammer, label: 'Carpentry' },
  { Icon: Wind, label: 'HVAC' },
  { Icon: Home, label: 'Roofing' },
  { Icon: Trees, label: 'Landscaping' },
  { Icon: Paintbrush, label: 'Painting' },
  { Icon: Layers, label: 'Flooring' },
  { Icon: Sparkles, label: 'Cleaning' },
  { Icon: Package, label: 'Moving' },
  { Icon: Wrench, label: 'General' },
]

export default function ComponentShowcase({ theme }: Props) {
  const t = theme === 'worker' ? WORKER_THEME : EMPLOYER_THEME
  const isWorker = theme === 'worker'

  const sectionTitle = (title: string) => (
    <h3
      className="text-sm font-semibold uppercase tracking-widest mb-4 pb-2 border-b"
      style={{ color: t.text.muted, borderColor: t.border.default }}
    >
      {title}
    </h3>
  )

  return (
    <div className="space-y-10 rounded-2xl p-6" style={{ backgroundColor: t.background.primary, color: t.text.primary }}>

      {/* ── Category Grid ── */}
      <section>
        {sectionTitle('Category Grid')}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {CATEGORIES.slice(0, 6).map(({ Icon, label }) => (
            <div
              key={label}
              className="group flex flex-col items-center gap-2 rounded-xl p-3 cursor-pointer transition-all duration-200"
              style={{
                backgroundColor: t.background.card,
                border: `1px solid ${t.border.default}`,
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLDivElement
                el.style.borderColor = t.accent.primary
                el.style.boxShadow = `0 0 18px ${t.accent.primary}40`
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLDivElement
                el.style.borderColor = t.border.default
                el.style.boxShadow = 'none'
              }}
            >
              <Icon
                className="h-6 w-6 transition-colors duration-200"
                style={{ color: t.accent.primary }}
                strokeWidth={1.5}
              />
              <span className="text-xs font-medium text-center" style={{ color: t.text.secondary }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Buttons ── */}
      <section>
        {sectionTitle('CTA Buttons')}
        <div className="flex flex-wrap gap-3">
          {/* Primary CTA */}
          <button
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-105"
            style={{
              background: t.cta.background,
              boxShadow: t.cta.shadow,
              color: isWorker ? '#ffffff' : '#1a1a2e',
              border: `2px solid ${t.accent.primary}80`,
            }}
          >
            {isWorker ? 'Post a Job →' : 'Find a Pro →'}
          </button>

          {/* Secondary CTA */}
          <button
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: 'transparent',
              border: `2px solid ${t.accent.platinum}`,
              color: t.accent.platinum,
              boxShadow: `0 0 15px ${t.border.glow}`,
            }}
          >
            {isWorker ? 'View Profile' : 'Learn More'}
          </button>

          {/* Ghost button */}
          <button
            className="px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200"
            style={{
              backgroundColor: t.background.card,
              border: `1px solid ${t.border.default}`,
              color: t.text.secondary,
            }}
          >
            Browse All
          </button>
        </div>
      </section>

      {/* ── Worker Profile Card ── */}
      <section>
        {sectionTitle('Worker Profile Card')}
        <div
          className="rounded-2xl p-5 transition-all duration-200"
          style={{
            backgroundColor: t.background.card,
            border: `1px solid ${t.border.default}`,
          }}
        >
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div
              className="h-14 w-14 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${t.accent.platinum} 0%, ${t.accent.primary} 100%)`,
                color: t.background.primary,
              }}
            >
              JD
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-bold text-base" style={{ color: t.text.primary }}>
                  James Davies
                </h4>
                {/* Premium badge */}
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                  style={{
                    backgroundColor: `${t.accent.platinum}22`,
                    color: t.accent.platinum,
                    border: `1px solid ${t.accent.platinum}60`,
                    boxShadow: `0 0 ${isWorker ? '14px' : '10px'} ${t.border.glow}`,
                  }}
                >
                  <Trophy className="h-2.5 w-2.5" strokeWidth={2} />
                  TOP PRO
                </span>
              </div>

              <p className="text-sm mt-0.5" style={{ color: t.text.secondary }}>
                Master Plumber · 12 years exp.
              </p>

              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-3 w-3"
                      style={{ color: i < 5 ? t.accent.platinum : t.border.default }}
                      fill={i < 5 ? t.accent.platinum : 'none'}
                      strokeWidth={1.5}
                    />
                  ))}
                  <span className="text-xs ml-1" style={{ color: t.text.muted }}>
                    4.9 (127 reviews)
                  </span>
                </div>

                <div className="flex items-center gap-1 text-xs" style={{ color: t.text.muted }}>
                  <MapPin className="h-3 w-3" strokeWidth={1.5} />
                  Auckland, NZ
                </div>
              </div>
            </div>

            <div className="text-right flex-shrink-0">
              <p className="font-bold text-lg" style={{ color: t.accent.platinum }}>
                $85/hr
              </p>
              <div className="flex items-center gap-1 text-[10px] mt-1" style={{ color: t.text.muted }}>
                <CheckCircle className="h-3 w-3 text-green-400" strokeWidth={2} />
                Verified
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Job Listing Card ── */}
      <section>
        {sectionTitle('Job Listing Card')}
        <div
          className="rounded-2xl p-5 transition-all duration-200 cursor-pointer"
          style={{
            backgroundColor: t.background.card,
            border: `1px solid ${t.border.default}`,
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLDivElement
            el.style.borderColor = t.accent.platinum
            el.style.boxShadow = `0 0 20px ${t.border.glow}`
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLDivElement
            el.style.borderColor = t.border.default
            el.style.boxShadow = 'none'
          }}
        >
          {/* Priority badge */}
          <div className="flex items-center justify-between mb-3">
            <span
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold"
              style={{
                backgroundColor: `${t.accent.primary}22`,
                color: t.accent.primary,
                border: `1px solid ${t.accent.primary}60`,
              }}
            >
              🔥 URGENT
            </span>
            <span className="text-xs" style={{ color: t.text.muted }}>
              Posted 2h ago
            </span>
          </div>

          <h4 className="font-bold text-base mb-1" style={{ color: t.text.primary }}>
            Burst Pipe Repair Needed ASAP
          </h4>
          <p className="text-sm mb-3" style={{ color: t.text.secondary }}>
            Kitchen pipe burst under sink. Water damage risk. Need licensed plumber within 2 hours.
          </p>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1 text-sm" style={{ color: t.accent.platinum }}>
              <span className="font-bold">$120–$200</span>
            </div>
            <div className="flex items-center gap-1 text-xs" style={{ color: t.text.muted }}>
              <MapPin className="h-3 w-3" strokeWidth={1.5} />
              Wellington CBD
            </div>
            <div className="flex items-center gap-1 text-xs" style={{ color: t.text.muted }}>
              <Clock className="h-3 w-3" strokeWidth={1.5} />
              Within 2 hours
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Dashboard ── */}
      <section>
        {sectionTitle('Stats Dashboard')}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Active Jobs', value: '1,284', sub: '+12% this week' },
            { label: 'Verified Pros', value: '4,730', sub: '96% avg rating' },
            { label: 'Avg Response', value: '18 min', sub: 'Industry best' },
            { label: 'Completed', value: '98.4%', sub: 'Satisfaction rate' },
          ].map(({ label, value, sub }) => (
            <div
              key={label}
              className="rounded-xl p-4 text-center"
              style={{
                backgroundColor: t.background.secondary,
                border: `1px solid ${t.border.default}`,
              }}
            >
              <p
                className="text-2xl font-extrabold"
                style={{ color: t.accent.platinum }}
              >
                {value}
              </p>
              <p className="text-xs font-semibold mt-0.5" style={{ color: t.text.secondary }}>
                {label}
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: t.text.muted }}>
                {sub}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Navigation Bar Preview ── */}
      <section>
        {sectionTitle('Navigation Bar')}
        <div
          className="flex items-center justify-between rounded-xl px-4 py-3 gap-3"
          style={{
            backgroundColor: t.background.secondary,
            border: `1px solid ${t.border.default}`,
          }}
        >
          <span
            className="font-extrabold text-base tracking-tight"
            style={{ color: t.accent.platinum }}
          >
            QuickTrade
          </span>
          <div className="hidden sm:flex items-center gap-4 text-xs font-medium" style={{ color: t.text.secondary }}>
            {['Find Workers', 'Post Job', 'How It Works'].map((link) => (
              <span
                key={link}
                className="cursor-pointer transition-colors"
                style={{ color: t.text.secondary }}
              >
                {link}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4" style={{ color: t.text.secondary }} strokeWidth={1.5} />
            <div
              className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold"
              style={{
                background: `linear-gradient(135deg, ${t.accent.platinum} 0%, ${t.accent.primary} 100%)`,
                color: t.background.primary,
              }}
            >
              JD
            </div>
          </div>
        </div>
      </section>

      {/* ── Search Bar ── */}
      <section>
        {sectionTitle('Search Bar')}
        <div
          className="flex items-center gap-3 rounded-xl px-4 py-3"
          style={{
            backgroundColor: t.background.card,
            border: `1px solid ${t.border.default}`,
          }}
        >
          <Search className="h-4 w-4 flex-shrink-0" style={{ color: t.text.muted }} strokeWidth={1.5} />
          <span className="text-sm flex-1" style={{ color: t.text.muted }}>
            Search for plumbers, electricians…
          </span>
          <button
            className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200"
            style={{
              background: t.cta.background,
              color: isWorker ? '#fff' : '#1a1a2e',
            }}
          >
            Search
          </button>
        </div>
      </section>

      {/* ── Notification Badge + Premium Badge ── */}
      <section>
        {sectionTitle('Badges')}
        <div className="flex flex-wrap items-center gap-4">
          {/* Notification badge */}
          <div className="relative inline-block">
            <Bell className="h-7 w-7" style={{ color: t.text.secondary }} strokeWidth={1.5} />
            <span
              className="absolute -top-1 -right-1 h-4 w-4 rounded-full flex items-center justify-center text-[9px] font-bold"
              style={{
                backgroundColor: t.accent.primary,
                color: '#fff',
              }}
            >
              3
            </span>
          </div>

          {/* Premium / TOP PRO badge */}
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
            style={{
              backgroundColor: `${t.accent.platinum}18`,
              color: t.accent.platinum,
              border: `1px solid ${t.accent.platinum}70`,
              boxShadow: isWorker
                ? `0 0 20px rgba(99,102,241,0.5), 0 0 40px rgba(99,102,241,0.3)`
                : `0 0 15px rgba(139,92,246,0.3), 0 0 30px rgba(139,92,246,0.2)`,
            }}
          >
            <Trophy className="h-3 w-3" strokeWidth={2} />
            TOP PRO
          </span>

          {/* Verified badge */}
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{
              backgroundColor: `${t.accent.secondary}18`,
              color: t.accent.secondary,
              border: `1px solid ${t.accent.secondary}50`,
            }}
          >
            <CheckCircle className="h-3 w-3" strokeWidth={2} />
            Verified
          </span>
        </div>
      </section>

      {/* ── Color Palette ── */}
      <section>
        {sectionTitle('Color Palette')}
        <ColorSwatches theme={theme} />
      </section>

      {/* ── Platinum Glow Comparison ── */}
      <section>
        {sectionTitle('Platinum Glow (Premium Element)')}
        <div className="flex flex-wrap gap-6 items-center">
          <div className="text-center">
            <div
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold mb-2"
              style={{
                backgroundColor: `${t.accent.platinum}18`,
                color: t.accent.platinum,
                border: `1px solid ${t.accent.platinum}80`,
                boxShadow: isWorker
                  ? `0 0 20px rgba(99,102,241,0.5), 0 0 40px rgba(99,102,241,0.3)`
                  : `0 0 15px rgba(139,92,246,0.3), 0 0 30px rgba(139,92,246,0.2)`,
              }}
            >
              <Trophy className="h-4 w-4" strokeWidth={2} />
              TOP PRO
            </div>
            <p className="text-[10px]" style={{ color: t.text.muted }}>
              {isWorker ? 'Worker: Bolder indigo glow' : 'Employer: Softer violet glow'}
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
