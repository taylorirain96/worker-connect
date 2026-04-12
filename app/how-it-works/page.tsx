import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/seo/config'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import {
  UserPlus,
  Briefcase,
  Users,
  ShieldCheck,
  Star,
  User,
  BadgeCheck,
  Search,
  FileText,
  DollarSign,
  Shield,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'How QuickTrade Works | Find & Hire Tradespeople in NZ',
  description:
    'Learn how QuickTrade connects homeowners and businesses with verified tradespeople across New Zealand. Post a job, receive quotes, hire with confidence.',
  alternates: { canonical: `${SITE_URL}/how-it-works` },
  openGraph: {
    title: 'How QuickTrade Works | Find & Hire Tradespeople in NZ',
    description:
      'Learn how QuickTrade connects homeowners and businesses with verified tradespeople across New Zealand. Post a job, receive quotes, hire with confidence.',
    url: `${SITE_URL}/how-it-works`,
    type: 'website',
  },
}

const STEPS_EMPLOYER = [
  {
    step: 1,
    title: 'Create an Account',
    description: 'Sign up as an employer in under 2 minutes. No credit card required.',
    icon: UserPlus,
  },
  {
    step: 2,
    title: 'Post Your Job',
    description: 'Describe the work, set your budget, location, and timeline.',
    icon: Briefcase,
  },
  {
    step: 3,
    title: 'Review Applications',
    description: 'Browse worker profiles, ratings, and proposed rates.',
    icon: Users,
  },
  {
    step: 4,
    title: 'Hire with Confidence',
    description: 'Funds held in escrow until work is completed to your satisfaction.',
    icon: ShieldCheck,
  },
  {
    step: 5,
    title: 'Rate & Review',
    description: 'Release payment and leave a review to help the community.',
    icon: Star,
  },
]

const STEPS_WORKER = [
  {
    step: 1,
    title: 'Build Your Profile',
    description: 'Skills, certifications, experience, and portfolio.',
    icon: User,
  },
  {
    step: 2,
    title: 'Get Verified',
    description: 'Earn the trusted badge and stand out from the competition.',
    icon: BadgeCheck,
  },
  {
    step: 3,
    title: 'Browse Jobs',
    description: 'Filter by category, location, budget, and urgency.',
    icon: Search,
  },
  {
    step: 4,
    title: 'Submit Proposals',
    description: 'Apply with a cover letter and your proposed rate.',
    icon: FileText,
  },
  {
    step: 5,
    title: 'Get Paid Securely',
    description: 'Receive payment through our secure escrow system.',
    icon: DollarSign,
  },
]

