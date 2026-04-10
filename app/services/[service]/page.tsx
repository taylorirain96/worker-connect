import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Script from 'next/script'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { SERVICES as OLD_SERVICES, getService as getOldService } from '@/lib/seo/services'
import { buildServicePageJsonLd } from '@/lib/seo/jsonld'
import {
  SERVICES as NEW_SERVICES,
  LOCATIONS,
  getServiceBySlug,
} from '@/lib/seo/servicesData'

const BASE = 'https://quicktrade.co.nz'

interface Props {
  params: Promise<{ service: string }>
}

export async function generateStaticParams() {
  const newSlugs = new Set(NEW_SERVICES.map((s) => s.slug))
  const oldParams = OLD_SERVICES.filter((s) => !newSlugs.has(s.id)).map((s) => ({
    service: s.id,
  }))
  const newParams = NEW_SERVICES.map((s) => ({ service: s.slug }))
  return [...newParams, ...oldParams]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { service: serviceSlug } = await params
  const newService = getServiceBySlug(serviceSlug)

  if (newService) {
    const title = `${newService.name} in New Zealand | QuickTrade`
    const description = `Find trusted ${newService.namePlural} across New Zealand on QuickTrade. Get quotes, compare reviews, and hire local ${newService.namePlural} today.`
    const canonical = `${BASE}/services/${serviceSlug}`
    return {
      title,
      description,
      alternates: { canonical },
      openGraph: { title, description, url: canonical, type: 'website' },
    }
  }

  const oldService = getOldService(serviceSlug)
  if (!oldService) return {}

  const title = `${oldService.label} Services | QuickTrade New Zealand`
  const description = `Looking for a trusted ${oldService.label.toLowerCase()} professional? Browse vetted ${oldService.label.toLowerCase()} workers across New Zealand on QuickTrade.`
  const canonical = `${BASE}/services/${serviceSlug}`
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: 'website' },
  }
}

export default async function ServicePage({ params }: Props) {
  const { service: serviceSlug } = await params
  const newService = getServiceBySlug(serviceSlug)
  const oldService = getOldService(serviceSlug)

  if (!newService && !oldService) notFound()

  const canonical = `${BASE}/services/${serviceSlug}`

  if (newService) {
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: `${newService.name} in New Zealand`,
      description: newService.description,
      areaServed: { '@type': 'Country', name: 'New Zealand' },
      provider: { '@type': 'Organization', name: 'QuickTrade', url: BASE },
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
              <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-slate-500 mb-8">
                <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
                <span>&gt;</span>
                <Link href="/services" className="hover:text-slate-300 transition-colors">Services</Link>
                <span>&gt;</span>
                <span className="text-slate-300">{newService.name}</span>
              </nav>

              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
                {newService.name}{' '}
                <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                  in New Zealand
                </span>
              </h1>

              <p className="text-lg text-slate-400 max-w-2xl mb-8">
                {newService.description}
                {newService.synonyms && newService.synonyms.length > 0 && (
                  <> Also known as {newService.synonyms.join(', ')}.</>
                )}
              </p>
            </div>
          </section>

          {/* Location grid */}
          <section className="py-14 px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl font-bold text-white mb-2">
                Find {newService.namePlural} Near You
              </h2>
              <p className="text-slate-400 mb-8">
                Select your city to see {newService.namePlural.toLowerCase()} available in your area.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {LOCATIONS.map((loc) => (
                  <Link
                    key={`${loc.regionSlug}/${loc.citySlug}`}
                    href={`/services/${serviceSlug}/nz/${loc.regionSlug}/${loc.citySlug}`}
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
        </main>

        <Footer />
      </div>
    )
  }

  // Fallback: old service
  const jsonLd = buildServicePageJsonLd(oldService!, canonical)

  return (
    <div className="flex flex-col min-h-screen luxury-bg">
      <Script
        id="jsonld-service"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Navbar />

      <main className="flex-1">
        <section
          className="relative overflow-hidden py-20 px-4"
          style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #111827 60%, #0a0f1e 100%)' }}
        >
          <div className="max-w-4xl mx-auto">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-slate-500 mb-8">
              <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
              <span>/</span>
              <Link href="/services" className="hover:text-slate-300 transition-colors">Services</Link>
              <span>/</span>
              <span className="text-slate-300">{oldService!.label}</span>
            </nav>

            <div className="flex items-center gap-4 mb-4">
              <span className="text-4xl" aria-hidden="true">{oldService!.icon}</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-medium">
                {oldService!.group}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
              {oldService!.label}{' '}
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                Services
              </span>
            </h1>

            <p className="text-lg text-slate-400 max-w-2xl mb-8">
              {oldService!.description}
            </p>
          </div>
        </section>

        <section className="py-14 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-2">
              Find {oldService!.label} Professionals Near You
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {LOCATIONS.map((loc) => (
                <Link
                  key={`${loc.regionSlug}/${loc.citySlug}`}
                  href={`/services/${serviceSlug}/nz/${loc.regionSlug}/${loc.citySlug}`}
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
      </main>

      <Footer />
    </div>
  )
}
