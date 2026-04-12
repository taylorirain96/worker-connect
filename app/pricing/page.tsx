'use client'
import { useState } from 'react'
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
  Trophy,
  Users,
  Building2,
} from 'lucide-react'

// ─── Data ─────────────────────────────────────────────────────────────────────

const GIG_TIERS = [
  {
    label: 'Small Job',
    value: 'Under $500 NZD',
    fee: '$14.99',
    description: 'Minor repairs, small installations, quick fixes',
  },
  {
    label: 'Medium Job',
    value: '$500–$2,000 NZD',
    fee: '$29.99',
    description: 'Bathroom renos, deck builds, major repairs',
    popular: true,
  },
  {
    label: 'Large Job',
    value: '$2,000–$10,000 NZD',
    fee: '$54.99',
    description: 'Full renovations, large landscaping, new builds',
  },
  {
    label: 'Commercial',
    value: '$10,000+ NZD',
    fee: '$89.99',
    description: 'Commercial fit-outs, major construction projects',
  },
]

const GIG_INCLUDES = [
  'Access to vetted, reviewed workers',
  'Quote management dashboard',
  'Escrow payment protection',
  'Auto-generated legal contract',
  'Dispute resolution service',
  'QuickTrade Guarantee',
]

interface EmployerSubscriptionPlan {
  id: string
  name: string
  monthlyPrice: number
  yearlyPrice: number
  popular?: boolean
  features: string[]
  cta: string
}

const EMPLOYER_SUBSCRIPTION_PLANS: EmployerSubscriptionPlan[] = [
  {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 79,
    yearlyPrice: 63,
    features: [
      'Unlimited job postings',
      '2 featured listings/month',
      'Analytics dashboard',
      'Verified employer badge',
      'Priority applicant matching',
      'Chat support',
    ],
    cta: 'Get Pro',
  },
  {
    id: 'business',
    name: 'Business',
    monthlyPrice: 159,
    yearlyPrice: 127,
    popular: true,
    features: [
      'Everything in Pro',
      '3 team seats',
      'Bulk job posting tools',
      'Contract templates library',
      'Advanced analytics & ROI reports',
      'Dedicated account manager',
    ],
    cta: 'Get Business',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      'Everything in Business',
      'API access & custom integrations',
      'White-label option',
      'Unlimited team seats',
      'Custom SLA',
      'Priority onboarding',
    ],
    cta: 'Contact Us',
  },
]

const RECRUITMENT_OPTIONS = [
  { role: 'Casual / Part-time', postingFee: '$79', successFee: '$479', successLabel: 'if hired' },
  { role: 'Full-time Trade', postingFee: '$79', successFee: '$1,279', successLabel: 'if hired' },
  { role: 'Full-time Professional', postingFee: '$79', successFee: '$1,919', successLabel: 'if hired' },
  { role: 'Contract Role', postingFee: '$79', successFee: '$959', successLabel: 'if hired' },
]

const WORKER_COMMISSION_TIERS = [
  { tier: 'New Worker', jobs: '0–5 jobs', commission: '10%', color: 'text-slate-300' },
  { tier: 'Established', jobs: '6–20 jobs', commission: '8%', color: 'text-emerald-300' },
  { tier: 'Pro Worker', jobs: '21–50 jobs', commission: '6%', color: 'text-emerald-400' },
  { tier: 'Elite Worker', jobs: '51+ jobs', commission: '5%', color: 'text-emerald-300' },
]

interface WorkerPlan {
  name: string
  monthlyPrice: number
  yearlyPrice: number
  features: string[]
  highlight?: boolean
}

const WORKER_PRO_PLANS: WorkerPlan[] = [
  {
    name: 'Free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      'Standard commission rates (10% → 5%)',
      'Browse & apply to all jobs',
      'Receive reviews & ratings',
    ],
  },
  {
    name: 'Pro Worker',
    monthlyPrice: 29,
    yearlyPrice: 24,
    highlight: true,
    features: [
      'Flat 4% commission on every job',
      'Profile boost included',
      'Early job alerts (30 min head start)',
      'Commission savings pay for themselves after just 2 jobs/month',
    ],
  },
  {
    name: 'Elite Worker',
    monthlyPrice: 59,
    yearlyPrice: 49,
    features: [
      'Flat 3% commission on every job',
      'Featured profile placement',
      'Priority notifications',
      'Verified badge included',
    ],
  },
]

