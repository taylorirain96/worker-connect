import type { Metadata } from 'next'
import Link from 'next/link'
import Script from 'next/script'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import JobsBrowser from '@/components/jobs/JobsBrowser'
import { SITE_URL } from '@/lib/seo/config'
import { Shield, CheckCircle, Clock, MapPin, Star, Briefcase } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Browse Trade Jobs in New Zealand | QuickTrade',
  description:
    'Find trade and home service jobs across New Zealand. Browse plumbing, electrical, building, painting, landscaping, and more. Apply free and get paid securely through escrow.',
  alternates: { canonical: `${SITE_URL}/jobs` },
  openGraph: {
    title: 'Browse Trade Jobs in New Zealand | QuickTrade',
    description:
      'Find trade and home service jobs across New Zealand. Apply free and get paid securely through escrow.',
    url: `${SITE_URL}/jobs`,
    type: 'website',
  },
}

const JOB_CATEGORIES = [
  { label: 'Plumbing Jobs', href: '/jobs?category=plumbing', icon: '🔧' },
  { label: 'Electrical Jobs', href: '/jobs?category=electrical', icon: '⚡' },
  { label: 'Building Jobs', href: '/jobs?category=carpentry', icon: '🏗️' },
  { label: 'Painting Jobs', href: '/jobs?category=painting', icon: '🖌️' },
  { label: 'Landscaping Jobs', href: '/jobs?category=landscaping', icon: '🌿' },
  { label: 'Roofing Jobs', href: '/jobs?category=roofing', icon: '🏠' },
  { label: 'HVAC Jobs', href: '/jobs?category=hvac', icon: '❄️' },
  { label: 'Cleaning Jobs', href: '/jobs?category=cleaning', icon: '🧹' },
]

const JOBS_FAQS = [
  {
    q: 'Is it free to apply for jobs on QuickTrade?',
    a: 'Yes — creating a profile and applying for jobs is completely free. QuickTrade only deducts a small commission from your earnings after you complete a job and the employer releases payment. There are no upfront fees or subscription required to start applying.',
  },
  {
    q: 'How do I get paid for jobs on QuickTrade?',
    a: "Payments are handled through QuickTrade's secure escrow system. When an employer accepts your quote, the funds are held securely. Once the work is completed and the employer approves, the payment is released directly to you, minus QuickTrade's commission.",
  },
  {
    q: 'What types of jobs are available on QuickTrade?',
    a: 'QuickTrade lists a wide range of trade and home service jobs including plumbing, electrical, building and carpentry, painting, landscaping and gardening, roofing, HVAC, cleaning, handyman work, and many more. Both one-off gig jobs and longer-term employment roles are posted.',
  },
  {
    q: 'How do I stand out when applying for jobs?',
    a: 'Complete your profile fully — including your skills, experience, certifications, and portfolio photos. Getting your ID verified earns you a blue badge which gives employers more confidence. Maintain a strong review rating by delivering great work, as employers can see your average score and read previous reviews.',
  },
  {
    q: 'Are jobs available across all of New Zealand?',
    a: 'Yes — QuickTrade has jobs available in all regions of New Zealand, including Auckland, Wellington, Christchurch, Hamilton, Tauranga, Dunedin, Queenstown, and rural areas.',
  },
  {
    q: 'Can I choose which jobs I apply for?',
    a: 'Absolutely. You browse all available jobs and choose which ones suit your skills, location, and schedule. Use the filters to narrow down by category, location, budget, and urgency. You can also use the "For You" tab (once logged in) to see jobs matched to your skill set.',
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Browse Trade Jobs in New Zealand',
  description: 'Find trade and home service jobs across New Zealand on QuickTrade.',
  url: `${SITE_URL}/jobs`,
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: JOBS_FAQS.map((faq) => ({
    '@type': 'Question',
    name: faq.q,
    acceptedAnswer: { '@type': 'Answer', text: faq.a },
  })),
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Browse Jobs', item: `${SITE_URL}/jobs` },
  ],
}

