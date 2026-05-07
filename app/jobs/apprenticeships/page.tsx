import Link from 'next/link'
import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { GraduationCap, BookOpen, Star, ArrowRight, CheckCircle, Briefcase, Clock, DollarSign } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Apprenticeship & Training Jobs | QuickTrade NZ',
  description:
    'Find apprenticeship and trade training opportunities across New Zealand. Start your career in plumbing, electrical, carpentry and more — earn while you learn.',
  openGraph: {
    title: 'Apprenticeship & Training Jobs | QuickTrade NZ',
    description:
      'Find apprenticeship and trade training opportunities across New Zealand. Start your career in plumbing, electrical, carpentry and more — earn while you learn.',
    url: 'https://quicktrade-pi.vercel.app/jobs/apprenticeships',
  },
}

const TRADE_APPRENTICESHIPS = [
  { trade: 'Electrical', duration: '4 years', wage: '$18–$26/hr', body: 'Electrical Workers Registration Board (EWRB)', icon: '⚡' },
  { trade: 'Plumbing & Gasfitting', duration: '4 years', wage: '$18–$25/hr', body: 'Plumbers, Gasfitters & Drainlayers Board', icon: '🔧' },
  { trade: 'Carpentry', duration: '3 years', wage: '$18–$24/hr', body: 'BCITO', icon: '🪚' },
  { trade: 'HVAC/Refrigeration', duration: '4 years', wage: '$19–$26/hr', body: 'RCANZ / BCITO', icon: '❄️' },
  { trade: 'Roofing', duration: '3 years', wage: '$17–$23/hr', body: 'BCITO', icon: '🏠' },
  { trade: 'Painting & Decorating', duration: '3 years', wage: '$17–$22/hr', body: 'BCITO', icon: '🎨' },
]

const BENEFITS = [
  { icon: DollarSign, title: 'Earn While You Learn', description: 'Receive a wage from day one while completing your trade qualification.' },
  { icon: GraduationCap, title: 'Nationally Recognised Qualification', description: 'Graduate with an NZQA-recognised Level 4 trade qualification.' },
  { icon: Star, title: 'Industry Mentorship', description: 'Learn directly from experienced tradespeople on real job sites.' },
  { icon: Clock, title: 'Career Pathway', description: 'Clear progression from apprentice to journeyman to business owner.' },
]

const FAQS = [
  {
    q: 'What qualifications do I need to start an apprenticeship?',
    a: 'Most NZ trade apprenticeships require NCEA Level 1 or equivalent. Some trades prefer Level 2 in subjects like maths and English. No prior trade experience is needed.',
  },
  {
    q: 'How long does a trade apprenticeship take?',
    a: 'Apprenticeships typically run 3–4 years depending on the trade. You work full-time with an employer while completing theory training through an industry training organisation (ITO).',
  },
  {
    q: 'How much do apprentices earn?',
    a: 'Starting wages range from $17–$20/hr and increase as you progress. Many employers pay above the minimum and provide tool allowances.',
  },
  {
    q: 'What funding is available?',
    a: 'The government\'s Apprenticeship Boost scheme provides employers with up to $500/month per apprentice in the first two years, which often benefits apprentice wages. Fees-Free may also apply.',
  },
]

export default function ApprenticeshipsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/5 bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 py-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-5xl px-4 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-sm text-indigo-300">
            <GraduationCap className="h-4 w-4" />
            Apprenticeships &amp; Training
          </div>
          <h1 className="mb-6 text-4xl font-bold text-white md:text-6xl">
            Start Your Trade Career<br />
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              Earn While You Learn
            </span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-400">
            Discover apprenticeship and training opportunities across New Zealand&apos;s trades sector.
            Connect with employers who are ready to invest in your future.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/jobs?category=apprenticeship"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-4 font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:opacity-90"
            >
              Browse Apprenticeships <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/jobs?category=training"
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 py-4 font-semibold text-white transition hover:bg-white/10"
            >
              Browse Training Roles <BookOpen className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-5xl px-4 py-20">
        <h2 className="mb-12 text-center text-3xl font-bold text-white">Why Choose a Trade Apprenticeship?</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-2xl border border-white/5 bg-white/5 p-6">
              <div className="mb-4 inline-flex rounded-xl bg-indigo-500/10 p-3">
                <Icon className="h-6 w-6 text-indigo-400" />
              </div>
              <h3 className="mb-2 font-semibold text-white">{title}</h3>
              <p className="text-sm text-slate-400">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trade Types */}
      <section className="border-y border-white/5 bg-white/[0.02] py-20">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="mb-4 text-center text-3xl font-bold text-white">Available Trade Apprenticeships</h2>
          <p className="mb-12 text-center text-slate-400">
            NZ apprenticeships are managed through industry training organisations (ITOs) and are NZQA registered.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TRADE_APPRENTICESHIPS.map((t) => (
              <div key={t.trade} className="rounded-2xl border border-white/5 bg-white/5 p-5">
                <div className="mb-3 text-3xl">{t.icon}</div>
                <h3 className="mb-1 font-semibold text-white">{t.trade}</h3>
                <div className="mb-3 space-y-1 text-sm text-slate-400">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-indigo-400" />
                    {t.duration}
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-3.5 w-3.5 text-indigo-400" />
                    {t.wage}
                  </div>
                </div>
                <p className="text-xs text-slate-500">Governed by: {t.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/jobs/create?category=apprenticeship"
              className="inline-flex items-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-6 py-3 text-sm font-medium text-indigo-300 transition hover:bg-indigo-500/20"
            >
              <Briefcase className="h-4 w-4" />
              Post an Apprenticeship Role
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-4xl px-4 py-20">
        <h2 className="mb-12 text-center text-3xl font-bold text-white">How It Works</h2>
        <ol className="space-y-6">
          {[
            { step: '1', title: 'Browse listings', detail: 'Filter jobs by Apprenticeship or Training category to find the right opportunity.' },
            { step: '2', title: 'Apply directly', detail: 'Send your application through QuickTrade — no middlemen, no unnecessary forms.' },
            { step: '3', title: 'Interview & accept', detail: 'The employer reviews applications and contacts you for an interview.' },
            { step: '4', title: 'Register with your ITO', detail: 'Once hired, your employer registers you with the relevant industry training organisation.' },
            { step: '5', title: 'Earn & learn', detail: 'Work full-time on the tools while completing your off-job training and assessments.' },
          ].map(({ step, title, detail }) => (
            <li key={step} className="flex gap-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 font-bold text-white">
                {step}
              </div>
              <div>
                <h3 className="font-semibold text-white">{title}</h3>
                <p className="mt-1 text-sm text-slate-400">{detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* FAQs */}
      <section className="border-t border-white/5 bg-white/[0.02] py-20">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="mb-10 text-center text-3xl font-bold text-white">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {FAQS.map(({ q, a }) => (
              <div key={q} className="rounded-2xl border border-white/5 bg-white/5 p-6">
                <div className="mb-2 flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-indigo-400" />
                  <h3 className="font-semibold text-white">{q}</h3>
                </div>
                <p className="pl-8 text-sm text-slate-400">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-4 py-20 text-center">
        <h2 className="mb-4 text-3xl font-bold text-white">Ready to Start Your Trade Career?</h2>
        <p className="mb-8 text-slate-400">
          Thousands of NZ employers are looking for enthusiastic apprentices. Find your opportunity today.
        </p>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/jobs?category=apprenticeship"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-4 font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:opacity-90"
          >
            Find an Apprenticeship <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/auth/register"
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 py-4 font-semibold text-white transition hover:bg-white/10"
          >
            Create a Free Account
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