const COMMISSION_COVERS = [
  { icon: Shield, label: 'Secure escrow payment protection' },
  { icon: FileText, label: 'Auto-generated legal contract (~$200+ from a lawyer)' },
  { icon: Zap, label: 'Dispute resolution service' },
  { icon: Star, label: 'QuickTrade Guarantee' },
  { icon: TrendingUp, label: 'Verified review on your profile (worth future earnings)' },
  { icon: CheckCircle, label: 'Payment insurance' },
]

const EMPLOYER_ADDONS = [
  { feature: 'Featured listing', price: '+$14.99/post' },
  { feature: 'Urgent badge 🔴', price: '+$7.99/post' },
  { feature: 'Top Worker Match (hand-picked)', price: '+$24.99/post' },
  { feature: 'Private job post', price: '+$20.99/post' },
  { feature: 'Re-post expired job', price: '+$7.99' },
  { feature: 'Contract upgrade (lawyer-reviewed)', price: '+$32.99' },
]

const WORKER_ADDONS = [
  { feature: 'Profile boost', price: '$7.99/week' },
  { feature: 'Verified ID badge ✅', price: '$15.99 one-off' },
  { feature: 'Portfolio showcase (unlimited photos)', price: '$12.99/mo' },
  { feature: 'Early job alerts (30 min head start)', price: '$15.99/mo' },
  { feature: 'Skill certification badge', price: '$24.99 one-off' },
]

const LEADERBOARD_PRIZES = [
  { rank: '🥇 #1 Worker of the Month', prize: '$25 credit' },
  { rank: '🥈 #2', prize: '$15 credit' },
  { rank: '🥉 #3', prize: '$10 credit' },
]

const ACHIEVEMENT_BADGES = [
  { badge: '💎 High Value', how: 'Complete a $5,000+ job', reward: '$5 credit' },
  { badge: '🔄 Consistent', how: '1 job every 30 days for 3 months', reward: '$5 credit' },
  { badge: '⭐ Trusted', how: '5 jobs all rated 4.5+ stars', reward: '$5 credit + free verified badge' },
  { badge: '💰 Big Earner', how: 'Earn $5,000 in a month', reward: 'Drop to 4% commission that month' },
  { badge: '🎯 10 Jobs', how: 'Complete 10 jobs', reward: '$5 credit' },
  { badge: '💼 50 Jobs', how: 'Complete 50 jobs', reward: '$20 credit' },
  { badge: '🔥 Loyal', how: '30 day login streak', reward: '$3 credit' },
  { badge: '✅ Placed', how: 'Successfully hired through QuickTrade', reward: '"Placed by QuickTrade" badge' },
]

const FAQS = [
  {
    q: "Can I get a refund if I don't find a worker?",
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
    a: 'Yes — each job post is priced individually by size, so you only pay for what you post. If you post frequently, our Pro Employer plan ($79/month) gives you unlimited posts and is the best value for regular hirers.',
  },
  {
    q: "What is the recruitment success fee?",
    a: "The success fee is only charged when a worker is actually hired through your recruitment posting. You pay the flat $79 listing fee upfront, and the success fee only applies if the placement is made. No hire = no success fee.",
  },
  {
    q: 'How does the 30-day hire guarantee work?',
    a: "If your hired worker leaves or doesn't work out within the first 30 days, we'll re-list your job for free. It's our way of making sure you actually get the right person, not just any person.",
  },
  {
    q: 'Can I earn credits through achievements?',
    a: "Yes! Workers earn credits by completing jobs, achieving milestones, and maintaining streaks. Credits can only be spent on QuickTrade platform features like profile boosts and add-ons — they can't be withdrawn as cash.",
  },
  {
    q: "What's the difference between gig work and recruitment pricing?",
    a: "Gig work is one-off jobs completed through the platform — you pay a posting fee and the worker pays a small commission from their earnings. Recruitment is for hiring someone full-time or long-term — you pay a flat posting fee plus a success fee only if you hire someone.",
  },
]

// ─── Component ─────────────────────────────────────────────────────────────────

