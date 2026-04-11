import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import {
  Briefcase,
  HardHat,
  Shield,
  CheckCircle,
  Star,
  TrendingUp,
  Zap,
  FileText,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Pricing | QuickTrade NZ',
  description:
    'Simple, fair pricing for workers and employers. Workers are always free — you only pay a small commission when you get paid. Employers pay a tiny fee to post jobs.',
  alternates: {
    canonical: 'https://quicktrade.co.nz/pricing',
  },
}

const EMPLOYER_TIERS = [
  {
    label: 'Small Job',
    value: 'Under $500 NZD',
    fee: '$9.99',
    description: 'Minor repairs, small installations, quick fixes',
  },
  {
    label: 'Medium Job',
    value: '$500–$2,000 NZD',
    fee: '$19.99',
    description: 'Bathroom renos, deck builds, major repairs',
    popular: true,
  },
  {
    label: 'Large Job',
    value: '$2,000–$10,000 NZD',
    fee: '$34.99',
    description: 'Full renovations, large landscaping, new builds',
  },
  {
    label: 'Commercial',
    value: '$10,000+ NZD',
    fee: '$59.99',
    description: 'Commercial fit-outs, major construction projects',
  },
]

const EMPLOYER_INCLUDES = [
  'Access to vetted, reviewed workers',
  'Quote management dashboard',
  'Escrow payment protection',
  'Auto-generated legal contract',
  'Dispute resolution service',
  'QuickTrade Guarantee',
]

const WORKER_COMMISSION_TIERS = [
  { tier: 'New Worker', jobs: '0–5 jobs', commission: '10%', color: 'text-slate-300' },
  { tier: 'Established', jobs: '6–20 jobs', commission: '8%', color: 'text-emerald-300' },
  { tier: 'Pro Worker', jobs: '21–50 jobs', commission: '6%', color: 'text-emerald-400' },
  { tier: 'Elite Worker', jobs: '51+ jobs', commission: '5%', color: 'text-emerald-300' },
]

const COMMISSION_COVERS = [
  { icon: Shield, label: 'Secure escrow payment protection' },
  { icon: FileText, label: 'Auto-generated legal contract (~$200+ from a lawyer)' },
  { icon: Zap, label: 'Dispute resolution service' },
  { icon: Star, label: 'QuickTrade Guarantee' },
  { icon: TrendingUp, label: 'Verified review on your profile (worth future earnings)' },
  { icon: CheckCircle, label: 'Payment insurance' },
]

const ADD_ONS = [
  { feature: 'Featured job listing', who: 'Employer', cost: '+$9.99 per post' },
  { feature: 'Urgent job badge', who: 'Employer', cost: '+$4.99 per post' },
  { feature: 'Worker profile boost', who: 'Worker', cost: '$4.99/week' },
  { feature: 'Premium employer account', who: 'Employer', cost: '$49/month (unlimited posts)' },
]

