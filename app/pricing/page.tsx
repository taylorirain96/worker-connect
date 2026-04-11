import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Shield,
  FileText,
  AlertCircle,
  Star,
  Lock,
  Umbrella,
  Zap,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Pricing | QuickTrade NZ',
  description:
    'Simple, transparent pricing for workers and employers on QuickTrade. Workers are always free. Employers pay a small posting fee. You only pay when you win.',
  alternates: {
    canonical: 'https://quicktrade.co.nz/pricing',
  },
}

const employerPostingTiers = [
  {
    label: 'Small Job',
    range: 'Under $500 NZD',
    price: '$9.99',
    description: 'Perfect for quick tasks and small repairs',
  },
  {
    label: 'Medium Job',
    range: '$500 – $2,000 NZD',
    price: '$19.99',
    description: 'Renovations, installations, and mid-size projects',
  },
  {
    label: 'Large Job',
    range: '$2,000 – $10,000 NZD',
    price: '$34.99',
    description: 'Major home improvements and complex trade work',
  },
  {
    label: 'Commercial / Major',
    range: '$10,000+ NZD',
    price: '$59.99',
    description: 'Commercial contracts and large-scale projects',
  },
]

const employerAddOns = [
  {
    label: 'Featured Job Listing',
    price: '+$9.99',
    description: 'Appear at the top of search results',
  },
  {
    label: 'Urgent Job Badge',
    price: '+$4.99',
    description: '"Need it done today" — attracts fast responders',
  },
  {
    label: 'Premium Employer Account',
    price: '$49/month',
    description: 'Unlimited job posts — great for businesses that hire regularly',
  },
]

const workerCommissionTiers = [
  { tier: 'New Worker', range: '0 – 5 jobs', commission: '10%', color: 'text-slate-300' },
  { tier: 'Established', range: '6 – 20 jobs', commission: '8%', color: 'text-indigo-300' },
  { tier: 'Pro Worker', range: '21 – 50 jobs', commission: '6%', color: 'text-violet-300' },
  { tier: 'Elite Worker', range: '50+ jobs', commission: '5%', color: 'text-emerald-400' },
]

const commissionCovers = [
  { icon: Lock, label: 'Secure escrow payment protection' },
  { icon: FileText, label: 'Auto-generated legal contract' },
  { icon: AlertCircle, label: 'Dispute resolution' },
  { icon: Shield, label: 'QuickTrade Guarantee' },
  { icon: Star, label: 'Verified review on profile' },
  { icon: Umbrella, label: 'Payment insurance' },
]

const faqs = [
  {
    q: 'Why do workers pay a commission?',
    a: "The commission is taken from money you've already earned — never from your pocket upfront. It covers your payment protection, legal contract, dispute resolution, and the QuickTrade Guarantee. Think of it as getting all of that for a small percentage of a completed job. You're not paying a fee — you're getting a full safety net.",
  },
  {
    q: 'What if the employer doesn\'t pay?',
    a: "Because all payments are held in secure escrow before work begins, employers can't walk away without paying. The money is already locked in. If a dispute arises, our team steps in to resolve it and, where appropriate, release funds to the worker.",
  },
  {
    q: 'Can I cancel a job after posting?',
    a: "Employers can cancel a job post before any worker is hired with no charge. Once a job is accepted and work has started, cancellation policies apply as set out in the auto-generated contract. Posting fees are non-refundable once the job is live.",
  },
  {
    q: 'What is the QuickTrade Guarantee?',
    a: "The QuickTrade Guarantee means that if something goes seriously wrong on a job conducted through the platform — such as non-payment or significant disputes — QuickTrade will investigate and, where eligible, compensate the worker or employer. It only applies to jobs posted and transacted through QuickTrade.",
  },
  {
    q: 'How does escrow work?',
    a: "When a quote is accepted, the employer deposits the agreed payment into QuickTrade's secure escrow. The worker knows the money is there before they start work. Once the job is completed and the employer approves it, the funds are released to the worker (minus the platform commission). Neither party can access the funds mid-job.",
  },
  {
    q: 'When do I receive my money as a worker?',
    a: "Once the employer marks the job as complete and approves the work, payment is released immediately. Funds typically arrive in your account within 1–3 business days depending on your bank. You can track your earnings in your worker dashboard at any time.",
  },
]