export default function PricingPage() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')

  const yearlyMonthlySavingPct = 20

  function displayPrice(plan: { monthlyPrice: number; yearlyPrice: number }): string {
    if (plan.monthlyPrice === 0) return 'Custom'
    return billing === 'monthly' ? `$${plan.monthlyPrice}` : `$${plan.yearlyPrice}`
  }

  function yearlySaving(plan: { monthlyPrice: number; yearlyPrice: number }): number {
    return (plan.monthlyPrice - plan.yearlyPrice) * 12
  }

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
              Multiple revenue tracks — gig work, recruitment, subscriptions, add-ons — built so
              everyone pays fairly for exactly what they get.
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

        {/* ── Monthly / Yearly Toggle ── */}
        <section className="py-8 px-4 sticky top-0 z-10 bg-slate-900/95 backdrop-blur border-b border-slate-700/50">
          <div className="max-w-5xl mx-auto flex items-center justify-center gap-4">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                billing === 'monthly'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling('yearly')}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
                billing === 'yearly'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Yearly
              <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                Save {yearlyMonthlySavingPct}%
              </span>
            </button>
          </div>
        </section>

        {/* ── Section 1: Gig Work Pricing ── */}
        <section className="py-16 px-4" id="gig">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <span className="border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 rounded-full px-4 py-1.5 text-sm font-medium inline-flex items-center gap-2">
                <Briefcase className="h-4 w-4" /> Gig Work — One-off Jobs
              </span>
              <h2 className="text-3xl font-bold text-white mt-4 mb-2">Post a Gig Job</h2>
              <p className="text-slate-400 max-w-xl mx-auto">
                Need something done? One small fee to reach hundreds of vetted workers.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              {GIG_TIERS.map((tier) => (
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

            <div className="rounded-2xl bg-slate-900/70 border border-slate-700/50 p-6 sm:p-8">
              <h3 className="text-white font-semibold mb-4">Every gig post includes:</h3>
              <ul className="grid sm:grid-cols-2 gap-3">
                {GIG_INCLUDES.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── Section 2: Employer Subscriptions ── */}
        <section className="py-16 px-4 bg-slate-800/30" id="subscriptions">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <span className="border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 rounded-full px-4 py-1.5 text-sm font-medium inline-flex items-center gap-2">
                <Building2 className="h-4 w-4" /> Employer Subscriptions
              </span>
              <h2 className="text-3xl font-bold text-white mt-4 mb-2">For Regular Hirers</h2>
              <p className="text-slate-400 max-w-xl mx-auto">
                Post as often as you need. Subscription plans are optional — they make sense once you&apos;re hiring regularly.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {EMPLOYER_SUBSCRIPTION_PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl p-6 flex flex-col border transition-all ${
                    plan.popular
                      ? 'bg-indigo-900/40 border-indigo-500 shadow-[0_0_24px_rgba(99,102,241,0.2)]'
                      : 'bg-slate-900/70 border-slate-700/50 hover:border-indigo-500/40'
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-bold whitespace-nowrap">
                      Most Popular
                    </span>
                  )}
                  <p className="text-indigo-300 text-sm font-semibold mb-2">{plan.name}</p>
                  {plan.monthlyPrice === 0 ? (
                    <p className="text-4xl font-bold text-white mb-1">Custom</p>
                  ) : (
                    <>
                      <p className="text-4xl font-bold text-white mb-1">{displayPrice(plan)}</p>
                      <p className="text-slate-500 text-xs mb-1">/month{billing === 'yearly' ? ', billed yearly' : ''}</p>
                      {billing === 'yearly' && (
                        <p className="text-emerald-400 text-xs font-semibold mb-3">
                          Save ${yearlySaving(plan)}/year
                        </p>
                      )}
                    </>
                  )}
                  <ul className="space-y-2 mt-4 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                        <CheckCircle className="h-4 w-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={plan.id === 'enterprise' ? '/contact' : '/auth/register'}
                    className={`mt-6 block text-center py-2.5 px-4 rounded-xl text-sm font-semibold transition-colors ${
                      plan.popular
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        : 'border border-slate-600 hover:border-indigo-500/60 text-slate-300 hover:text-white'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Section 3: Recruitment Track ── */}
        <section className="py-16 px-4" id="recruitment">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <span className="border border-violet-500/30 bg-violet-500/10 text-violet-300 rounded-full px-4 py-1.5 text-sm font-medium inline-flex items-center gap-2">
                <Users className="h-4 w-4" /> Recruitment Track — Hire Someone Full-time
              </span>
              <h2 className="text-3xl font-bold text-white mt-4 mb-2">Recruit at a Fraction of Agency Cost</h2>
              <p className="text-slate-400 max-w-xl mx-auto">
                Post your role for a flat fee. Only pay a success fee if you actually hire someone.
              </p>
            </div>

            {/* Savings comparison */}
            <div className="rounded-2xl bg-gradient-to-r from-violet-900/40 to-indigo-900/40 border border-violet-500/30 p-6 sm:p-8 mb-10">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-slate-400 text-xs mb-1">Traditional Recruiter</p>
                  <p className="text-2xl font-bold text-white line-through opacity-60">$9,600</p>
                  <p className="text-slate-500 text-xs">avg fee (NZ)</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs mb-1">QuickTrade</p>
                  <p className="text-2xl font-bold text-emerald-400">$1,279</p>
                  <p className="text-slate-500 text-xs">full-time trade hire</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs mb-1">You Save</p>
                  <p className="text-2xl font-bold text-violet-300">$8,321</p>
                  <p className="text-slate-500 text-xs">on average</p>
                </div>
              </div>
            </div>

            {/* Recruitment table */}
            <div className="rounded-2xl bg-slate-900/70 border border-slate-700/50 overflow-hidden mb-8">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700/50 bg-slate-800/50">
                      <th className="text-left py-3 px-6 text-slate-400 font-medium">Role Type</th>
                      <th className="text-center py-3 px-4 text-slate-400 font-medium">Posting Fee</th>
                      <th className="text-right py-3 px-6 text-slate-400 font-medium">Success Fee</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/30">
                    {RECRUITMENT_OPTIONS.map((row) => (
                      <tr key={row.role} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-4 px-6 text-slate-300 font-medium">{row.role}</td>
                        <td className="py-4 px-4 text-center">
                          <span className="text-slate-400">{row.postingFee}</span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className="text-white font-bold">{row.successFee}</span>
                          <span className="text-slate-500 text-xs ml-1">{row.successLabel}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Guarantee badge */}
            <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-5 flex items-start gap-4">
              <Shield className="h-8 w-8 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-semibold mb-1">30-Day Hire Guarantee</p>
                <p className="text-slate-400 text-sm">
                  If your hire doesn&apos;t work out within 30 days, we&apos;ll re-list your job for free. You only pay the success fee if the hire sticks.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 4: Worker Tiers ── */}
        <section className="py-16 px-4 bg-slate-800/30" id="workers">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <span className="border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 rounded-full px-4 py-1.5 text-sm font-medium inline-flex items-center gap-2">
                <HardHat className="h-4 w-4" /> For Workers — Always Free to Start
              </span>
              <h2 className="text-3xl font-bold text-white mt-4 mb-2">Workers are always free</h2>
              <p className="text-slate-400 max-w-xl mx-auto">
                Browse, apply, and get paid — completely free. Upgrade only when it makes financial sense for you.
              </p>
            </div>

            {/* Commission ladder */}
            <div className="rounded-2xl bg-slate-900/70 border border-slate-700/50 p-6 sm:p-8 mb-10">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                <h3 className="text-white font-bold text-lg">Commission Tier Ladder</h3>
              </div>
              <p className="text-slate-400 text-sm mb-6">
                The more jobs you complete, the lower your commission. You only pay when you get paid.
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
                        <td className={`py-3 text-right font-bold text-xl ${row.color}`}>{row.commission}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-emerald-300 text-sm font-medium text-center">
                  &quot;You only pay when you get paid. The more you earn on QuickTrade, the less commission you pay.&quot;
                </p>
              </div>
            </div>

            {/* Worker Pro Plans */}
            <h3 className="text-xl font-bold text-white mb-6 text-center">Optional: Worker Pro Subscription</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {WORKER_PRO_PLANS.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative rounded-2xl p-6 flex flex-col border transition-all ${
                    plan.highlight
                      ? 'bg-emerald-900/30 border-emerald-500 shadow-[0_0_24px_rgba(16,185,129,0.15)]'
                      : 'bg-slate-900/70 border-slate-700/50 hover:border-emerald-500/40'
                  }`}
                >
                  {plan.highlight && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold whitespace-nowrap">
                      Best Value
                    </span>
                  )}
                  <p className="text-emerald-300 text-sm font-semibold mb-2">{plan.name}</p>
                  {plan.monthlyPrice === 0 ? (
                    <p className="text-4xl font-bold text-white mb-1">Free</p>
                  ) : (
                    <>
                      <p className="text-4xl font-bold text-white mb-1">
                        ${billing === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
                      </p>
                      <p className="text-slate-500 text-xs mb-1">/month{billing === 'yearly' ? ', billed yearly' : ''}</p>
                      {billing === 'yearly' && (
                        <p className="text-emerald-400 text-xs font-semibold mb-3">
                          Save ${(plan.monthlyPrice - plan.yearlyPrice) * 12}/year
                        </p>
                      )}
                    </>
                  )}
                  <ul className="space-y-2 mt-4 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                        <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/auth/register?role=worker"
                    className={`mt-6 block text-center py-2.5 px-4 rounded-xl text-sm font-semibold transition-colors ${
                      plan.highlight
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'border border-slate-600 hover:border-emerald-500/60 text-slate-300 hover:text-white'
                    }`}
                  >
                    {plan.monthlyPrice === 0 ? 'Get Started Free' : 'Upgrade'}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── What commission covers ── */}
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-white mb-3">What your commission covers</h2>
              <p className="text-slate-400 max-w-xl mx-auto">
                You&apos;re not paying commission — you&apos;re getting all of this for a small percentage of a job you&apos;ve already completed.
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

        {/* ── Section 5: Add-ons ── */}
        <section className="py-16 px-4 bg-slate-800/30" id="addons">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <span className="border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 rounded-full px-4 py-1.5 text-sm font-medium">
                Optional Add-ons
              </span>
              <h2 className="text-3xl font-bold text-white mt-4 mb-2">Boost your results</h2>
              <p className="text-slate-400">Never required — the platform works great without them. Add-ons are for convenience only and never affect leaderboard rankings.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Employer add-ons */}
              <div className="rounded-2xl bg-slate-900/70 border border-slate-700/50 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/50">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-indigo-400" /> For Employers
                  </h3>
                </div>
                <div className="divide-y divide-slate-700/30">
                  {EMPLOYER_ADDONS.map((row) => (
                    <div key={row.feature} className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-800/30 transition-colors">
                      <span className="text-slate-300 text-sm">{row.feature}</span>
                      <span className="text-white font-semibold text-sm">{row.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Worker add-ons */}
              <div className="rounded-2xl bg-slate-900/70 border border-slate-700/50 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/50">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <HardHat className="h-4 w-4 text-emerald-400" /> For Workers
                  </h3>
                </div>
                <div className="divide-y divide-slate-700/30">
                  {WORKER_ADDONS.map((row) => (
                    <div key={row.feature} className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-800/30 transition-colors">
                      <span className="text-slate-300 text-sm">{row.feature}</span>
                      <span className="text-white font-semibold text-sm">{row.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 6: Rewards & Badges ── */}
        <section className="py-16 px-4" id="rewards">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <span className="border border-yellow-500/30 bg-yellow-500/10 text-yellow-300 rounded-full px-4 py-1.5 text-sm font-medium inline-flex items-center gap-2">
                <Trophy className="h-4 w-4" /> Rewards & Badges
              </span>
              <h2 className="text-3xl font-bold text-white mt-4 mb-2">Earn while you work</h2>
              <p className="text-slate-400 max-w-xl mx-auto">
                Complete jobs, hit milestones, and earn credits to spend on platform features. Leaderboard rankings are 100% merit-based and cannot be purchased.
              </p>
            </div>

            {/* Leaderboard prizes */}
            <div className="rounded-2xl bg-gradient-to-r from-yellow-900/30 to-amber-900/30 border border-yellow-500/20 p-6 mb-8">
              <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-400" /> Monthly Leaderboard Prizes
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {LEADERBOARD_PRIZES.map((prize) => (
                  <div key={prize.rank} className="text-center">
                    <p className="text-xl font-bold text-white">{prize.rank}</p>
                    <p className="text-yellow-300 font-semibold mt-1">{prize.prize}</p>
                  </div>
                ))}
              </div>
              <p className="text-slate-500 text-xs mt-4 text-center">
                Leaderboard rankings are 100% merit-based and cannot be purchased
              </p>
            </div>

            {/* Achievement badges */}
            <h3 className="text-white font-bold text-lg mb-4">Achievement Badges</h3>
            <div className="rounded-2xl bg-slate-900/70 border border-slate-700/50 overflow-hidden mb-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700/50 bg-slate-800/50">
                      <th className="text-left py-3 px-6 text-slate-400 font-medium">Badge</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">How to Earn</th>
                      <th className="text-right py-3 px-6 text-slate-400 font-medium">Reward</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/30">
                    {ACHIEVEMENT_BADGES.map((row) => (
                      <tr key={row.badge} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 px-6 text-white font-medium">{row.badge}</td>
                        <td className="py-3.5 px-4 text-slate-400">{row.how}</td>
                        <td className="py-3.5 px-6 text-right text-emerald-400 font-semibold">{row.reward}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <p className="text-slate-500 text-xs text-center">
              Credits can only be spent on QuickTrade platform features
            </p>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-16 px-4 bg-slate-800/30">
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
                Post your first job and reach hundreds of vetted workers — or find work near you with zero upfront cost.
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