export default function HowItWorksPage() {
  return (
    <div className="flex flex-col min-h-screen luxury-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'How to hire a tradesperson on QuickTrade',
            description:
              'Step-by-step guide to hiring a verified tradesperson in New Zealand using QuickTrade.',
            step: [
              {
                '@type': 'HowToStep',
                position: 1,
                name: 'Create an Account',
                text: 'Sign up as an employer in under 2 minutes. No credit card required.',
              },
              {
                '@type': 'HowToStep',
                position: 2,
                name: 'Post Your Job',
                text: 'Describe the work, set your budget, location, and timeline.',
              },
              {
                '@type': 'HowToStep',
                position: 3,
                name: 'Review Applications',
                text: 'Browse worker profiles, ratings, and proposed rates.',
              },
              {
                '@type': 'HowToStep',
                position: 4,
                name: 'Hire with Confidence',
                text: 'Funds held in escrow until work is completed to your satisfaction.',
              },
              {
                '@type': 'HowToStep',
                position: 5,
                name: 'Rate & Review',
                text: 'Release payment and leave a review to help the community.',
              },
            ],
          }),
        }}
      />
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section
          className="relative overflow-hidden py-20 px-4"
          style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #111827 60%, #0a0f1e 100%)' }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium mb-6">
              Simple. Secure. Trusted.
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
              How QuickTrade Works
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
              Whether you need work done or looking for work, our platform makes it easy and safe for
              everyone.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-slate-300 text-sm font-medium">
              <span>12,000+ Workers</span>
              <span className="text-slate-600">·</span>
              <span>45,000+ Jobs Completed</span>
              <span className="text-slate-600">·</span>
              <span>4.8★ Avg Rating</span>
            </div>
          </div>
        </section>

        {/* For Employers */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <span className="border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 rounded-full px-4 py-1.5 text-sm font-medium">
                For Employers
              </span>
              <h2 className="text-3xl font-bold text-white mt-4 mb-2">Find the Right Worker</h2>
              <p className="text-slate-400">
                Post a job and hire skilled tradespeople in just a few steps
              </p>
            </div>

            <div className="space-y-4">
              {STEPS_EMPLOYER.map(({ step, title, description, icon: Icon }) => (
                <div
                  key={step}
                  className="flex items-center gap-5 bg-slate-900/70 border border-slate-700/50 rounded-2xl p-5 hover:border-indigo-500/40 hover:shadow-[0_0_24px_rgba(99,102,241,0.15)] transition-all"
                >
                  <div className="h-10 w-10 rounded-full bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 font-bold text-lg flex items-center justify-center flex-shrink-0">
                    {step}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">{title}</h3>
                    <p className="text-slate-400 text-sm">{description}</p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5 text-indigo-400" />
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link
                href="/jobs/create"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-600 hover:to-indigo-700 transition-all"
              >
                Post a Job Today →
              </Link>
            </div>
          </div>
        </section>

        {/* For Workers */}
        <section className="py-16 px-4 bg-slate-800/30">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <span className="border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 rounded-full px-4 py-1.5 text-sm font-medium">
                For Workers
              </span>
              <h2 className="text-3xl font-bold text-white mt-4 mb-2">Start Earning Today</h2>
              <p className="text-slate-400">
                Join thousands of skilled tradespeople already earning on QuickTrade
              </p>
            </div>

            <div className="space-y-4">
              {STEPS_WORKER.map(({ step, title, description, icon: Icon }) => (
                <div
                  key={step}
                  className="flex items-center gap-5 bg-slate-900/70 border border-slate-700/50 rounded-2xl p-5 hover:border-indigo-500/40 hover:shadow-[0_0_24px_rgba(99,102,241,0.15)] transition-all"
                >
                  <div className="h-10 w-10 rounded-full bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 font-bold text-lg flex items-center justify-center flex-shrink-0">
                    {step}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">{title}</h3>
                    <p className="text-slate-400 text-sm">{description}</p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5 text-indigo-400" />
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link
                href="/auth/register?role=worker"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-600 hover:to-indigo-700 transition-all"
              >
                Join as a Worker →
              </Link>
            </div>
          </div>
        </section>

        {/* Trust & Safety */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-white mb-3">Trust &amp; Safety</h2>
              <p className="text-slate-400">Your safety is our top priority</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: <Shield className="h-7 w-7 text-indigo-400" />,
                  title: 'Background Checks',
                  description: 'All workers go through comprehensive background verification.',
                },
                {
                  icon: <BadgeCheck className="h-7 w-7 text-emerald-400" />,
                  title: 'License Verification',
                  description: 'We verify professional licenses and certifications.',
                },
                {
                  icon: <Star className="h-7 w-7 text-indigo-400" />,
                  title: 'Review System',
                  description: 'Transparent ratings and reviews from verified customers.',
                },
              ].map(({ icon, title, description }) => (
                <div
                  key={title}
                  className="text-center p-6 bg-slate-900/70 border border-slate-700/50 rounded-2xl hover:border-indigo-500/40 hover:shadow-[0_0_24px_rgba(99,102,241,0.15)] transition-all"
                >
                  <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 mx-auto">
                    {icon}
                  </div>
                  <h3 className="font-semibold text-white mb-2">{title}</h3>
                  <p className="text-slate-400 text-sm">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="rounded-2xl bg-slate-900/70 border border-indigo-500/30 shadow-[0_0_40px_rgba(99,102,241,0.1)] p-10 text-center">
              <h2 className="text-3xl font-bold text-white mb-3">Ready to get started?</h2>
              <p className="text-slate-400 mb-8">
                Join thousands of employers and workers already using QuickTrade.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/jobs/create"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold text-lg transition-all"
                >
                  Post a Job
                </Link>
                <Link
                  href="/auth/register?role=worker"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-xl border border-slate-600 hover:border-indigo-500/60 text-slate-300 hover:text-white font-semibold text-lg transition-all"
                >
                  Find Work
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
