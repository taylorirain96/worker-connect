import type { Metadata } from 'next'
import Link from 'next/link'
import {
  DollarSign,
  Shield,
  CheckCircle,
  Star,
  Zap,
  TrendingUp,
  Lock,
  Users,
  Briefcase,
} from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Pricing | QuickTrade NZ',
  description:
    'Simple, honest pricing for QuickTrade. Workers are always free — no upfront costs, ever. Employers pay small job posting fees. You only pay when you get paid.',
  alternates: {
    canonical: 'https://quicktrade.co.nz/pricing',
  },
}

const employerTiers = [
  {
    size: 'Small Job',
    value: 'Under $500 NZD',
    fee: '$9.99',
    description: 'Quick fixes, small repairs, minor tasks',
  },
  {
    size: 'Medium Job',
    value: '$500–$2,000 NZD',
    fee: '$19.99',
    description: 'Bathroom renovations, deck builds, major installs',
  },
  {
    size: 'Large Job',
    value: '$2,000–$10,000 NZD',
    fee: '$34.99',
    description: 'Full kitchen renos, roofing, large landscaping',
  },
  {
    size: 'Commercial / Major',
    value: '$10,000+ NZD',
    fee: '$59.99',
    description: 'Commercial builds, multi-trade projects',
  },
]

const employerUpsells = [
  {
    icon: Star,
    label: 'Featured Job Listing',
    price: '+$9.99',
    description: 'Appear at the top of search results — get seen first',
  },
  {
    icon: Zap,
    label: 'Urgent Job Badge',
    price: '+$4.99',
    description: 'Shown as urgent to workers — ideal for same-day jobs',
  },
  {
    icon: Briefcase,
    label: 'Premium Employer Account',
    price: '$49/month',
    description: 'Unlimited job postings — ideal for businesses that hire regularly',
  },
]

const workerFreeItems = [
  { label: 'Browse and find jobs' },
  { label: 'Express interest / apply' },
  { label: 'Submit quotes after site visit' },
  { label: 'Messaging with employers' },
  { label: 'Building profile and reviews' },
  { label: 'QuickTrade Guarantee coverage (included in commission)' },
]

const commissionTiers = [
  { level: 'New Worker', jobs: '0–5 jobs', commission: '10%', color: 'text-slate-300' },
  { level: 'Established Worker', jobs: '6–20 jobs', commission: '8%', color: 'text-indigo-300' },
  { level: 'Pro Worker', jobs: '21–50 jobs', commission: '6%', color: 'text-violet-300' },
  { level: 'Elite Worker', jobs: '50+ jobs', commission: '5%', color: 'text-emerald-300' },
]

const commissionIncludes = [
  {
    icon: Shield,
    label: 'Secure escrow payment protection',
    description: 'Your money is held safely until the job is complete',
  },
  {
    icon: Lock,
    label: 'Auto-generated legal contract',
    description: 'Worth ~$200 from a lawyer — generated automatically for every job',
  },
  {
    icon: Users,
    label: 'Dispute resolution service',
    description: 'Our team steps in if anything goes wrong',
  },
  {
    icon: CheckCircle,
    label: 'QuickTrade Guarantee',
    description: 'Payment and job protection backed by the platform',
  },
  {
    icon: TrendingUp,
    label: 'Verified review on your profile',
    description: 'Build your reputation and earn more over time',
  },
]

