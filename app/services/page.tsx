import type { Metadata } from 'next'
import Link from 'next/link'
import MarketingNavbar from '@/components/layout/MarketingNavbar'
import Footer from '@/components/layout/Footer'
import JsonLdScript from '@/components/seo/JsonLdScript'
import { SERVICES } from '@/lib/seo/servicesData'
import { SITE_URL } from '@/lib/seo/config'
import { Shield, Star, CheckCircle, Clock, BadgeCheck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'All Services | QuickTrade NZ — Find Local Tradespeople',
  description:
    'Find trusted local tradespeople and service providers across New Zealand. QuickTrade connects you with verified plumbers, electricians, builders, cleaners, landscapers and more — fast quotes, secure payments, real reviews.',
  alternates: {
    canonical: `${SITE_URL}/services`,
  },
  openGraph: {
    title: 'All Services | QuickTrade NZ — Find Local Tradespeople',
    description:
      'Find trusted local tradespeople and service providers across New Zealand. QuickTrade connects you with verified plumbers, electricians, builders, cleaners and more.',
    type: 'website',
    url: `${SITE_URL}/services`,
  },
}

const itemListJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'QuickTrade NZ Services',
  description: 'All services available on QuickTrade across New Zealand.',
  numberOfItems: SERVICES.length,
  itemListElement: SERVICES.map((service, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: service.name,
    url: `${SITE_URL}/services/${service.slug}`,
  })),
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Services', item: `${SITE_URL}/services` },
  ],
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How does QuickTrade work for homeowners?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Post your job for free, receive quotes from verified local tradespeople, compare their profiles and reviews, then hire with confidence. Payment is held in escrow and only released when you approve the work.',
      },
    },
    {
      '@type': 'Question',
      name: 'Are the tradespeople on QuickTrade verified?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Workers can get their identity verified through QuickTrade\'s verification process. Verified workers display a blue badge on their profile, and all reviews are from real employers who hired through the platform.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is it free to post a job on QuickTrade?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes — posting a job is completely free for homeowners and businesses. You only pay the agreed price to the worker when the job is complete. QuickTrade charges no listing fees and no sign-up fees.',
      },
    },
    {
      '@type': 'Question',
      name: 'What trades and services are available on QuickTrade?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'QuickTrade covers all major trades and home services including plumbing, electrical, building and carpentry, painting, landscaping and gardening, roofing, heat pump installation, cleaning, handyman, and many more — across all regions of New Zealand.',
      },
    },
  ],
}

const SERVICES_FAQS = [
  {
    q: 'How does QuickTrade work for homeowners?',
    a: 'Post your job for free, receive quotes from verified local tradespeople, compare their profiles and reviews, then hire with confidence. Payment is held in escrow and only released when you approve the work.',
  },
  {
    q: 'Are the tradespeople on QuickTrade verified?',
    a: "Yes. Workers can get their identity verified through QuickTrade's verification process. Verified workers display a blue badge on their profile, and all reviews are from real employers who hired through the platform.",
  },
  {
    q: 'Is it free to post a job on QuickTrade?',
    a: 'Yes — posting a job is completely free for homeowners and businesses. You only pay the agreed price to the worker when the job is complete. QuickTrade charges no listing fees and no sign-up fees.',
  },
  {
    q: 'What trades and services are available on QuickTrade?',
    a: 'QuickTrade covers all major trades and home services including plumbing, electrical, building and carpentry, painting, landscaping and gardening, roofing, heat pump installation, cleaning, handyman, and many more — across all regions of New Zealand.',
  },
  {
    q: 'What if the work is not done properly?',
    a: "QuickTrade's escrow payment system protects you — your funds are only released when you approve the completed work. If there is a dispute, QuickTrade provides mediation support to help reach a fair resolution.",
  },
]

