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
  getLocation,
  getNearbyLocations,
} from '@/lib/seo/servicesData'
import { SITE_URL } from '@/lib/seo/config'

interface Props {
  params: Promise<{ service: string; region: string; city: string }>
}

export async function generateStaticParams() {
  const paths: { service: string; region: string; city: string }[] = []
  for (const service of SERVICES) {
    for (const loc of LOCATIONS) {
      paths.push({
        service: service.slug,
        region: loc.regionSlug,
        city: loc.citySlug,
      })
    }
  }
  return paths
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { service: serviceSlug, region: regionSlug, city: citySlug } = await params
  const service = getServiceBySlug(serviceSlug)
  const location = getLocation(regionSlug, citySlug)

  if (!service || !location) return {}

  const title = `${service.namePlural} in ${location.cityName} | QuickTrade NZ`
  const description = `Find trusted ${service.namePlural} in ${location.cityName}, ${location.regionName}. Compare quotes and reviews on QuickTrade — New Zealand's trusted services marketplace.`
  const canonical = `${SITE_URL}/services/${service.slug}/nz/${location.regionSlug}/${location.citySlug}`

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

export default async function ServiceCityPage({ params }: Props) {
  const { service: serviceSlug, region: regionSlug, city: citySlug } = await params
  const service = getServiceBySlug(serviceSlug)
  const location = getLocation(regionSlug, citySlug)

  if (!service || !location) notFound()

  const canonical = `${SITE_URL}/services/${service.slug}/nz/${location.regionSlug}/${location.citySlug}`
  const nearbyLocations = getNearbyLocations(location.regionSlug, location.citySlug)
  const otherLocations = LOCATIONS.filter(
    (l) => !(l.regionSlug === location.regionSlug && l.citySlug === location.citySlug),
  )
  const otherServices = SERVICES.filter((s) => s.slug !== service.slug)

  const isHeatPumps = service.slug === 'heat-pumps-air-conditioning'

  const introExtra = isHeatPumps
    ? ` Whether you need a new heat pump, air conditioning system, or aircon servicing,`
    : ''

  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: `${service.description}${introExtra}`,
    areaServed: {
      '@type': 'City',
      name: location.cityName,
      containedInPlace: {
        '@type': 'AdministrativeArea',
        name: location.regionName,
      },
    },
    provider: {
      '@type': 'Organization',
      name: 'QuickTrade',
      url: SITE_URL,
    },
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
        name: location.cityName,
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
              <span className="text-slate-300">{location.cityName}</span>
            </nav>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium mb-6">
              <span>🇳🇿</span>
              <span>{location.cityName}, {location.regionName}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
              {service.namePlural} in{' '}
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                {location.cityName}
              </span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl">
              Looking for trusted {service.namePlural} in {location.cityName}? QuickTrade connects
              you with verified local {service.namePlural} across {location.regionName}.
              {isHeatPumps
                ? ' Whether you need a heat pump, air conditioning, or aircon servicing, we have you covered.'
                : ''}{' '}
              Get quotes, compare reviews, and hire with confidence.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-10 px-4 bg-indigo-600/10 border-y border-indigo-500/20">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
            <p className="text-slate-300 text-lg">
              Post a job on QuickTrade and receive quotes from local{' '}
              <strong className="text-white">{service.namePlural}</strong> in {location.cityName} today.
            </p>
            <Link
              href="/auth/register"
              className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Get Free Quotes
            </Link>
          </div>
        </section>

        {/* Nearby areas */}
        {nearbyLocations.length > 0 && (
          <section className="py-12 px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-xl font-bold text-white mb-6">
                Nearby areas for {service.name}
              </h2>
              <div className="flex flex-wrap gap-3">
                {nearbyLocations.map((nearby) => (
                  <Link
                    key={`${nearby.regionSlug}/${nearby.citySlug}`}
                    href={`/services/${service.slug}/nz/${nearby.regionSlug}/${nearby.citySlug}`}
                    className="px-4 py-2 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-sm hover:border-indigo-500/50 hover:text-white transition-all"
                  >
                    {service.namePlural} in {nearby.cityName}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Other locations for this service */}
        <section className="py-12 px-4 border-t border-slate-800">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-xl font-bold text-white mb-6">
              Other locations for {service.name}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {otherLocations.map((loc) => (
                <Link
                  key={`${loc.regionSlug}/${loc.citySlug}`}
                  href={`/services/${service.slug}/nz/${loc.regionSlug}/${loc.citySlug}`}
                  className="p-3 rounded-xl bg-slate-900/70 border border-slate-700/50 hover:border-indigo-500/40 hover:shadow-[0_0_16px_rgba(99,102,241,0.1)] transition-all duration-200 text-center"
                >
                  <p className="text-sm font-medium text-slate-200">{loc.cityName}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{loc.regionName}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Other services in this city */}
        <section className="py-12 px-4 border-t border-slate-800">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-xl font-bold text-white mb-6">
              Other services in {location.cityName}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {otherServices.map((svc) => (
                <Link
                  key={svc.slug}
                  href={`/services/${svc.slug}/nz/${location.regionSlug}/${location.citySlug}`}
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
