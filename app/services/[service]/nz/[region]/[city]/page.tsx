import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Script from 'next/script'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import {
  SERVICES,
  LOCATIONS,
  NEARBY_MESH,
  getServiceBySlug,
  getLocation,
} from '@/lib/seo/servicesData'

const BASE = 'https://quicktrade.co.nz'

interface Props {
  params: Promise<{ service: string; region: string; city: string }>
}

export function generateStaticParams() {
  return SERVICES.flatMap((s) =>
    LOCATIONS.map((l) => ({
      service: s.slug,
      region: l.regionSlug,
      city: l.citySlug,
    })),
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { service: serviceSlug, region: regionSlug, city: citySlug } = await params
  const service = getServiceBySlug(serviceSlug)
  const location = getLocation(regionSlug, citySlug)
  if (!service || !location) return {}

  const title = `${service.namePlural} in ${location.cityName} | QuickTrade NZ`
  const description = `Find trusted ${service.namePlural} in ${location.cityName}, ${location.regionName}. Compare quotes and reviews on QuickTrade — New Zealand's trusted services marketplace.`
  const canonical = `${BASE}/services/${serviceSlug}/nz/${regionSlug}/${citySlug}`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: 'website' },
  }
}

export default async function ServiceLocationPage({ params }: Props) {
  const { service: serviceSlug, region: regionSlug, city: citySlug } = await params
  const service = getServiceBySlug(serviceSlug)
  const location = getLocation(regionSlug, citySlug)

  if (!service || !location) notFound()

  const canonical = `${BASE}/services/${serviceSlug}/nz/${regionSlug}/${citySlug}`
  const meshKey = `${regionSlug}/${citySlug}`
  const nearbyKeys = NEARBY_MESH[meshKey] ?? []

  const nearbyLocations = nearbyKeys
    .map((k) => {
      const [r, c] = k.split('/')
      return getLocation(r, c)
    })
    .filter((l): l is NonNullable<typeof l> => l != null)

  const otherLocations = LOCATIONS.filter(
    (l) => !(l.regionSlug === regionSlug && l.citySlug === citySlug),
  )

  const otherServices = SERVICES.filter((s) => s.slug !== serviceSlug)

  const isHeatPumps = serviceSlug === 'heat-pumps-air-conditioning'

  const introExtra = isHeatPumps
    ? ` Whether you need air conditioning installed or an aircon system serviced,`
    : ''

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: `${service.namePlural} in ${location.cityName}`,
      description: `Find trusted ${service.namePlural} in ${location.cityName}, ${location.regionName} on QuickTrade.`,
      areaServed: {
        '@type': 'City',
        name: location.cityName,
        containedInPlace: {
          '@type': 'AdministrativeArea',
          name: location.regionName,
          containedInPlace: {
            '@type': 'Country',
            name: 'New Zealand',
          },
        },
      },
      provider: {
        '@type': 'Organization',
        name: 'QuickTrade',
        url: BASE,
      },
      url: canonical,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
        { '@type': 'ListItem', position: 2, name: 'Services', item: `${BASE}/services` },
        {
          '@type': 'ListItem',
          position: 3,
          name: service.name,
          item: `${BASE}/services/${serviceSlug}`,
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: location.cityName,
          item: canonical,
        },
      ],
    },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Script
        id="jsonld-service-location"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-12 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
              <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
              <span aria-hidden="true">&gt;</span>
              <Link href="/services" className="hover:text-primary-600 transition-colors">Services</Link>
              <span aria-hidden="true">&gt;</span>
              <Link href={`/services/${serviceSlug}`} className="hover:text-primary-600 transition-colors">
                {service.name}
              </Link>
              <span aria-hidden="true">&gt;</span>
              <span className="text-gray-900 dark:text-white">{location.cityName}</span>
            </nav>

            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {service.namePlural} in {location.cityName}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
              Looking for trusted {service.namePlural} in {location.cityName}?{introExtra} QuickTrade
              connects you with verified local {service.namePlural} across {location.regionName}. Get
              quotes, compare reviews, and hire with confidence.
            </p>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-4 py-10 space-y-12">
          {/* CTA */}
          <Card>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Post a job and receive quotes from local {service.namePlural} in {location.cityName}{' '}
                today.
              </p>
              <Link href="/auth/register">
                <Button>Get Free Quotes</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Other locations for this service */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Other locations for {service.name}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {otherLocations.map((loc) => (
                <Link
                  key={`${loc.regionSlug}/${loc.citySlug}`}
                  href={`/services/${serviceSlug}/nz/${loc.regionSlug}/${loc.citySlug}`}
                  className="block p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary-500 hover:shadow-sm transition-all text-sm text-gray-700 dark:text-gray-300"
                >
                  {loc.cityName}
                  <span className="block text-xs text-gray-400 dark:text-gray-500">
                    {loc.regionName}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* Nearby areas */}
          {nearbyLocations.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Nearby areas
              </h2>
              <div className="flex flex-wrap gap-3">
                {nearbyLocations.map((loc) => (
                  <Link
                    key={`${loc.regionSlug}/${loc.citySlug}`}
                    href={`/services/${serviceSlug}/nz/${loc.regionSlug}/${loc.citySlug}`}
                    className="px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary-500 hover:shadow-sm transition-all text-sm text-gray-700 dark:text-gray-300"
                  >
                    {service.namePlural} in {loc.cityName}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Other services in this city */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Other services in {location.cityName}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {otherServices.map((svc) => (
                <Link
                  key={svc.slug}
                  href={`/services/${svc.slug}/nz/${regionSlug}/${citySlug}`}
                  className="block p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary-500 hover:shadow-sm transition-all text-sm text-gray-700 dark:text-gray-300"
                >
                  {svc.name}
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
