import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Script from 'next/script'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import {
  SERVICES,
  LOCATIONS,
  getServiceBySlug,
  getServiceDetails,
} from '@/lib/seo/servicesData'
import { SITE_URL } from '@/lib/seo/config'

interface Props {
  params: Promise<{ service: string; region: string }>
}

export async function generateStaticParams() {
  const paths: { service: string; region: string }[] = []
  const uniqueRegions = Array.from(new Set(LOCATIONS.map((l) => l.regionSlug)))
  for (const service of SERVICES) {
    for (const regionSlug of uniqueRegions) {
      paths.push({ service: service.slug, region: regionSlug })
    }
  }
  return paths
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { service: serviceSlug, region: regionSlug } = await params
  const service = getServiceBySlug(serviceSlug)
  const regionLocation = LOCATIONS.find((l) => l.regionSlug === regionSlug)

  if (!service || !regionLocation) return {}

  const regionName = regionLocation.regionName
  const title = `${service.namePlural} in ${regionName} | QuickTrade NZ`
  const description = `Find trusted ${service.namePlural} across ${regionName}, New Zealand. Compare quotes from verified local professionals on QuickTrade.`
  const canonical = `${SITE_URL}/services/${service.slug}/nz/${regionSlug}`

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

export default async function ServiceRegionPage({ params }: Props) {
  const { service: serviceSlug, region: regionSlug } = await params
  const service = getServiceBySlug(serviceSlug)
  const regionLocations = LOCATIONS.filter((l) => l.regionSlug === regionSlug)

  if (!service || regionLocations.length === 0) notFound()

  const regionName = regionLocations[0].regionName
  const details = getServiceDetails(serviceSlug)
  const canonical = `${SITE_URL}/services/${service.slug}/nz/${regionSlug}`

  // Other regions (unique, excluding current)
  const uniqueRegions = Array.from(
    new Map(LOCATIONS.map((l) => [l.regionSlug, l])).values(),
  ).filter((l) => l.regionSlug !== regionSlug)

  // Other services
  const otherServices = SERVICES.filter((s) => s.slug !== service.slug)

  const cityNames = regionLocations.map((l) => l.cityName).join(', ')

  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    areaServed: {
      '@type': 'AdministrativeArea',
      name: regionName,
    },
    provider: {
      '@type': 'Organization',
      name: 'QuickTrade',
      url: SITE_URL,
    },
    url: canonical,
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Services',
        item: `${SITE_URL}/services`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: service.name,
        item: `${SITE_URL}/services/${service.slug}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: regionName,
        item: canonical,
      },
    ],
  }

  return (
    <div className="flex flex-col min-h-screen luxury-bg">
      <Script
        id="jsonld-service"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <Script
        id="jsonld-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section
          className="relative overflow-hidden py-20 px-4"
          style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #111827 60%, #0a0f1e 100%)' }}
        >
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6 flex-wrap">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span>›</span>
              <Link href="/services" className="hover:text-white transition-colors">Services</Link>
              <span>›</span>
              <Link href={`/services/${service.slug}`} className="hover:text-white transition-colors">{service.name}</Link>
              <span>›</span>
              <span className="text-slate-300">{regionName}</span>
            </nav>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium mb-6">
              <span>🇳🇿</span>
              <span>{regionName}, New Zealand</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
              {service.namePlural} in{' '}
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                {regionName}
              </span>
            </h1>

            <p className="text-lg text-slate-400 max-w-2xl mb-6">
              Find trusted {service.namePlural} across {regionName}, New Zealand. QuickTrade
              connects you with verified local professionals in {cityNames}. Get quotes, compare
              reviews, and hire with confidence.
            </p>

            {details && (
              <div className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <span className="text-slate-400 text-sm">Typical price:</span>
                <span className="text-white font-semibold">
                  ${details.priceFrom}–${details.priceTo}
                </span>
                <span className="text-slate-400 text-sm">{details.priceUnit}</span>
              </div>
            )}
          </div>
        </section>

        {/* Cities in this region */}
        <section className="py-14 px-4 border-b border-slate-800">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-2">
              Cities in {regionName}
            </h2>
            <p className="text-slate-400 mb-8">
              Select your city to find {service.namePlural} near you.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {regionLocations.map((loc) => (
                <Link
                  key={loc.citySlug}
                  href={`/services/${service.slug}/nz/${loc.regionSlug}/${loc.citySlug}`}
                  className="group flex flex-col p-5 rounded-xl bg-slate-900/70 border border-slate-700/50 hover:border-indigo-500/40 hover:shadow-[0_0_20px_rgba(99,102,241,0.12)] transition-all duration-300"
                >
                  <span className="font-semibold text-slate-200 group-hover:text-white transition-colors">
                    {loc.cityName}
                  </span>
                  <span className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors mt-1">
                    {service.namePlural} →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA banner */}
        <section className="py-10 px-4 bg-indigo-600/10 border-y border-indigo-500/20">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
            <p className="text-slate-300 text-lg">
              Post a job on QuickTrade and receive quotes from local{' '}
              <strong className="text-white">{service.namePlural}</strong> across {regionName} today.
            </p>
            <Link
              href="/auth/register"
              className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Get Free Quotes
            </Link>
          </div>
        </section>

        {/* Why hire & common jobs */}
        {details && (
          <section className="py-14 px-4 border-t border-slate-800">
            <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10">
              <div>
                <h2 className="text-xl font-bold text-white mb-4">
                  Why Hire a Professional {service.name} in {regionName}?
                </h2>
                <ul className="space-y-3">
                  {details.whyHire.map((reason, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-300 text-sm">
                      <span className="text-indigo-400 mt-0.5 shrink-0">✓</span>
                      {reason}
                    </li>
                  ))}
                </ul>

                {details.trustSignals && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {details.trustSignals.map((signal, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs"
                      >
                        {signal}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-xl font-bold text-white mb-4">
                  Common {service.name} Jobs in {regionName}
                </h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {details.commonJobs.map((job, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 px-4 py-3 rounded-lg bg-slate-900/60 border border-slate-700/50 text-slate-300 text-sm"
                    >
                      <span className="text-indigo-400">›</span>
                      {job}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}

        {/* Other regions for this service */}
        <section className="py-12 px-4 border-t border-slate-800">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-xl font-bold text-white mb-6">
              {service.name} in Other Regions
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {uniqueRegions.map((loc) => (
                <Link
                  key={loc.regionSlug}
                  href={`/services/${service.slug}/nz/${loc.regionSlug}`}
                  className="p-3 rounded-xl bg-slate-900/70 border border-slate-700/50 hover:border-indigo-500/40 hover:shadow-[0_0_16px_rgba(99,102,241,0.1)] transition-all duration-200 text-center"
                >
                  <p className="text-sm font-medium text-slate-200">{loc.regionName}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Other services in this region */}
        <section className="py-12 px-4 border-t border-slate-800">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-xl font-bold text-white mb-6">
              Other Services in {regionName}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {otherServices.map((svc) => (
                <Link
                  key={svc.slug}
                  href={`/services/${svc.slug}/nz/${regionSlug}`}
                  className="p-3 rounded-xl bg-slate-900/70 border border-slate-700/50 hover:border-indigo-500/40 hover:shadow-[0_0_16px_rgba(99,102,241,0.1)] transition-all duration-200"
                >
                  <p className="text-sm font-medium text-slate-200">{svc.name}</p>
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