export default function PricingPage() {
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
              <span>💰</span>
              <span>Transparent Pricing</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6 tracking-tight">
              Simple, transparent pricing.{' '}
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                You only pay when you win.
              </span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Workers are always free to join, browse, and quote. Employers pay a small posting fee
              to access vetted professionals. No surprises, ever.
            </p>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto space-y-20">

            {/* Two-column split: Employers | Workers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Employers column */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                    <span className="text-xl">🏢</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">For Employers</h2>
                    <p className="text-slate-400 text-sm">Pay a small fee to reach vetted professionals</p>
                  </div>
                </div>

                {/* Job posting tiers */}
                <div className="space-y-3">
                  {employerPostingTiers.map((tier) => (
                    <div
                      key={tier.label}
                      className="rounded-xl bg-slate-900/70 border border-slate-700/50 p-5 hover:border-indigo-500/40 transition-all"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white font-semibold">{tier.label}</span>
                        <span className="text-indigo-400 font-bold text-lg">{tier.price}</span>
                      </div>
                      <p className="text-slate-500 text-xs mb-1">{tier.range}</p>
                      <p className="text-slate-400 text-sm">{tier.description}</p>
                    </div>
                  ))}
                </div>

                {/* Add-ons */}
                <div>
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-indigo-400" />
                    Optional Add-ons
                  </h3>
                  <div className="space-y-3">
                    {employerAddOns.map((addon) => (
                      <div
                        key={addon.label}
                        className="rounded-xl bg-slate-900/50 border border-slate-700/30 p-4 flex items-center justify-between gap-4"
                      >
                        <div>
                          <p className="text-white text-sm font-medium">{addon.label}</p>
                          <p className="text-slate-500 text-xs">{addon.description}</p>
                        </div>
                        <span className="text-indigo-300 font-semibold text-sm whitespace-nowrap">
                          {addon.price}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  href="/auth/register"
                  className="inline-flex items-center justify-center w-full py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors gap-2"
                >
                  Post a Job <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Workers column */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <span className="text-xl">👷</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">For Workers</h2>
                    <p className="text-slate-400 text-sm">Always free to join and find work</p>
                  </div>
                </div>

                {/* Free features */}
                <div className="rounded-2xl bg-emerald-500/5 border border-emerald-500/20 p-6">
                  <p className="text-emerald-400 font-bold text-lg mb-4">Always Free for Workers</p>
                  <ul className="space-y-3">
                    {[
                      'Browsing jobs',
                      'Expressing interest',
                      'Submitting quotes',
                      'Getting paid through the platform',
                      'Building reviews and reputation',
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-3 text-slate-300 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 pt-4 border-t border-emerald-500/20">
                    <p className="text-slate-400 text-sm">
                      <span className="text-white font-medium">Only cost:</span> QuickTrade takes a
                      small commission <span className="text-emerald-400 font-medium">from completed job payments</span> — never upfront.
                    </p>
                  </div>
                </div>

                {/* Commission tiers */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="h-4 w-4 text-indigo-400" />
                    <h3 className="text-white font-semibold">Commission Tiers</h3>
                  </div>
                  <div className="rounded-xl bg-slate-900/70 border border-slate-700/50 overflow-hidden">
                    <div className="grid grid-cols-3 bg-slate-800/50 px-4 py-2 text-xs text-slate-500 font-medium uppercase tracking-wide">
                      <span>Tier</span>
                      <span>Jobs Completed</span>
                      <span className="text-right">Commission</span>
                    </div>
                    {workerCommissionTiers.map((row, i) => (
                      <div
                        key={row.tier}
                        className={`grid grid-cols-3 px-4 py-3 text-sm ${
                          i < workerCommissionTiers.length - 1
                            ? 'border-b border-slate-700/50'
                            : ''
                        }`}
                      >
                        <span className={`font-medium ${row.color}`}>{row.tier}</span>
                        <span className="text-slate-400">{row.range}</span>
                        <span className={`text-right font-bold ${row.color}`}>{row.commission}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-slate-500 text-xs mt-3 flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                    You only pay when you get paid. Your commission rate drops as you grow.
                  </p>
                </div>

                <Link
                  href="/auth/register"
                  className="inline-flex items-center justify-center w-full py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors gap-2"
                >
                  Join Free as a Worker <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* What's included section */}
            <div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">What your commission covers</h2>
                <p className="text-slate-400 text-sm max-w-xl mx-auto">
                  Your small commission on earnings isn&apos;t a cost — it&apos;s a comprehensive protection
                  package included in every completed job.
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {commissionCovers.map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="rounded-xl bg-slate-900/70 border border-slate-700/50 p-5 hover:border-indigo-500/40 hover:shadow-[0_0_20px_rgba(99,102,241,0.1)] transition-all"
                  >
                    <div className="h-10 w-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-3">
                      <Icon className="h-5 w-5 text-indigo-400" />
                    </div>
                    <p className="text-slate-300 text-sm font-medium">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Example calculation */}
            <div className="rounded-2xl bg-slate-900/70 border border-indigo-500/30 p-8">
              <h2 className="text-2xl font-bold text-white mb-2">See how it works</h2>
              <p className="text-slate-400 text-sm mb-8">An example $2,000 bathroom renovation</p>

              <div className="space-y-0 divide-y divide-slate-700/50">
                <div className="flex flex-wrap justify-between items-center py-4">
                  <span className="text-slate-300 font-medium">Job value agreed</span>
                  <span className="text-white font-bold text-lg">$2,000 NZD</span>
                </div>
                <div className="flex flex-wrap justify-between items-center py-4">
                  <div>
                    <span className="text-slate-300 font-medium">Employer posts job</span>
                    <p className="text-slate-500 text-xs mt-0.5">Medium job posting fee</p>
                  </div>
                  <span className="text-indigo-300 font-semibold">$19.99 posting fee</span>
                </div>
                <div className="flex flex-wrap justify-between items-center py-4">
                  <div>
                    <span className="text-emerald-400 font-medium">Worker earns</span>
                    <p className="text-slate-500 text-xs mt-0.5">After 7.5% commission on earnings</p>
                  </div>
                  <span className="text-emerald-400 font-bold text-xl">$1,850 NZD</span>
                </div>
                <div className="flex flex-wrap justify-between items-center py-4">
                  <div>
                    <span className="text-indigo-400 font-medium">QuickTrade earns</span>
                    <p className="text-slate-500 text-xs mt-0.5">Platform commission</p>
                  </div>
                  <span className="text-indigo-400 font-semibold">$150</span>
                </div>
              </div>

              <div className="mt-6 rounded-xl bg-indigo-500/10 border border-indigo-500/20 p-4">
                <p className="text-indigo-200 text-sm font-medium mb-2">You get for that $150:</p>
                <div className="flex flex-wrap gap-2">
                  {['Legal contract', 'Escrow protection', 'QuickTrade Guarantee', 'Verified review'].map(
                    (item) => (
                      <span
                        key={item}
                        className="inline-flex items-center gap-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs px-3 py-1 rounded-full"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        {item}
                      </span>
                    )
                  )}
                </div>
              </div>
              <p className="text-slate-500 text-xs mt-4">
                *Example uses the Established worker tier (8% commission). Commission rate varies by
                tier. Employer posting fee based on the Medium job tier.
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

            {/* CTA section */}
            <div className="rounded-2xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 p-10 text-center">
              <h2 className="text-3xl font-bold text-white mb-3">Ready to get started?</h2>
              <p className="text-slate-400 mb-8 text-lg">
                It&apos;s free for workers — always. Employers pay only when they post.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/auth/register"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-lg transition-colors gap-2"
                >
                  Sign Up Free <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/how-it-works"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-xl border border-slate-600 hover:border-indigo-500/60 text-slate-300 hover:text-white font-semibold text-lg transition-all"
                >
                  How It Works
                </Link>
              </div>
              <p className="text-slate-500 text-sm mt-4">
                No credit card required. Get started in minutes.
              </p>
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
