import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Pricing | QuickTrade NZ',
  description:
    'Simple, transparent pricing for workers and employers. QuickTrade charges no monthly fees — you only pay when you get paid.',
  alternates: {
    canonical: 'https://quicktrade.co.nz/pricing',
  },
}

const workerFeatures = [
  'Free profile creation',
  'Apply to unlimited jobs',
  'No monthly subscription',
  '12% fee deducted from your payout when a job is marked complete',
  'Direct messaging with employers',
  'Ratings & review system',
]

const employerFeatures = [
  'Free job posting',
  'Receive multiple quotes',
  'No monthly subscription',
  '3% fee charged on payment to the worker',
  'Built-in messaging',
  'Dispute resolution support',
]

const faqs = [
  {
    q: 'When do I pay the fee?',
    a: 'Fees are only charged when a job is marked as complete and payment is processed through the QuickTrade platform. No job, no fee.',
  },
  {
    q: 'Are there any hidden fees?',
    a: 'No. There are no monthly subscriptions, listing fees, or profile fees. The only fees are the 12% worker service fee and the 3% employer buyer protection fee on completed jobs.',
  },
  {
    q: 'What does the buyer protection fee cover?',
    a: "The 3% employer fee funds QuickTrade's dispute resolution service. If something goes wrong, our team will step in to mediate and, where appropriate, issue refunds.",
  },
]

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen luxury-bg">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section
          className="relative overflow-hidden py-20 px-4"
          style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #111827 60%, #0a0f1e 100%)' }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium mb-6">
              <span>💰</span>
              <span>Transparent Pricing</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
              Simple pricing,{' '}
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                no surprises
              </span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              No monthly subscription. No hidden fees. QuickTrade only takes a cut when a job is
              completed.
            </p>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto space-y-12">
            {/* Pricing cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Worker card */}
              <div className="rounded-2xl bg-slate-900/70 border border-slate-700/50 p-8 flex flex-col">
                <div className="text-4xl mb-4">👷</div>
                <h2 className="text-2xl font-bold text-white mb-1">Workers</h2>
                <p className="text-slate-400 text-sm mb-6">Free to join, free to apply</p>
                <div className="mb-6">
                  <p className="text-4xl font-bold text-white">Free</p>
                  <p className="text-slate-400 text-sm mt-1">to join</p>
                  <p className="text-2xl font-bold text-white mt-4">12%</p>
                  <p className="text-slate-400 text-sm mt-1">service fee on completed jobs</p>
                </div>
                <ul className="space-y-3 flex-1 mb-8">
                  {workerFeatures.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-slate-300">
                      <span className="text-emerald-400">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/register"
                  className="block w-full text-center py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors"
                >
                  Join as a Worker
                </Link>
              </div>

              {/* Employer card */}
              <div className="rounded-2xl bg-slate-900/70 border border-indigo-500 p-8 flex flex-col">
                <div className="text-4xl mb-4">🏢</div>
                <h2 className="text-2xl font-bold text-white mb-1">Employers</h2>
                <p className="text-slate-400 text-sm mb-6">Post jobs for free</p>
                <div className="mb-6">
                  <p className="text-4xl font-bold text-white">Free</p>
                  <p className="text-slate-400 text-sm mt-1">to post</p>
                  <p className="text-2xl font-bold text-white mt-4">3%</p>
                  <p className="text-slate-400 text-sm mt-1">buyer protection fee</p>
                </div>
                <ul className="space-y-3 flex-1 mb-8">
                  {employerFeatures.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-slate-300">
                      <span className="text-emerald-400">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/register"
                  className="block w-full text-center py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors"
                >
                  Post a Job
                </Link>
              </div>
            </div>

            {/* How the fees work */}
            <div className="rounded-2xl bg-slate-900/70 border border-slate-700/50 p-8">
              <h2 className="text-2xl font-bold text-white mb-6">How the fees work</h2>
              <div className="divide-y divide-slate-700/50">
                <div className="flex justify-between py-3">
                  <span className="text-slate-300">Job value</span>
                  <span className="text-slate-300 font-medium">$1,000.00</span>
                </div>
                <div className="flex flex-wrap justify-between gap-1 py-3">
                  <span className="text-emerald-400">Worker earns</span>
                  <span className="text-emerald-400 font-medium">
                    $880.00{' '}
                    <span className="text-slate-500 font-normal text-sm">
                      (after 12% service fee of $120.00)
                    </span>
                  </span>
                </div>
                <div className="flex flex-wrap justify-between gap-1 py-3">
                  <span className="text-slate-300">Employer pays</span>
                  <span className="text-slate-300 font-medium">
                    $1,030.00{' '}
                    <span className="text-slate-500 font-normal text-sm">
                      (job value + 3% buyer protection of $30.00)
                    </span>
                  </span>
                </div>
                <div className="flex flex-wrap justify-between gap-1 py-3">
                  <span className="text-indigo-400">QuickTrade earns</span>
                  <span className="text-indigo-400 font-medium">
                    $150.00{' '}
                    <span className="text-slate-500 font-normal text-sm">(platform revenue)</span>
                  </span>
                </div>
              </div>
              <p className="text-slate-500 text-sm mt-4">
                *Example based on a $1,000 job. Fees may vary.
              </p>
            </div>

            {/* FAQ */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Frequently asked questions</h2>
              <div className="space-y-4">
                {faqs.map(({ q, a }) => (
                  <div
                    key={q}
                    className="rounded-xl bg-slate-900/70 border border-slate-700/50 p-6"
                  >
                    <h3 className="text-white font-semibold mb-2">{q}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{a}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="text-center space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/auth/register"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-lg transition-colors"
                >
                  Join as a Worker
                </Link>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-xl border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white font-semibold text-lg transition-colors"
                >
                  Post a Job
                </Link>
              </div>
              <p className="text-slate-500 text-sm">
                No credit card required. Get started in minutes.
              </p>
            </div>

            {/* Internal link */}
            <div className="text-center">
              <Link
                href="/services"
                className="text-slate-400 hover:text-white transition-colors text-sm"
              >
                ← Browse all services
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
