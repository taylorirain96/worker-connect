import type { Metadata } from 'next'
import Link from 'next/link'
import Script from 'next/script'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { SERVICES } from '@/lib/seo/servicesData'
import { SITE_URL } from '@/lib/seo/config'

export const metadata: Metadata = {
  title: 'Services | QuickTrade NZ',
  description:
    'Find trusted local tradespeople and service providers across New Zealand. QuickTrade connects you with verified plumbers, electricians, cleaners, and more.',
  alternates: {
    canonical: `${SITE_URL}/services`,
  },
  openGraph: {
    title: 'Services | QuickTrade NZ',
    description:
      'Find trusted local tradespeople and service providers across New Zealand. QuickTrade connects you with verified plumbers, electricians, cleaners, and more.',
    type: 'website',
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

export default function ServicesPage() {
  return (
    <div className="flex flex-col min-h-screen luxury-bg">
      <Script
        id="jsonld-itemlist"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
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
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Browse all services available on QuickTrade across New Zealand — from plumbing and
              electrical to cleaning and landscaping. Vetted professionals, real reviews, fair prices.
            </p>
          </div>
        </section>

        {/* All services grid */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
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
                    <p className="text-sm text-slate-500 mt-0.5 group-hover:text-slate-400 transition-colors leading-snug">
                      {service.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
