import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import {
  ArrowRight, Star, MapPin, CheckCircle, Briefcase,
  DollarSign, Shield, Users, Zap,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'QuickTrade Australia — Find Trusted Tradies Across Australia',
  description:
    'Australia\'s premium trade & labour marketplace. Find licensed electricians, plumbers, carpenters and more across Sydney, Melbourne, Brisbane, Perth and beyond. ABN-verified tradies.',
  openGraph: {
    title: 'QuickTrade Australia — Find Trusted Tradies',
    description:
      'Australia\'s premium trade & labour marketplace. ABN-verified tradies across all states and territories.',
    url: 'https://quicktrade-pi.vercel.app/au',
  },
}

const AU_CITIES = [
  { name: 'Sydney', state: 'NSW', workers: '2,400+' },
  { name: 'Melbourne', state: 'VIC', workers: '2,100+' },
  { name: 'Brisbane', state: 'QLD', workers: '1,500+' },
  { name: 'Perth', state: 'WA', workers: '1,200+' },
  { name: 'Adelaide', state: 'SA', workers: '800+' },
  { name: 'Canberra', state: 'ACT', workers: '500+' },
  { name: 'Darwin', state: 'NT', workers: '300+' },
  { name: 'Hobart', state: 'TAS', workers: '250+' },
]

const TRADES = [
  { name: 'Electrician', icon: '⚡', note: 'Licensed — A-grade & REC required' },
  { name: 'Plumber', icon: '🔧', note: 'Licensed — state licence required' },
  { name: 'Carpenter', icon: '🪚', note: 'Construction Induction (White Card) required' },
  { name: 'HVAC Technician', icon: '❄️', note: 'ARCtick licence required for refrigerants' },
  { name: 'Roofer', icon: '🏠', note: 'Working at Heights certification' },
  { name: 'Painter', icon: '🎨', note: 'State painter\'s licence (varies by state)' },
  { name: 'Landscaper', icon: '🌿', note: 'No licence required; insurance recommended' },
  { name: 'Concreter', icon: '🏗️', note: 'White Card required on sites' },
]

const FEATURES = [
  { icon: Shield, title: 'ABN-Verified Tradies', description: 'Every worker\'s ABN is verified against the Australian Business Register before they can list services.' },
  { icon: DollarSign, title: 'AUD Payments', description: 'All quotes and invoices are in Australian dollars, with 10% GST calculated automatically.' },
  { icon: Star, title: 'Verified Reviews', description: 'Only clients who have completed a job can leave a review — no fake ratings.' },
  { icon: Zap, title: 'Fast Response', description: 'Most tradies respond within 2 hours. Emergency callouts available 24/7.' },
]

export default function AustraliaPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/5 bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 py-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-5xl px-4 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-sm text-indigo-300">
            🇦🇺 QuickTrade Australia — Now Available
          </div>
          <h1 className="mb-6 text-4xl font-bold text-white md:text-6xl">
            Find Trusted Tradies<br />
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              Anywhere in Australia
            </span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-400">
            ABN-verified electricians, plumbers, carpenters and more across all Australian states and territories.
            Get quotes in AUD, pay securely, and leave reviews.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/jobs?country=AU"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-4 font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:opacity-90"
            >
              Browse Australian Jobs <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/workers?country=AU"
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 py-4 font-semibold text-white transition hover:bg-white/10"
            >
              Find a Tradie <Users className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-4 py-20">
        <h2 className="mb-12 text-center text-3xl font-bold text-white">Why QuickTrade Australia?</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, description }) => (
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

      {/* Cities */}
      <section className="border-y border-white/5 bg-white/[0.02] py-20">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="mb-4 text-center text-3xl font-bold text-white">Available Across Australia</h2>
          <p className="mb-12 text-center text-slate-400">
            From Darwin to Hobart — QuickTrade is live in every state and territory.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {AU_CITIES.map((city) => (
              <Link
                key={city.name}
                href={`/workers?country=AU&location=${city.name}`}
                className="group rounded-2xl border border-white/5 bg-white/5 p-5 transition hover:border-indigo-500/30 hover:bg-white/10"
              >
                <div className="mb-1 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-indigo-400" />
                  <span className="font-semibold text-white group-hover:text-indigo-300">{city.name}</span>
                  <span className="text-xs text-slate-500">{city.state}</span>
                </div>
                <p className="text-sm text-slate-400">{city.workers} tradies</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trades */}
      <section className="mx-auto max-w-5xl px-4 py-20">
        <h2 className="mb-4 text-center text-3xl font-bold text-white">Trades We Cover</h2>
        <p className="mb-12 text-center text-slate-400">
          Australian licensing requirements vary by state. QuickTrade verifies licences and ABNs before listing.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TRADES.map((trade) => (
            <div key={trade.name} className="rounded-2xl border border-white/5 bg-white/5 p-5">
              <div className="mb-2 text-3xl">{trade.icon}</div>
              <h3 className="mb-1 font-semibold text-white">{trade.name}</h3>
              <p className="text-xs text-slate-400">{trade.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AU Compliance */}
      <section className="border-t border-white/5 bg-white/[0.02] py-20">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="mb-8 text-center text-3xl font-bold text-white">Australian Compliance</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {[
              { title: 'ABN Verification', detail: 'All tradies must provide a valid Australian Business Number (ABN), verified against the Australian Business Register (ABR).' },
              { title: 'GST (10%)', detail: 'Quotes and invoices include 10% GST as required by the A New Tax System (Goods and Services Tax) Act 1999.' },
              { title: 'Fair Work Act', detail: 'Employment placements comply with the Fair Work Act 2009 and the National Employment Standards.' },
              { title: 'Contractor Agreements', detail: 'Digital contractor agreements are available and aligned with Australian contractor law.' },
            ].map(({ title, detail }) => (
              <div key={title} className="flex gap-4 rounded-2xl border border-white/5 bg-white/5 p-5">
                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-400" />
                <div>
                  <h3 className="font-semibold text-white">{title}</h3>
                  <p className="mt-1 text-sm text-slate-400">{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-4 py-20 text-center">
        <h2 className="mb-4 text-3xl font-bold text-white">Get Started in Australia</h2>
        <p className="mb-8 text-slate-400">
          Whether you&apos;re a homeowner looking for a tradie or a tradie looking for work —
          QuickTrade Australia has you covered.
        </p>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/auth/sign-up?country=AU"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-4 font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:opacity-90"
          >
            <Briefcase className="h-4 w-4" />
            Sign Up Free
          </Link>
          <Link
            href="/jobs?country=AU"
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 py-4 font-semibold text-white transition hover:bg-white/10"
          >
            Browse Jobs <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
