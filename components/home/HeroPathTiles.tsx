'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, ChevronDown, HardHat, ClipboardList, Hammer, Briefcase, Wrench, Building2 } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'

const WORK_SUBTILES = [
  {
    icon: Hammer,
    title: "I'm a Tradie",
    description: 'Trade & skilled work',
    href: '/jobs?path=tradie',
  },
  {
    icon: Briefcase,
    title: 'Looking for work',
    description: 'Jobs, contracts & roles',
    href: '/jobs?path=jobseeker',
  },
]

const HIRE_SUBTILES = [
  {
    icon: Wrench,
    title: 'Get a job done',
    description: 'One-off, any size',
    href: '/jobs/create?path=client',
  },
  {
    icon: Building2,
    title: "I'm a Business",
    description: 'I hire regularly',
    href: '/jobs/create?path=employer',
  },
]

export default function HeroPathTiles() {
  const [expanded, setExpanded] = useState<'work' | 'hire' | null>(null)
  const [heroVariant, setHeroVariant] = useState<'A' | 'B'>('A')

  // Assign A/B variant once on mount, persisted in localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('hero_variant') as 'A' | 'B' | null
      if (stored === 'A' || stored === 'B') {
        setHeroVariant(stored)
        trackEvent('hero_variant_assigned', { variant: stored })
      } else {
        const assigned: 'A' | 'B' = Math.random() < 0.5 ? 'A' : 'B'
        localStorage.setItem('hero_variant', assigned)
        setHeroVariant(assigned)
        trackEvent('hero_variant_assigned', { variant: assigned })
      }
    } catch {
      // localStorage unavailable — stay on default variant A
    }
  }, [])

  function toggle(key: 'work' | 'hire') {
    trackEvent('hero_cta_click', { variant: heroVariant, cta: key })
    setExpanded((prev) => (prev === key ? null : key))
  }

  return (
    <div className="text-center max-w-4xl mx-auto">
      {/* Premium badge */}
      <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full px-4 py-1.5 text-sm mb-6">
        <svg className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        <span className="text-indigo-300">Trusted by 12,000+ tradies and workers</span>
      </div>
      <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-white">
        {heroVariant === 'B' ? (
          <>
            Find Trusted Tradies in{' '}
            <span className="platinum-shimmer">New Zealand — Fast</span>
          </>
        ) : (
          <>
            New Zealand&apos;s Home for{' '}
            <span className="platinum-shimmer">Trade Work & Employment</span>
          </>
        )}
      </h1>
      <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
        Whether you need a tradie or you are one — QuickTrade connects the right people across New Zealand.
      </p>

      {/* 2-Step Path Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 max-w-2xl mx-auto">
        {/* I want work */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => toggle('work')}
            aria-expanded={expanded === 'work'}
            className="bg-slate-900/70 rounded-2xl p-6 border border-indigo-500/30 hover:border-indigo-500/60 text-left transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.2)] group w-full"
          >
            <div className="flex items-start justify-between">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-indigo-500/10 mb-4">
                <HardHat className="h-6 w-6 text-indigo-400" />
              </div>
              <ChevronDown
                className={`h-5 w-5 text-indigo-400 mt-1 transition-transform duration-300 ${expanded === 'work' ? 'rotate-180' : ''}`}
              />
            </div>
            <h2 className="text-base font-bold text-white mb-1">I want work</h2>
            <p className="text-sm text-slate-400">Tradies & job seekers</p>
          </button>
          <div
            aria-hidden={expanded !== 'work'}
            inert={expanded !== 'work' ? true : undefined}
            className={`grid grid-cols-2 gap-3 overflow-hidden transition-all duration-300 ${expanded === 'work' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
          >
            {WORK_SUBTILES.map(({ icon: Icon, title, description, href }) => (
              <Link
                key={href}
                href={href}
                className="bg-slate-800/60 rounded-xl p-4 border border-indigo-500/20 hover:border-indigo-500/50 text-left transition-all group"
              >
                <div className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-indigo-500/10 mb-3">
                  <Icon className="h-4 w-4 text-indigo-400" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">{title}</h3>
                <p className="text-xs text-slate-400 mb-2">{description}</p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 group-hover:text-indigo-300 transition-colors">
                  Go <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* I need work done */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => toggle('hire')}
            aria-expanded={expanded === 'hire'}
            className="bg-slate-900/70 rounded-2xl p-6 border border-indigo-500/30 hover:border-indigo-500/60 text-left transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.2)] group w-full"
          >
            <div className="flex items-start justify-between">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-indigo-500/10 mb-4">
                <ClipboardList className="h-6 w-6 text-indigo-400" />
              </div>
              <ChevronDown
                className={`h-5 w-5 text-indigo-400 mt-1 transition-transform duration-300 ${expanded === 'hire' ? 'rotate-180' : ''}`}
              />
            </div>
            <h2 className="text-base font-bold text-white mb-1">I need work done</h2>
            <p className="text-sm text-slate-400">One-off or hire someone</p>
          </button>
          <div
            aria-hidden={expanded !== 'hire'}
            inert={expanded !== 'hire' ? true : undefined}
            className={`grid grid-cols-2 gap-3 overflow-hidden transition-all duration-300 ${expanded === 'hire' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
          >
            {HIRE_SUBTILES.map(({ icon: Icon, title, description, href }) => (
              <Link
                key={href}
                href={href}
                className="bg-slate-800/60 rounded-xl p-4 border border-indigo-500/20 hover:border-indigo-500/50 text-left transition-all group"
              >
                <div className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-indigo-500/10 mb-3">
                  <Icon className="h-4 w-4 text-indigo-400" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">{title}</h3>
                <p className="text-xs text-slate-400 mb-2">{description}</p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 group-hover:text-indigo-300 transition-colors">
                  Go <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
