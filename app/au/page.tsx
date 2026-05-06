import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { AU_CITIES } from '@/lib/utils'
import { SITE_URL, AU_SITE_DESCRIPTION } from '@/lib/seo/config'
import { MapPin, Star, Shield, Zap } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Find Trusted Tradies Across Australia | QuickTrade AU',
  description: AU_SITE_DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/au` },
  openGraph: {
    title: 'Find Trusted Tradies Across Australia | QuickTrade AU',
    description: AU_SITE_DESCRIPTION,
    url: `${SITE_URL}/au`,
    type: 'website',
  },
}

const AU_CITY_EMOJIS: Record<string, string> = {
  Sydney: '🌉',
  Melbourne: '☕',
  Brisbane: '🌞',
  Perth: '🏖️',
  Adelaide: '🍷',
  'Gold Coast': '🌊',
  Canberra: '🏛️',
  Newcastle: '⚓',
  Wollongong: '🌿',
  Geelong: '🏆',
}

const FEATURES = [
  {
    icon: Shield,
    title: 'Verified Tradies',
    description: 'Every tradie is ID-verified and background-checked before joining the platform.',
  },
  {
    icon: Star,
    title: 'Genuine Reviews',
    description: 'Only clients who have completed a job can leave a review — no fake ratings.',
  },
  {
    icon: Zap,
    title: 'Fast Quotes',
    description: 'Post your job and receive competitive quotes from local tradies within hours.',
  },
]

export default function AustraliaLandingPage() {
  return (
    <div className="flex flex-col min-h-screen luxury-bg">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section
          className="relative overflow-hidden py-24 px-4"
          style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #111827 60%, #0a0f1e 100%)' }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium mb-6">
              <span>🇦🇺</span>
              <span>Now available in Australia</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
              Find Trusted Tradies{' '}
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                Across Australia
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10">
              Connect with verified local tradies across Australia. Hire plumbers, electricians, builders,
              and more — fast, safe, and with transparent pricing including GST.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/jobs"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-base transition-all shadow-lg shadow-indigo-500/25"
              >
                Browse Jobs
              </Link>
              <Link
                href="/auth/register"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white font-semibold text-base transition-all"
              >
                Post a Job
              </Link>
            </div>

            <p className="mt-6 text-sm text-slate-500">
              All prices displayed include 10% GST where applicable · Payments in AUD
            </p>
          </div>
        </section>

        {/* City Grid */}
        <section className="py-16 px-4 border-b border-slate-800">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-white mb-3">Top Cities</h2>
              <p className="text-slate-400">Find tradies in your city across Australia</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {AU_CITIES.map((city) => (
                <Link
                  key={city}
                  href={`/jobs?location=${encodeURIComponent(city)}&country=AU`}
                  className="flex flex-col items-center p-5 rounded-xl bg-slate-900/70 border border-slate-700/50 hover:border-indigo-500/40 hover:shadow-[0_0_20px_rgba(99,102,241,0.1)] transition-all duration-200 group"
                >
                  <span className="text-3xl mb-2">{AU_CITY_EMOJIS[city] ?? '🏙️'}</span>
                  <div className="flex items-center gap-1 text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                    <MapPin className="h-3 w-3 text-indigo-400" />
                    {city}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 px-4 border-b border-slate-800">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-white mb-3">Why QuickTrade AU?</h2>
              <p className="text-slate-400">The trusted way to hire tradies across Australia</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {FEATURES.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="flex flex-col items-center text-center p-6 rounded-xl bg-slate-900/60 border border-slate-700/50"
                >
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-indigo-400" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">{title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Ready to get started?</h2>
            <p className="text-slate-400 mb-8">
              Whether you need a tradie or you are a tradie looking for work — QuickTrade AU has you covered.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/jobs"
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold transition-all"
              >
                Browse All Jobs →
              </Link>
              <Link
                href="/workers"
                className="px-8 py-3.5 rounded-xl border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white font-semibold transition-all"
              >
                Find a Tradie →
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
