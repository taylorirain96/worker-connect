import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Pricing | QuickTrade NZ',
  description:
    "Simple, transparent pricing for workers and employers. Get started for free on QuickTrade — New Zealand's trusted trades marketplace.",
  alternates: {
    canonical: 'https://quicktrade.co.nz/pricing',
  },
}

const workerFeatures = [
  'Create a free worker profile',
  'Browse and apply for local jobs',
  'Receive job alerts by email',
  'Verified badge after first completed job',
  'Instant messaging with employers',
  'Build your public reviews & rating',
  'Access to QuickTrade Leaderboard',
]

const employerFeatures = [
  'Post unlimited jobs for free',
  'Receive quotes from verified workers',
  'Review worker profiles, ratings & portfolios',
  'Secure milestone-based payments via Stripe',
  'Dispute resolution support',
  'Invoice and payment history',
  'Priority listings available (coming soon)',
]

const faqs = [
  {
    question: 'Is there a subscription fee?',
    answer:
      'No. QuickTrade is completely free to join for both workers and employers. We only earn a small service fee when a job is completed.',
  },
  {
    question: 'When do I pay the platform fee?',
    answer:
      'The platform fee is deducted automatically when a job payment is processed. Workers receive their payout minus the 12% service fee. Employers are charged a 3% buyer protection fee on top of the agreed job price.',
  },
  {
    question: 'Are there refunds if a job goes wrong?',
    answer:
      "Yes. QuickTrade has a dispute resolution process. If a job doesn't go as agreed, you can raise a dispute and our team will review the case. Refunds are handled on a case-by-case basis.",
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
              <span>Pricing</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
              Simple, transparent pricing
              <br />
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                No surprises.
              </span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              QuickTrade is free to join. We only earn when you do.
            </p>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto space-y-12">
            {/* Pricing cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Worker card */}
              <div
                className="rounded-2xl bg-slate-900/70 border border-slate-700/50 p-8 flex flex-col"
                style={{ borderColor: 'rgb(99 102 241 / 0.3)' }}
              >
                <div className="mb-6">
                  <span className="inline-block px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold tracking-wide uppercase mb-4">
                    For Workers
                  </span>
                  <h2 className="text-2xl font-bold text-white">Free to Join</h2>
                  <div className="mt-3 flex items-end gap-1">
                    <span className="text-5xl font-bold text-white">$0</span>
                    <span className="text-slate-400 mb-1">/month</span>
                  </div>
                  <p className="text-slate-400 text-sm mt-2">Pay only when you win work</p>
                </div>

                <hr className="border-slate-700/50 mb-6" />

                <ul className="space-y-3 mb-6 flex-1">
                  {workerFeatures.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="text-green-400 shrink-0 mt-0.5">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-sm text-amber-200 mt-4 mb-6">
                  <p>
                    <strong>Platform fee:</strong> QuickTrade takes a{' '}
                    <strong>12% service fee</strong> from each completed job payment. This covers
                    secure payments, dispute resolution, and platform support.
                  </p>
                </div>

                <Link
                  href="/auth/register"
                  className="block w-full text-center px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors"
                >
                  Get Started Free
                </Link>
              </div>

              {/* Employer card */}
              <div
                className="rounded-2xl bg-slate-900/70 border border-slate-700/50 p-8 flex flex-col"
                style={{ borderColor: 'rgb(34 197 94 / 0.3)' }}
              >
                <div className="mb-6">
                  <span className="inline-block px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-semibold tracking-wide uppercase mb-4">
                    For Employers
                  </span>
                  <h2 className="text-2xl font-bold text-white">Pay Per Hire</h2>
                  <div className="mt-3 flex items-end gap-1">
                    <span className="text-5xl font-bold text-white">Free</span>
                    <span className="text-slate-400 mb-1">to post</span>
                  </div>
                  <p className="text-slate-400 text-sm mt-2">No subscription needed</p>
                </div>

                <hr className="border-slate-700/50 mb-6" />

                <ul className="space-y-3 mb-6 flex-1">
                  {employerFeatures.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="text-green-400 shrink-0 mt-0.5">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-sm text-amber-200 mt-4 mb-6">
                  <p>
                    <strong>Buyer protection fee:</strong> A{' '}
                    <strong>3% processing fee</strong> is added to each payment to cover Stripe
                    fees and platform security.
                  </p>
                </div>

                <Link
                  href="/auth/register"
                  className="block w-full text-center px-6 py-3 rounded-xl border border-slate-500 hover:border-green-500/50 hover:bg-green-500/5 text-white font-semibold transition-colors"
                >
                  Post a Job
                </Link>
              </div>
            </div>

            {/* How the fees work */}
            <div className="rounded-2xl bg-slate-900/70 border border-slate-700/50 p-8">
              <h2 className="text-2xl font-bold text-white mb-6">How the fees work</h2>
              <pre className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-sm text-slate-300 overflow-x-auto font-mono leading-relaxed">
                {`Example: $1,000 job
├── Employer pays:    $1,030  (includes 3% buyer protection fee)
├── Platform fee:       $120  (12% of $1,000 taken from worker payout)
└── Worker receives:   $880`}
              </pre>
              <p className="text-slate-400 text-sm mt-6 leading-relaxed">
                All payments are processed securely via Stripe. QuickTrade never holds your funds
                — payments are released to workers upon job completion confirmation.
              </p>
            </div>

            {/* FAQ */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
              <div className="rounded-2xl bg-slate-900/70 border border-slate-700/50 divide-y divide-slate-700/50">
                {faqs.map(({ question, answer }) => (
                  <div key={question} className="p-6">
                    <p className="font-semibold text-white mb-2">{question}</p>
                    <p className="text-slate-400 text-sm leading-relaxed">{answer}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Final CTA */}
            <div className="bg-indigo-500/10 rounded-2xl border border-indigo-500/30 p-12 text-center">
              <h2 className="text-3xl font-bold text-white mb-3">Ready to get started?</h2>
              <p className="text-slate-400 mb-8">Join thousands of Kiwis already using QuickTrade.</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/auth/register"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-lg transition-colors"
                >
                  I&apos;m a Worker
                </Link>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-slate-500 hover:border-indigo-500/50 hover:bg-indigo-500/5 text-white font-semibold text-lg transition-colors"
                >
                  I&apos;m an Employer
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
