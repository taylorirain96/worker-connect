import type { Metadata } from 'next'
import Link from 'next/link'
import Script from 'next/script'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Card, CardContent } from '@/components/ui/Card'
import { SERVICES } from '@/lib/seo/servicesData'

const BASE = 'https://quicktrade.co.nz'

export const metadata: Metadata = {
  title: 'Services | QuickTrade NZ',
  description:
    'Find trusted local tradespeople and service providers across New Zealand. QuickTrade connects you with verified plumbers, electricians, cleaners, and more.',
  alternates: {
    canonical: `${BASE}/services`,
  },
  openGraph: {
    title: 'Services | QuickTrade NZ',
    description:
      'Browse all services available on QuickTrade across New Zealand. Find trusted local professionals for any home or business need.',
    type: 'website',
  },
}

export default function ServicesPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Services Available on QuickTrade',
    url: `${BASE}/services`,
    itemListElement: SERVICES.map((s, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: s.name,
      url: `${BASE}/services/${s.slug}`,
    })),
  }

  return (
    <div className="flex flex-col min-h-screen luxury-bg">
      <Script
        id="jsonld-services-hub"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
              Services Available on QuickTrade
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Browse all services available on QuickTrade across New Zealand. Find trusted local
              professionals for any home or business need.
            </p>
          </div>
        </section>

        {/* Service cards */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {SERVICES.map((service) => (
                <Link key={service.slug} href={`/services/${service.slug}`} className="group">
                  <Card className="h-full hover:border-indigo-500/40 hover:shadow-md transition-all duration-300">
                    <CardContent>
                      <p className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors mb-1">
                        {service.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 leading-snug">
                        {service.description}
                      </p>
                    </CardContent>
                  </Card>
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