export default function ServicesPage() {
  return (
    <div className="flex flex-col min-h-screen luxury-bg">
      <JsonLdScript id="jsonld-itemlist" data={itemListJsonLd} />
      <JsonLdScript id="jsonld-services-breadcrumb" data={breadcrumbJsonLd} />
      <JsonLdScript id="jsonld-services-faq" data={faqJsonLd} />

      <MarketingNavbar />

      <main className="flex-1">
        {/* Hero */}
        <section
          className="relative overflow-hidden py-20 px-4"
          style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #111827 60%, #0a0f1e 100%)' }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(99,102,241,0.18) 0%, transparent 70%)' }}
          />
          <div className="relative max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium mb-6">
              <span>🇳🇿</span>
              <span>New Zealand Services</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
              Find Trusted{' '}
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                Local Services
              </span>{' '}
              Near You
            </h1>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-8">
              Browse all services available on QuickTrade across New Zealand — from plumbing and
              electrical to cleaning and landscaping. Vetted professionals, real reviews, fair prices.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-300">
              <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-emerald-400" /> Free to post a job</span>
              <span className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-indigo-400" /> Secure escrow payments</span>
              <span className="flex items-center gap-1.5"><BadgeCheck className="h-4 w-4 text-indigo-400" /> Verified professionals</span>
              <span className="flex items-center gap-1.5"><Star className="h-4 w-4 text-violet-400" /> Real reviews from real jobs</span>
            </div>
          </div>
        </section>

        {/* All services grid */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-xl font-bold text-white mb-6 text-center">
              Browse all {SERVICES.length} services
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {SERVICES.map((service) => (
                <Link
                  key={service.slug}
                  href={`/services/${service.slug}`}
                  className="group flex items-start gap-4 p-5 rounded-2xl bg-slate-900/70 border border-slate-700/50 hover:border-indigo-500/40 hover:shadow-[0_0_24px_rgba(99,102,241,0.15)] transition-all duration-300"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-200 group-hover:text-white transition-colors">
                      {service.name}
                    </p>
                    <p className="text-sm text-slate-300 mt-0.5 group-hover:text-slate-200 transition-colors leading-snug">
                      {service.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Why QuickTrade */}
        <section className="py-16 px-4 border-t border-slate-800">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-3 text-center">
              Why hire through QuickTrade?
            </h2>
            <p className="text-slate-300 text-center mb-10 max-w-xl mx-auto">
              New Zealand&apos;s trusted platform for connecting homeowners with qualified tradespeople.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: <CheckCircle className="h-6 w-6 text-emerald-400" />,
                  title: 'Free to Post a Job',
                  body: "Listing your job on QuickTrade costs nothing. Describe the work, set your budget, and receive quotes from qualified local tradespeople — all for free.",
                },
                {
                  icon: <BadgeCheck className="h-6 w-6 text-indigo-400" />,
                  title: 'Verified Workers',
                  body: "Every worker with a blue verified badge has passed QuickTrade's identity check. All reviews are from real employers who used the platform — no fake ratings.",
                },
                {
                  icon: <Shield className="h-6 w-6 text-indigo-400" />,
                  title: 'Secure Escrow Payments',
                  body: "Your payment is held safely in escrow and only released when you approve the completed work. Your money is always protected.",
                },
                {
                  icon: <Star className="h-6 w-6 text-violet-400" />,
                  title: 'Real Reviews',
                  body: "Every review on a worker's profile was left by a verified employer after a real job. What you read is an honest reflection of the work they do.",
                },
                {
                  icon: <Clock className="h-6 w-6 text-sky-400" />,
                  title: 'Fast Quotes',
                  body: "Post a job and get competitive quotes within hours. Compare tradespeople by price, reviews, and experience before making your decision.",
                },
                {
                  icon: <Shield className="h-6 w-6 text-emerald-400" />,
                  title: 'Dispute Protection',
                  body: "If something goes wrong, QuickTrade provides mediation and dispute resolution support so you are never left out of pocket.",
                },
              ].map(({ icon, title, body }) => (
                <div key={title} className="rounded-xl bg-slate-900/60 border border-slate-700/50 p-6">
                  <div className="h-11 w-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
                    {icon}
                  </div>
                  <h3 className="text-white font-semibold mb-2">{title}</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">{body}</p>
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
              {SERVICES_FAQS.map((faq) => (
                <div key={faq.q} className="rounded-xl bg-slate-900/60 border border-slate-700/50 p-6">
                  <h3 className="text-white font-semibold mb-2">{faq.q}</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="pb-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-10 text-center">
              <p className="text-slate-300 font-semibold mb-2">Ready to get your job done?</p>
              <p className="text-slate-300 text-sm mb-6 max-w-sm mx-auto">
                Post a job for free and receive quotes from verified local tradespeople.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/jobs/create"
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
                >
                  Post a Job — Free
                </Link>
                <Link
                  href="/workers"
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full border border-slate-700 hover:border-indigo-500/50 text-slate-300 hover:text-white text-sm font-semibold transition-colors"
                >
                  Browse Workers
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
