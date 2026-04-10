'use client'

import { useState } from 'react'
import { WORKER_THEME } from '@/lib/themes/worker'
import { EMPLOYER_THEME } from '@/lib/themes/employer'
import type { RoleTheme } from '@/lib/themes'
import ThemeSwitcher from '@/components/theme/ThemeSwitcher'
import ComponentShowcase from '@/components/theme/ComponentShowcase'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

type ViewMode = RoleTheme | 'split'

export default function ThemeComparisonPage() {
  const [view, setView] = useState<ViewMode>('split')

  const workerBg = WORKER_THEME.background.primary
  const employerBg = EMPLOYER_THEME.background.primary

  // Background for the page chrome (outer wrapper)
  const pageBg =
    view === 'worker'
      ? workerBg
      : view === 'employer'
      ? employerBg
      : '#0d1117' // neutral dark for split

  return (
    <div
      className="min-h-screen py-10 px-4 transition-colors duration-500"
      style={{ backgroundColor: pageBg }}
    >
      {/* Back link */}
      <div className="max-w-7xl mx-auto mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
          style={{ color: WORKER_THEME.text.muted }}
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          Back to App
        </Link>
      </div>

      {/* Header */}
      <div className="max-w-7xl mx-auto text-center mb-8">
        <h1
          className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2"
          style={{ color: WORKER_THEME.accent.platinum }}
        >
          Theme Comparison Centre
        </h1>
        <p className="text-sm" style={{ color: WORKER_THEME.text.muted }}>
          Preview Worker &amp; Employer themes side-by-side, or switch between them
        </p>
      </div>

      {/* Theme Switcher */}
      <div className="max-w-7xl mx-auto">
        <ThemeSwitcher activeTheme={view} onThemeChange={setView} />
      </div>

      {/* Content area */}
      {view === 'split' ? (
        // ── Split layout ──
        <div className="max-w-7xl mx-auto">
          {/* Column labels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-3">
            <div className="text-center">
              <span
                className="inline-block px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest"
                style={{
                  backgroundColor: `${WORKER_THEME.accent.primary}22`,
                  color: WORKER_THEME.accent.primary,
                  border: `1px solid ${WORKER_THEME.accent.primary}60`,
                }}
              >
                🔧 Worker Theme — Professional Bold
              </span>
            </div>
            <div className="text-center">
              <span
                className="inline-block px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest"
                style={{
                  backgroundColor: `${EMPLOYER_THEME.accent.primary}22`,
                  color: EMPLOYER_THEME.accent.primary,
                  border: `1px solid ${EMPLOYER_THEME.accent.primary}60`,
                }}
              >
                🏠 Employer Theme — Warm Approachable
              </span>
            </div>
          </div>

          {/* Two-column showcase */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ComponentShowcase theme="worker" />
            <ComponentShowcase theme="employer" />
          </div>
        </div>
      ) : (
        // ── Single theme layout ──
        <div className="max-w-3xl mx-auto">
          <div className="mb-4 text-center">
            <span
              className="inline-block px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest"
              style={{
                backgroundColor:
                  view === 'worker'
                    ? `${WORKER_THEME.accent.primary}22`
                    : `${EMPLOYER_THEME.accent.primary}22`,
                color:
                  view === 'worker'
                    ? WORKER_THEME.accent.primary
                    : EMPLOYER_THEME.accent.primary,
                border: `1px solid ${
                  view === 'worker'
                    ? WORKER_THEME.accent.primary
                    : EMPLOYER_THEME.accent.primary
                }60`,
              }}
            >
              {view === 'worker'
                ? '🔧 Worker Theme — Professional Bold'
                : '🏠 Employer Theme — Warm Approachable'}
            </span>
          </div>
          <ComponentShowcase theme={view} />
        </div>
      )}

      {/* Toggle prompt at bottom */}
      <div className="max-w-7xl mx-auto mt-10 text-center">
        <p className="text-xs mb-4" style={{ color: WORKER_THEME.text.muted }}>
          Switch your view to experience both themes
        </p>
        <ThemeSwitcher activeTheme={view} onThemeChange={setView} />
      </div>
    </div>
  )
}
