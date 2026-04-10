import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Script from 'next/script'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { SERVICES, LOCATIONS, getServiceBySlug } from '@/lib/seo/servicesData'

const SITE_URL = 'https://quicktrade.co.nz'

interface Props {
  params: Promise<{ service: string }>
}

export async function generateStaticParams() {
  return SERVICES.map((s) => ({ service: s.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { service: serviceSlug } = await params
  const service = getServiceBySlug(serviceSlug)
  if (!service) return {}

  const title = `${service.name} in New Zealand | QuickTrade`
  const description = `Find trusted ${service.namePlural} across New Zealand on QuickTrade. Get quotes, compare reviews, and hire local ${service.namePlural} today.`
  const canonical = `${SITE_URL}/services/${service.slug}`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
    },
  }
}

export default async function ServicePage({ params }: Props) {
  const { service: serviceSlug } = await params
  const service = getServiceBySlug(serviceSlug)
  if (!service) notFound()

  const canonical = `${SITE_URL}/services/${service.slug}`
  const isHeatPumps = service.slug === 'heat-pumps-air-conditioning'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    areaServed: {
      '@type': 'Country',
      name: 'New Zealand',
    },
    provider: {
      '@type': 'Organization',
      name: 'QuickTrade',
      url: SITE_URL,
    },
    url: canonical,
  }

  return (
    <div className="flex flex-col min-h-screen luxury-bg">
      <Script
        id="jsonld-service"
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
          <div className="max-w-4xl mx-auto">
            <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
              <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
              <span>/</span>
              <Link href="/services" className="hover:text-slate-300 transition-colors">Services</Link>
              <span>/</span>
              <span className="text-slate-300">{service.name}</span>
            </nav>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium mb-6">
              <span>🇳🇿</span>
              <span>New Zealand</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
              {service.name}{' '}
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                in New Zealand
              </span>
            </h1>

            <p className="text-lg text-slate-400 max-w-2xl mb-8">
              {service.description}{' '}
              {isHeatPumps
                ? 'Whether you need air conditioning, aircon servicing, or a new heat pump installation, our verified professionals are ready to help. '
                : ''}
              Browse verified {service.namePlural} across New Zealand — real reviews, transparent
              pricing, and secure payments.
            </p>
          </div>
        </section>

        {/* Available locations */}
        <section className="py-14 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-2">
              Available in these locations
            </h2>
            <p className="text-slate-400 mb-8">
              Select your city to find {service.namePlural} near you.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {LOCATIONS.map((loc) => (
                <Link
                  key={`${loc.regionSlug}/${loc.citySlug}`}
                  href={`/services/${service.slug}/nz/${loc.regionSlug}/${loc.citySlug}`}
                  className="group flex flex-col p-4 rounded-xl bg-slate-900/70 border border-slate-700/50 hover:border-indigo-500/40 hover:shadow-[0_0_20px_rgba(99,102,241,0.12)] transition-all duration-300"
                >
                  <span className="font-semibold text-slate-200 group-hover:text-white transition-colors text-sm">
                    {loc.cityName}
                  </span>
                  <span className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors mt-0.5">
                    {loc.regionName}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="pb-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-10 text-center">
              <p className="text-slate-300 font-semibold mb-2">
                Ready to hire a {service.name} professional?
              </p>
              <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
                Post a job and qualified {service.namePlural} will reach out with quotes.
              </p>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
              >
                Get Free Quotes
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
