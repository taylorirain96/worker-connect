'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { ArrowRight } from 'lucide-react'

// Countdown target: 12 May 2026
const LAUNCH_DATE = new Date('2026-05-12T00:00:00+12:00')

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function getTimeLeft(): TimeLeft {
  const diff = LAUNCH_DATE.getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

const DEAL_CARDS = [
  {
    emoji: '🏢',
    role: 'Employers',
    deal: '3 months free',
    dealDetail: 'on any subscription',
    spots: 50,
    spotsLabel: '50 spots available',
    ctaLabel: 'Claim Your Free Months',
    href: '/auth/register?role=employer',
    accent: 'indigo',
    border: 'border-indigo-500/40 hover:border-indigo-500/70',
    badge: 'bg-indigo-500/10 text-indigo-300',
    bar: 'bg-indigo-500',
    barBg: 'bg-indigo-500/20',
    btn: 'from-indigo-600 to-indigo-500 shadow-indigo-500/30 hover:shadow-indigo-500/50',
  },
  {
    emoji: '🔨',
    role: 'Tradies',
    deal: '0% commission',
    dealDetail: 'on your first 3 jobs',
    spots: 100,
    spotsLabel: '100 spots available',
    ctaLabel: 'Claim Your 0% Deal',
    href: '/auth/register?role=worker',
    accent: 'emerald',
    border: 'border-emerald-500/40 hover:border-emerald-500/70',
    badge: 'bg-emerald-500/10 text-emerald-300',
    bar: 'bg-emerald-500',
    barBg: 'bg-emerald-500/20',
    btn: 'from-emerald-600 to-emerald-500 shadow-emerald-500/30 hover:shadow-emerald-500/50',
  },
  {
    emoji: '👷',
    role: 'Job Seekers',
    deal: 'Free profile boost',
    dealDetail: 'for your first month',
    spots: 100,
    spotsLabel: '100 spots available',
    ctaLabel: 'Claim Your Free Boost',
    href: '/auth/register?role=worker',
    accent: 'violet',
    border: 'border-violet-500/40 hover:border-violet-500/70',
    badge: 'bg-violet-500/10 text-violet-300',
    bar: 'bg-violet-500',
    barBg: 'bg-violet-500/20',
    btn: 'from-violet-600 to-violet-500 shadow-violet-500/30 hover:shadow-violet-500/50',
  },
  {
    emoji: '🏠',
    role: 'Homeowners / Clients',
    deal: '50% off',
    dealDetail: 'your first job posting',
    spots: 200,
    spotsLabel: '200 spots available',
    ctaLabel: 'Claim 50% Off',
    href: '/auth/register?role=employer',
    accent: 'amber',
    border: 'border-amber-500/40 hover:border-amber-500/70',
    badge: 'bg-amber-500/10 text-amber-300',
    bar: 'bg-amber-500',
    barBg: 'bg-amber-500/20',
    btn: 'from-amber-600 to-amber-500 shadow-amber-500/30 hover:shadow-amber-500/50',
  },
]

const WHY_JOIN = [
  {
    icon: '🚀',
    title: 'Shape the platform',
    desc: 'Founding members get first access to new features and their feedback shapes how we build',
  },
  {
    icon: '🛡️',
    title: 'Locked in forever',
    desc: 'Your founding member status and deals are locked in as long as you stay active',
  },
  {
    icon: '🌟',
    title: 'Founding Member badge',
    desc: 'Get a permanent Founding Member badge on your profile — shows clients and workers you were here first',
  },
]

const TERMS = [
  'Founding deals are available for a limited time and limited number of spots',
  '0% commission applies to first 3 completed jobs only, standard commission rates apply after',
  '3 months free applies to first subscription period only',
  '50% off applies to first job posting only',
  'QuickTrade reserves the right to close founding deals at any time once spots are filled',
]

export default function FoundersDealPage() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft())

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div className="flex flex-col min-h-screen luxury-bg">
      <Navbar />

      <main className="flex-1">
        {/* ── Hero ── */}
        <section
          className="relative overflow-hidden py-20 px-4"
          style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #111827 60%, #0a0f1e 100%)' }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,102,241,0.22) 0%, transparent 70%)',
            }}
          />
          <div className="relative max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full px-4 py-1.5 text-sm mb-6">
              <span className="text-indigo-300 font-medium">🎉 Limited Time Offer</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
              Be a QuickTrade Founder 🎉
            </h1>

            <p className="text-lg sm:text-xl text-slate-400 mb-12 max-w-2xl mx-auto">
              We&apos;re launching soon and we want real people on the platform from day one. Founding
              members get exclusive deals that will never be offered again.
            </p>

            {/* Countdown */}
            <div className="inline-flex flex-wrap justify-center gap-4 sm:gap-6">
              {[
                { label: 'Days', value: timeLeft.days },
                { label: 'Hours', value: timeLeft.hours },
                { label: 'Minutes', value: timeLeft.minutes },
                { label: 'Seconds', value: timeLeft.seconds },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex flex-col items-center bg-white/5 border border-white/10 rounded-2xl px-6 py-4 min-w-[80px]"
                >
                  <span className="text-4xl sm:text-5xl font-bold text-white tabular-nums">
                    {pad(value)}
                  </span>
                  <span className="text-xs text-slate-400 mt-1 uppercase tracking-widest">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Deal Cards ── */}
        <section className="py-20 px-4 bg-[#0a0f1e]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Choose Your Deal</h2>
              <p className="text-slate-400 text-lg">Pick the deal that&apos;s right for you and claim your spot</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {DEAL_CARDS.map((card) => (
                <div
                  key={card.role}
                  className={`relative flex flex-col rounded-2xl border bg-white/5 backdrop-blur p-6 transition-all duration-300 ${card.border}`}
                >
                  {/* Icon + title */}
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-3xl">{card.emoji}</span>
                    <span className={`text-sm font-semibold px-3 py-1 rounded-full ${card.badge}`}>
                      {card.role}
                    </span>
                  </div>

                  {/* Deal */}
                  <p className="text-3xl font-extrabold text-white leading-tight mb-1">{card.deal}</p>
                  <p className="text-slate-400 text-sm mb-6">{card.dealDetail}</p>

                  {/* Progress bar */}
                  <div className="mb-6">
                    <div className="flex justify-between text-xs text-slate-400 mb-2">
                      <span>{card.spotsLabel}</span>
                    </div>
                    <div className={`w-full h-2 rounded-full ${card.barBg}`}>
                      <div className={`h-2 rounded-full ${card.bar}`} style={{ width: '100%' }} />
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="mt-auto">
                    <Link
                      href={card.href}
                      className={`inline-flex w-full items-center justify-center gap-2 bg-gradient-to-r ${card.btn} text-white font-semibold text-sm px-4 py-3 rounded-xl shadow transition-all duration-300 hover:scale-105`}
                    >
                      {card.ctaLabel}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Why Join Early ── */}
        <section
          className="py-20 px-4"
          style={{ background: 'linear-gradient(135deg, #0f1629 0%, #111827 100%)' }}
        >
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Why Join Early?</h2>
              <p className="text-slate-400 text-lg">Three very good reasons to claim your spot today</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {WHY_JOIN.map((item) => (
                <div
                  key={item.title}
                  className="flex flex-col items-center text-center bg-white/5 border border-white/10 rounded-2xl p-8"
                >
                  <span className="text-5xl mb-5">{item.icon}</span>
                  <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Terms ── */}
        <section className="py-12 px-4 bg-[#0a0f1e]">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-4">
              Terms & Conditions
            </h3>
            <ul className="space-y-2">
              {TERMS.map((term) => (
                <li key={term} className="flex items-start gap-2 text-slate-500 text-sm">
                  <span className="mt-0.5 text-slate-600">•</span>
                  {term}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