const FAQS = [
  {
    q: 'Can I get a refund if I don\'t find a worker?',
    a: "Yes. If your job receives no expressions of interest within 14 days, you're entitled to a full refund of your posting fee. Our team will also work with you to relist or adjust the job to attract more responses.",
  },
  {
    q: 'When exactly does QuickTrade take commission?',
    a: "QuickTrade's commission is only deducted when the employer releases payment from escrow after the job is completed. You never pay anything upfront — the commission comes from earnings you've already received.",
  },
  {
    q: 'What is the QuickTrade Guarantee?',
    a: "The QuickTrade Guarantee means that if a job goes wrong and the worker was at fault, QuickTrade will step in to mediate and, where appropriate, facilitate a resolution. It only applies to jobs posted and paid through the platform.",
  },
  {
    q: 'Can I post multiple jobs?',
    a: 'Yes — each job post is priced individually by size, so you only pay for what you post. If you post frequently, our Premium Employer Account ($49/month) gives you unlimited posts and is the best value for regular hirers.',
  },
]

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen luxury-bg">
      <Navbar />

      <main className="flex-1">
        {/* ── Hero ── */}
        <section
          className="relative overflow-hidden py-20 px-4"
          style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #111827 60%, #0a0f1e 100%)' }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium mb-6">
              <Zap className="h-4 w-4" />
              <span>Simple, Fair Pricing</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
              You only pay when{' '}
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                value is delivered
              </span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
              Employers pay a small fee to post a job — tiny compared to the value they receive.
              Workers are always free and only share a small commission from completed earnings.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-slate-300 text-sm font-medium">
              <span className="flex items-center gap-1.5">
                <HardHat className="h-4 w-4 text-emerald-400" /> Workers always free
              </span>
              <span className="text-slate-600">·</span>
              <span className="flex items-center gap-1.5">
                <Briefcase className="h-4 w-4 text-indigo-400" /> Employers pay to post
              </span>
              <span className="text-slate-600">·</span>
              <span className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-indigo-400" /> Protected by escrow
              </span>
            </div>
          </div>
        </section>

        {/* ── Employer Pricing Cards ── */}
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <span className="border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 rounded-full px-4 py-1.5 text-sm font-medium inline-flex items-center gap-2">
                <Briefcase className="h-4 w-4" /> For Employers — Pay to Post
              </span>
              <h2 className="text-3xl font-bold text-white mt-4 mb-2">Post a Job</h2>
              <p className="text-slate-400 max-w-xl mx-auto">
                One small fee to reach hundreds of vetted workers. Tiny compared to what you&apos;re
                about to spend.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              {EMPLOYER_TIERS.map((tier) => (
                <div
                  key={tier.label}
                  className={`relative rounded-2xl p-6 flex flex-col border transition-all hover:shadow-[0_0_24px_rgba(99,102,241,0.2)] ${
                    tier.popular
                      ? 'bg-indigo-900/40 border-indigo-500 shadow-[0_0_24px_rgba(99,102,241,0.15)]'
                      : 'bg-slate-900/70 border-slate-700/50 hover:border-indigo-500/40'
                  }`}
                >
                  {tier.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-bold whitespace-nowrap">
                      Most Popular
                    </span>
                  )}
                  <p className="text-indigo-300 text-sm font-semibold mb-1">{tier.label}</p>
                  <p className="text-slate-400 text-xs mb-4">{tier.value}</p>
                  <p className="text-4xl font-bold text-white mb-1">{tier.fee}</p>
                  <p className="text-slate-500 text-xs mb-4">one-off posting fee</p>
                  <p className="text-slate-400 text-sm flex-1">{tier.description}</p>
                  <Link
                    href="/auth/register"
                    className="mt-6 block text-center py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors"
                  >
                    Post This Job
                  </Link>
                </div>
              ))}
            </div>

            {/* What employers get */}
            <div className="rounded-2xl bg-slate-900/70 border border-slate-700/50 p-6 sm:p-8">
              <h3 className="text-white font-semibold mb-4">Every job post includes:</h3>
              <ul className="grid sm:grid-cols-2 gap-3">
                {EMPLOYER_INCLUDES.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── Worker Section ── */}
        <section className="py-16 px-4 bg-slate-800/30">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <span className="border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 rounded-full px-4 py-1.5 text-sm font-medium inline-flex items-center gap-2">
                <HardHat className="h-4 w-4" /> For Workers — Always Free
              </span>
              <h2 className="text-3xl font-bold text-white mt-4 mb-2">
                Workers are always free
              </h2>
              <p className="text-slate-400 max-w-xl mx-auto">
                Browse jobs, express interest, submit quotes after site visits, and receive
                payment — all free. A small commission comes from your earnings, never your
                pocket.
              </p>
            </div>

            {/* Free features */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
              {[
                { icon: CheckCircle, label: 'Free to browse all jobs' },
                { icon: CheckCircle, label: 'Free to express interest' },
                { icon: CheckCircle, label: 'Free to submit quotes after site visit' },
                { icon: CheckCircle, label: 'Free to receive payment' },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-start gap-3 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20"
                >
                  <Icon className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300 text-sm">{label}</span>
                </div>
              ))}
            </div>

            {/* Commission tier ladder */}
            <div className="rounded-2xl bg-slate-900/70 border border-slate-700/50 p-6 sm:p-8 mb-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                <h3 className="text-white font-bold text-lg">Commission Tier Ladder</h3>
              </div>
              <p className="text-slate-400 text-sm mb-6">
                The more jobs you complete on QuickTrade, the lower your commission. You only pay
                when you get paid.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700/50">
                      <th className="text-left py-3 pr-4 text-slate-400 font-medium">Tier</th>
                      <th className="text-left py-3 pr-4 text-slate-400 font-medium">Jobs Completed</th>
                      <th className="text-right py-3 text-slate-400 font-medium">Commission from earnings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/30">
                    {WORKER_COMMISSION_TIERS.map((row, i) => (
                      <tr key={row.tier} className={i === 0 ? '' : 'opacity-90'}>
                        <td className={`py-3 pr-4 font-semibold ${row.color}`}>{row.tier}</td>
                        <td className="py-3 pr-4 text-slate-400">{row.jobs}</td>
                        <td className={`py-3 text-right font-bold text-xl ${row.color}`}>
                          {row.commission}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-emerald-300 text-sm font-medium text-center">
                  &quot;You only pay when you get paid. The more you earn on QuickTrade, the less
                  commission you pay.&quot;
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── What commission covers ── */}
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-white mb-3">
                What your commission covers
              </h2>
              <p className="text-slate-400 max-w-xl mx-auto">
                You&apos;re not paying commission — you&apos;re getting all of this for a small
                percentage of a job you&apos;ve already completed.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {COMMISSION_COVERS.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-start gap-4 p-5 rounded-2xl bg-slate-900/70 border border-slate-700/50 hover:border-indigo-500/40 hover:shadow-[0_0_24px_rgba(99,102,241,0.1)] transition-all"
                >
                  <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5 text-indigo-400" />
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Optional Add-ons ── */}
        <section className="py-16 px-4 bg-slate-800/30">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <span className="border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 rounded-full px-4 py-1.5 text-sm font-medium">
                Optional Add-ons
              </span>
              <h2 className="text-3xl font-bold text-white mt-4 mb-2">Boost your results</h2>
              <p className="text-slate-400">Never required — the platform works great without them.</p>
            </div>

            <div className="rounded-2xl bg-slate-900/70 border border-slate-700/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700/50 bg-slate-800/50">
                      <th className="text-left py-3 px-6 text-slate-400 font-medium">Feature</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Who</th>
                      <th className="text-right py-3 px-6 text-slate-400 font-medium">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/30">
                    {ADD_ONS.map((row) => (
                      <tr key={row.feature} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-4 px-6 text-slate-300 font-medium">{row.feature}</td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                              row.who === 'Employer'
                                ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                                : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                            }`}
                          >
                            {row.who}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right text-white font-semibold">{row.cost}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-white mb-3">Frequently asked questions</h2>
              <p className="text-slate-400">Everything you need to know about how pricing works.</p>
            </div>

            <div className="space-y-4">
              {FAQS.map(({ q, a }) => (
                <div
                  key={q}
                  className="rounded-xl bg-slate-900/70 border border-slate-700/50 p-6 hover:border-indigo-500/30 transition-all"
                >
                  <h3 className="text-white font-semibold mb-2">{q}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="rounded-2xl bg-slate-900/70 border border-indigo-500/30 shadow-[0_0_40px_rgba(99,102,241,0.1)] p-10 text-center">
              <h2 className="text-3xl font-bold text-white mb-3">Ready to get started?</h2>
              <p className="text-slate-400 mb-8 max-w-lg mx-auto">
                Post your first job and reach hundreds of vetted workers — or find work near you
                with zero upfront cost.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/jobs/create"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold text-lg transition-all"
                >
                  <Briefcase className="h-5 w-5" />
                  Post your first job
                </Link>
                <Link
                  href="/auth/register?role=worker"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-slate-600 hover:border-indigo-500/60 text-slate-300 hover:text-white font-semibold text-lg transition-all"
                >
                  <HardHat className="h-5 w-5" />
                  Find work near you
                </Link>
              </div>
              <p className="text-slate-500 text-sm mt-6">
                No credit card required. Workers join 100% free.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