const faqs = [
  {
    q: 'Why do employers pay to post a job?',
    a: "Employers are already spending hundreds or thousands on a job. A small posting fee — tiny compared to the job value — ensures only serious employers use the platform. It also means workers never pay a cent to find work, keeping QuickTrade fair for the people who need it most.",
  },
  {
    q: 'Are workers really always free?',
    a: 'Yes — 100%. Browsing jobs, applying, submitting quotes, messaging employers, and building your profile are all completely free. You only pay a small commission after you get paid for a completed job. No upfront costs, ever.',
  },
  {
    q: 'When does the commission get taken?',
    a: "Commission is deducted automatically from your payout when a job payment is released through QuickTrade's escrow system. You never pay out of your own pocket — the commission comes from the job payment you've already earned.",
  },
  {
    q: "What happens if there's a dispute?",
    a: "QuickTrade's dispute resolution service is included in the commission. If something goes wrong — a job isn't completed to standard or a payment is withheld — our team will step in to mediate and, where appropriate, issue a refund.",
  },
  {
    q: 'Can I cancel a posted job?',
    a: 'Yes. You can cancel a job posting before any workers are engaged. Posting fees are non-refundable once the listing goes live, but if no workers have expressed interest within 30 days you may be eligible for a credit.',
  },
  {
    q: 'How do I move to a lower commission tier?',
    a: "Your commission rate automatically reduces as you complete more jobs through QuickTrade. Complete 6 jobs and you drop to 8%, then 6% at 21 jobs, and 5% at 50+ jobs. Your fee reduces as you grow — it's our way of rewarding loyalty.",
  },
  {
    q: 'Is there a subscription option for employers?',
    a: "Yes! The Premium Employer Account at $49/month gives you unlimited job postings — perfect for businesses that hire regularly. At just $49/month you can post as many jobs as you need without paying per-listing fees.",
  },
]

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen luxury-bg">
      <Navbar />

      <main className="flex-1">
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section
          className="relative overflow-hidden py-24 px-4"
          style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #111827 60%, #0a0f1e 100%)' }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium mb-6">
              <DollarSign className="h-4 w-4" />
              <span>Transparent Pricing</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-5 tracking-tight">
              Simple,{' '}
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                Honest Pricing
              </span>
            </h1>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-4">
              Workers are always free — no upfront costs, ever.
              Employers pay a small fee relative to the job value.
            </p>
            <p className="text-slate-400 max-w-xl mx-auto text-base">
              Nobody pays unless they&apos;re already winning. That&apos;s the QuickTrade promise.
            </p>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 py-16 space-y-20">

          {/* ── Two-column overview ──────────────────────────────────────── */}
          <section aria-labelledby="overview-heading">
            <h2 id="overview-heading" className="sr-only">Pricing overview</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* Employers column */}
              <div className="rounded-2xl bg-slate-900/70 border border-indigo-500/40 p-8 flex flex-col">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-xl bg-indigo-600/20 flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-indigo-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">For Employers</h2>
                </div>
                <p className="text-slate-400 text-sm mb-6">
                  Pay a small posting fee based on job size. Post your job in minutes.
                </p>
                <div className="space-y-3">
                  {employerTiers.map((tier) => (
                    <div
                      key={tier.size}
                      className="flex items-center justify-between rounded-xl bg-slate-800/60 border border-slate-700/50 px-4 py-3 gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-white font-semibold text-sm">{tier.size}</p>
                        <p className="text-slate-400 text-xs">{tier.value}</p>
                      </div>
                      <span className="shrink-0 px-3 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 font-bold text-sm border border-indigo-500/30">
                        {tier.fee}
                      </span>
                    </div>
                  ))}
                </div>
                <Link
                  href="/jobs/create"
                  className="mt-8 block w-full text-center py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors"
                >
                  Post a Job
                </Link>
              </div>

              {/* Workers column */}
              <div className="rounded-2xl bg-slate-900/70 border border-emerald-500/40 p-8 flex flex-col">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-xl bg-emerald-600/20 flex items-center justify-center">
                    <Users className="h-5 w-5 text-emerald-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">For Workers</h2>
                </div>
                <p className="text-slate-400 text-sm mb-6">
                  Always free to use. You only pay when you get paid.
                </p>
                <div className="space-y-3">
                  {workerFreeItems.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-xl bg-slate-800/60 border border-slate-700/50 px-4 py-3 gap-3"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                        <p className="text-slate-300 text-sm">{item.label}</p>
                      </div>
                      <span className="shrink-0 px-3 py-1 rounded-lg bg-emerald-600/20 text-emerald-300 font-bold text-xs border border-emerald-500/30 uppercase tracking-wide">
                        FREE
                      </span>
                    </div>
                  ))}
                </div>
                <Link
                  href="/jobs"
                  className="mt-8 block w-full text-center py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors"
                >
                  Find Work
                </Link>
              </div>
            </div>
          </section>

          {/* ── Commission tier table ────────────────────────────────────── */}
          <section aria-labelledby="commission-heading">
            <div className="text-center mb-10">
              <h2 id="commission-heading" className="text-3xl font-bold text-white mb-3">
                Your fee reduces as you grow
              </h2>
              <p className="text-slate-400 max-w-xl mx-auto">
                QuickTrade&apos;s commission is taken from completed job payments — never from your own pocket.
                The more jobs you complete, the less you pay.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-900/70 border border-slate-700/50 overflow-hidden">
              <div className="grid grid-cols-3 text-xs text-slate-500 uppercase tracking-wide px-6 py-3 border-b border-slate-700/50">
                <span>Worker level</span>
                <span className="text-center">Jobs completed</span>
                <span className="text-right">Commission</span>
              </div>
              {commissionTiers.map((tier, i) => (
                <div
                  key={tier.level}
                  className={`grid grid-cols-3 items-center px-6 py-4 ${
                    i < commissionTiers.length - 1 ? 'border-b border-slate-700/50' : ''
                  }`}
                >
                  <div>
                    <p className={`font-semibold ${tier.color}`}>{tier.level}</p>
                  </div>
                  <div className="text-center">
                    <span className="text-slate-400 text-sm">{tier.jobs}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-lg font-bold ${tier.color}`}>{tier.commission}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-xl bg-emerald-900/20 border border-emerald-500/30 p-5 text-center">
              <p className="text-emerald-300 font-medium text-sm">
                💚 &quot;You only pay when you get paid. QuickTrade&apos;s commission is taken from completed job payments — never from your own pocket.&quot;
              </p>
            </div>
          </section>

          {/* ── What's included in commission ───────────────────────────── */}
          <section aria-labelledby="commission-includes-heading">
            <div className="text-center mb-10">
              <h2 id="commission-includes-heading" className="text-3xl font-bold text-white mb-3">
                What&apos;s included in the commission
              </h2>
              <p className="text-slate-400 max-w-xl mx-auto">
                QuickTrade&apos;s commission covers your payment protection, legal contract, and dispute resolution.
                You&apos;re not paying a fee — you&apos;re getting all of this.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {commissionIncludes.map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl bg-slate-900/70 border border-slate-700/50 p-5 flex gap-4"
                >
                  <div className="h-10 w-10 rounded-xl bg-indigo-600/20 flex items-center justify-center shrink-0">
                    <item.icon className="h-5 w-5 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm mb-1">{item.label}</p>
                    <p className="text-slate-400 text-xs leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Employer upsells ─────────────────────────────────────────── */}
          <section aria-labelledby="upsells-heading">
            <div className="text-center mb-10">
              <h2 id="upsells-heading" className="text-3xl font-bold text-white mb-3">
                Optional add-ons for employers
              </h2>
              <p className="text-slate-400 max-w-xl mx-auto">
                All optional — the platform works perfectly without them. Boost your listing when you need results fast.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {employerUpsells.map((upsell) => (
                <div
                  key={upsell.label}
                  className="rounded-2xl bg-slate-900/70 border border-slate-700/50 p-6 flex flex-col gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-indigo-600/20 flex items-center justify-center">
                      <upsell.icon className="h-5 w-5 text-indigo-400" />
                    </div>
                    <p className="text-white font-semibold">{upsell.label}</p>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed flex-1">{upsell.description}</p>
                  <span className="self-start px-4 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 font-bold text-sm border border-indigo-500/30">
                    {upsell.price}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* ── FAQ ─────────────────────────────────────────────────────── */}
          <section aria-labelledby="faq-heading">
            <div className="text-center mb-10">
              <h2 id="faq-heading" className="text-3xl font-bold text-white mb-3">
                Frequently asked questions
              </h2>
            </div>
            <div className="space-y-4 max-w-3xl mx-auto">
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
          </section>

          {/* ── CTA ─────────────────────────────────────────────────────── */}
          <section
            aria-labelledby="cta-heading"
            className="rounded-2xl bg-gradient-to-r from-indigo-900/50 to-violet-900/50 border border-indigo-500/30 p-10 text-center"
          >
            <h2 id="cta-heading" className="text-3xl font-bold text-white mb-3">
              Ready to get started?
            </h2>
            <p className="text-slate-400 max-w-lg mx-auto mb-8">
              Post your job in minutes, or find work today — no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/jobs/create"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base transition-colors"
              >
                <Briefcase className="h-5 w-5" />
                Post a Job
              </Link>
              <Link
                href="/jobs"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base transition-colors"
              >
                <TrendingUp className="h-5 w-5" />
                Find Work
              </Link>
            </div>
            <p className="text-slate-500 text-sm mt-6">
              Workers are always free — no upfront costs, ever.
            </p>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  )
}