export default function JobsPage() {
  return (
    <div className="flex flex-col min-h-screen luxury-bg">
      <Script
        id="jsonld-jobs"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Script
        id="jsonld-jobs-faq"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Script
        id="jsonld-jobs-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section
          className="relative overflow-hidden py-16 px-4"
          style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #111827 60%, #0a0f1e 100%)' }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(99,102,241,0.18) 0%, transparent 70%)' }}
          />
          <div className="relative max-w-4xl mx-auto">
            <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
              <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
              <span>/</span>
              <span className="text-slate-300">Browse Jobs</span>
            </nav>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium mb-6">
              <span>🇳🇿</span>
              <span>Trade Jobs Across New Zealand</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
              Browse Trade &amp; Home Service{' '}
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                Jobs in NZ
              </span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mb-8">
              Thousands of plumbing, electrical, building, painting, landscaping, and home service jobs posted across New Zealand. Apply for free — get paid securely through escrow when the work is done.
            </p>

            <div className="flex flex-wrap gap-4 text-sm text-slate-300">
              <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-emerald-400" /> Free to apply</span>
              <span className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-indigo-400" /> Secure escrow payments</span>
              <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-sky-400" /> New jobs daily</span>
              <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-indigo-400" /> NZ-wide coverage</span>
            </div>
          </div>
        </section>

        {/* Job category quick links */}
        <section className="py-8 px-4 border-b border-slate-800/60" style={{ backgroundColor: '#0d1117' }}>
          <div className="max-w-6xl mx-auto">
            <p className="text-slate-500 text-sm mb-4">Browse by trade:</p>
            <div className="flex flex-wrap gap-3">
              {JOB_CATEGORIES.map(({ label, href, icon }) => (
                <Link
                  key={label}
                  href={href}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/70 border border-slate-700/50 hover:border-indigo-500/40 text-slate-300 hover:text-white text-sm transition-all"
                >
                  <span>{icon}</span>
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Interactive jobs browser (client component) */}
        <JobsBrowser />

        {/* Why work through QuickTrade */}
        <section className="py-16 px-4 border-t border-slate-800">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">Why tradies choose QuickTrade</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                {
                  icon: <Shield className="h-7 w-7 text-indigo-400" />,
                  title: 'Always Get Paid',
                  description:
                    "QuickTrade's escrow system means your payment is secured before work begins. The employer can't simply not pay — funds are held and only released when the job is approved.",
                },
                {
                  icon: <Star className="h-7 w-7 text-violet-400" />,
                  title: 'Build Your Reputation',
                  description:
                    'Every completed job earns a public review on your profile. Strong reviews lead to more job opportunities, higher rates, and a lower commission tier — all on autopilot.',
                },
                {
                  icon: <Briefcase className="h-7 w-7 text-sky-400" />,
                  title: 'Steady Work Pipeline',
                  description:
                    'New jobs are posted daily across every trade and region. Set your availability, browse jobs that match your skills, and fill your schedule without chasing leads.',
                },
                {
                  icon: <CheckCircle className="h-7 w-7 text-emerald-400" />,
                  title: 'Commission Drops as You Grow',
                  description:
                    'Start at 18% commission and earn your way down to just 10% as you complete more jobs. Pro and Elite subscriptions offer flat rates of 8% and 6% for high earners.',
                },
                {
                  icon: <Clock className="h-7 w-7 text-indigo-400" />,
                  title: 'Instant Job Notifications',
                  description:
                    'Get notified the moment a job matching your skills and location is posted. Pro members get a 30-minute head start on alerts so you can be first to apply.',
                },
                {
                  icon: <MapPin className="h-7 w-7 text-emerald-400" />,
                  title: 'Jobs Near You',
                  description:
                    'Filter by your location to find work close to home. Jobs are available in every region of New Zealand — from city centres to regional towns.',
                },
              ].map(({ icon, title, description }) => (
                <div
                  key={title}
                  className="rounded-xl bg-slate-900/60 border border-slate-700/50 p-6"
                >
                  <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
                    {icon}
                  </div>
                  <h3 className="text-white font-semibold mb-2">{title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 px-4 border-t border-slate-800">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-8">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {JOBS_FAQS.map((faq) => (
                <div
                  key={faq.q}
                  className="rounded-xl bg-slate-900/60 border border-slate-700/50 p-6"
                >
                  <h3 className="text-white font-semibold mb-2">{faq.q}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="pb-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-10 text-center">
              <p className="text-slate-300 font-semibold mb-2">Ready to start earning?</p>
              <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
                Create a free profile and start applying for trade jobs near you today.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/auth/register?role=worker"
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
                >
                  Create Free Profile
                </Link>
                <Link
                  href="/jobs/create"
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full border border-slate-700 hover:border-indigo-500/50 text-slate-300 hover:text-white text-sm font-semibold transition-colors"
                >
                  Post a Job Instead
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


