import type { Metadata } from 'next'
import Link from 'next/link'
import Script from 'next/script'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import WorkersBrowser from '@/components/workers/WorkersBrowser'
import { SITE_URL, SITE_NAME } from '@/lib/seo/config'
import { getWorkersServer } from '@/lib/services/workerServerService'
import { Shield, Star, BadgeCheck, MapPin, Clock, CheckCircle } from 'lucide-react'

// Re-query top workers periodically so the SSR ItemList JSON-LD stays
// reasonably fresh as new workers join, without going fully dynamic.
export const revalidate = 300

export const metadata: Metadata = {
  title: 'Find Trusted Tradies in New Zealand | QuickTrade',
  description:
    'Browse 12,000+ verified tradespeople across New Zealand — plumbers, electricians, builders, painters, landscapers and more. Read real reviews, compare rates, and hire with confidence.',
  alternates: { canonical: `${SITE_URL}/workers` },
  openGraph: {
    title: 'Find Trusted Tradies in New Zealand | QuickTrade',
    description:
      'Browse verified tradespeople across New Zealand. Real reviews, transparent pricing, and secure escrow payments.',
    url: `${SITE_URL}/workers`,
    type: 'website',
  },
}

const TRADE_CATEGORIES = [
  { label: 'Plumbers', href: '/workers?category=Plumbing', icon: '🔧' },
  { label: 'Electricians', href: '/workers?category=Electrical', icon: '⚡' },
  { label: 'Builders', href: '/workers?category=Carpentry+%26+Joinery', icon: '🏗️' },
  { label: 'Painters', href: '/workers?category=Painting+%26+Decorating', icon: '🖌️' },
  { label: 'Landscapers', href: '/workers?category=Landscaping+%26+Gardening', icon: '🌿' },
  { label: 'Roofers', href: '/workers?category=Roofing', icon: '🏠' },
  { label: 'Heat Pump Installers', href: '/workers?category=HVAC', icon: '❄️' },
  { label: 'Cleaners', href: '/workers?category=Cleaning', icon: '🧹' },
]

const WORKER_FAQS = [
  {
    q: 'How do I know if a tradie is trustworthy?',
    a: 'Every worker on QuickTrade has a verified profile with real reviews from previous employers. Look for the blue verified badge — this means their identity and, where applicable, their trade licence has been confirmed by our team. You can also see their star rating, number of completed jobs, and read detailed reviews before you contact them.',
  },
  {
    q: 'How much does it cost to hire a tradie through QuickTrade?',
    a: "You pay the worker's agreed rate — that's it. Posting a job and browsing worker profiles is completely free. QuickTrade deducts a small commission from the worker's payment (not from you), so there are no hidden fees for homeowners or businesses.",
  },
  {
    q: 'Can I message a tradie before hiring them?',
    a: 'Yes — once you post a job and receive quotes, or find a worker profile you like, you can message them directly through the platform. All communication is kept in one place, and payments are handled securely via escrow.',
  },
  {
    q: 'What if the work is not done to a satisfactory standard?',
    a: 'QuickTrade uses an escrow payment system: your funds are held securely and only released when you approve the completed work. If there is a dispute, our team provides mediation support to help reach a fair resolution.',
  },
  {
    q: 'Are tradies available across all of New Zealand?',
    a: 'QuickTrade covers all regions of New Zealand — from Auckland and Wellington to Christchurch, Hamilton, Tauranga, Dunedin, and everywhere in between, including rural areas.',
  },
  {
    q: 'How do I post a job to get quotes from tradies?',
    a: "Click 'Post a Job', describe the work, set your budget and timeline, and verified tradies in your area will send you quotes. You can compare their profiles, rates, and reviews before deciding who to hire.",
  },
]

const baseJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Find Tradespeople in New Zealand',
  description:
    'Browse verified plumbers, electricians, builders, painters, and other tradespeople across New Zealand on QuickTrade.',
  url: `${SITE_URL}/workers`,
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: WORKER_FAQS.map((faq) => ({
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
    { '@type': 'ListItem', position: 2, name: 'Find a Tradie', item: `${SITE_URL}/workers` },
  ],
}

export default async function WorkersPage() {
  const topWorkers = await getWorkersServer(20)

  // Enrich the listing's ItemList JSON-LD with real Person items so
  // crawlers see structured data for each surfaced worker, not just the
  // page-level container.
  const jsonLd =
    topWorkers.length > 0
      ? {
          ...baseJsonLd,
          itemListOrder: 'https://schema.org/ItemListOrderDescending',
          numberOfItems: topWorkers.length,
          itemListElement: topWorkers.map((worker, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: `${SITE_URL}/workers/${worker.uid}`,
            item: {
              '@type': 'Person',
              '@id': `${SITE_URL}/workers/${worker.uid}`,
              name: worker.displayName || 'QuickTrade Worker',
              url: `${SITE_URL}/workers/${worker.uid}`,
              ...(worker.photoURL ? { image: worker.photoURL } : {}),
              ...(worker.bio ? { description: worker.bio } : {}),
              ...(worker.location
                ? { address: { '@type': 'PostalAddress', addressLocality: worker.location } }
                : {}),
              ...(worker.skills && worker.skills.length > 0 ? { knowsAbout: worker.skills } : {}),
              ...(typeof worker.rating === 'number' && (worker.reviewCount ?? 0) > 0
                ? {
                    aggregateRating: {
                      '@type': 'AggregateRating',
                      ratingValue: worker.rating,
                      reviewCount: worker.reviewCount,
                      bestRating: 5,
                      worstRating: 1,
                    },
                  }
                : {}),
              worksFor: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
            },
          })),
        }
      : baseJsonLd

  return (
    <div className="flex flex-col min-h-screen luxury-bg">
      <Script
        id="jsonld-workers"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Script
        id="jsonld-workers-faq"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Script
        id="jsonld-workers-breadcrumb"
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
              <span className="text-slate-300">Find a Tradie</span>
            </nav>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium mb-6">
              <span>🇳🇿</span>
              <span>12,000+ Verified Tradies NZ-Wide</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
              Find Trusted Tradies in{' '}
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                New Zealand
              </span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mb-8">
              Browse verified plumbers, electricians, builders, painters, landscapers and more across every region of New Zealand. Read real reviews, compare rates, and hire with confidence through secure escrow payments.
            </p>

            <div className="flex flex-wrap gap-4 text-sm text-slate-300">
              <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-emerald-400" /> Free to post a job</span>
              <span className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-indigo-400" /> Secure escrow payments</span>
              <span className="flex items-center gap-1.5"><BadgeCheck className="h-4 w-4 text-indigo-400" /> Verified professionals</span>
              <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-indigo-400" /> NZ-wide coverage</span>
            </div>
          </div>
        </section>

        {/* Trade category quick links */}
        <section className="py-8 px-4 border-b border-slate-800/60" style={{ backgroundColor: '#0d1117' }}>
          <div className="max-w-6xl mx-auto">
            <p className="text-slate-500 text-sm mb-4">Browse by trade:</p>
            <div className="flex flex-wrap gap-3">
              {TRADE_CATEGORIES.map(({ label, href, icon }) => (
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

        {/* Interactive worker browser (client component) */}
        <WorkersBrowser />

        {/* Why hire on QuickTrade */}
        <section className="py-16 px-4 border-t border-slate-800">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">Why hire a tradie through QuickTrade?</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                {
                  icon: <BadgeCheck className="h-7 w-7 text-indigo-400" />,
                  title: 'Verified Professionals',
                  description:
                    'Every worker on QuickTrade goes through an identity check and has their profile reviewed. Verified workers carry a blue badge so you know they are who they say they are.',
                },
                {
                  icon: <Shield className="h-7 w-7 text-indigo-400" />,
                  title: 'Secure Escrow Payments',
                  description:
                    'Your payment is held in escrow and only released when you approve the completed work. If anything goes wrong, QuickTrade mediates to ensure a fair outcome.',
                },
                {
                  icon: <Star className="h-7 w-7 text-violet-400" />,
                  title: 'Real Reviews',
                  description:
                    "Every review on QuickTrade is from a real employer who hired through the platform — no fake reviews, no paid testimonials. What you read is what you get.",
                },
                {
                  icon: <Clock className="h-7 w-7 text-sky-400" />,
                  title: 'Fast Quotes',
                  description:
                    'Post a job and receive quotes from multiple tradies within hours. Compare rates, read reviews, and make an informed decision without chasing anyone down.',
                },
                {
                  icon: <MapPin className="h-7 w-7 text-emerald-400" />,
                  title: 'NZ-Wide Coverage',
                  description:
                    'QuickTrade is available in every region of New Zealand — Auckland, Wellington, Christchurch, Hamilton, Tauranga, Dunedin, and beyond.',
                },
                {
                  icon: <CheckCircle className="h-7 w-7 text-emerald-400" />,
                  title: 'Free to Use for Employers',
                  description:
                    "Posting a job and hiring a tradie through QuickTrade costs you nothing. There are no listing fees, no sign-up fees, and no hidden charges for the employer.",
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
              {WORKER_FAQS.map((faq) => (
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
              <p className="text-slate-300 font-semibold mb-2">Ready to find a tradie?</p>
              <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
                Post a job for free and receive quotes from verified tradies near you.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/jobs/create"
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
                >
                  Post a Job — Free
                </Link>
                <Link
                  href="/services"
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full border border-slate-700 hover:border-indigo-500/50 text-slate-300 hover:text-white text-sm font-semibold transition-colors"
                >
                  Browse Services
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

