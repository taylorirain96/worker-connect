import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Script from 'next/script'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { SERVICES, getService } from '@/lib/seo/services'
import { NZ_REGIONS, getNZRegion, COUNTRY_NAMES } from '@/lib/seo/regions'
import { buildServiceLocationJsonLd } from '@/lib/seo/jsonld'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://quicktrade.co.nz'

interface Props {
  params: Promise<{ service: string; country: string; region: string }>
}

export async function generateStaticParams() {
  const paths: { service: string; country: string; region: string }[] = []
  for (const service of SERVICES) {
    for (const region of NZ_REGIONS) {
      paths.push({ service: service.id, country: 'nz', region: region.slug })
    }
  }
  return paths
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { service: serviceId, country, region: regionSlug } = await params
  const service = getService(serviceId)
  const region = country === 'nz' ? getNZRegion(regionSlug) : undefined

  if (!service || !region) return {}

  const countryName = COUNTRY_NAMES[country] ?? country.toUpperCase()
  const title = `${service.label} Services in ${region.city}, ${region.region} | QuickTrade`
  const description = `Find trusted ${service.label.toLowerCase()} professionals in ${region.city}, ${region.region}. Browse vetted workers, compare rates, and get quotes — QuickTrade makes hiring easy in ${region.city}.`
  const canonical = `${SITE_URL}/services/${service.id}/${country}/${region.slug}`

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

export default async function ServiceLocationPage({ params }: Props) {
  const { service: serviceId, country, region: regionSlug } = await params
  const service = getService(serviceId)
  const region = country === 'nz' ? getNZRegion(regionSlug) : undefined

  if (!service || !region) notFound()

  const countryName = COUNTRY_NAMES[country] ?? country.toUpperCase()
  const canonical = `${SITE_URL}/services/${service.id}/${country}/${region.slug}`
  const jsonLd = buildServiceLocationJsonLd(service, region, countryName, canonical)

  // Related services in the same group
  const relatedServices = SERVICES.filter(
    (s) => s.group === service.group && s.id !== service.id,
  ).slice(0, 4)

  return (
    <div className="flex flex-col min-h-screen luxury-bg">
      <Script
        id="jsonld-service-location"
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
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8 flex-wrap">
              <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
              <span>/</span>
              <Link href="/services" className="hover:text-slate-300 transition-colors">Services</Link>
              <span>/</span>
              <Link href={`/services/${service.id}`} className="hover:text-slate-300 transition-colors">
                {service.label}
              </Link>
              <span>/</span>
              <span className="text-slate-300">{region.city}</span>
            </nav>

            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className="text-4xl" aria-hidden="true">{service.icon}</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-medium">
                <span>🇳🇿</span>
                <span>{region.city}, {region.region}</span>
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
              {service.label}{' '}
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                in {region.city}
              </span>
            </h1>

            <p className="text-lg text-slate-400 max-w-2xl mb-8">
              Find trusted {service.label.toLowerCase()} professionals serving {region.city} and
              the wider {region.region} region. Every worker on QuickTrade is reviewed, rated, and
              ready to take on your next project.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/jobs/new"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
              >
                Post a Job in {region.city}
              </Link>
              <Link
                href={`/services/${service.id}`}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white text-sm font-semibold transition-colors"
              >
                All {service.label} Workers
              </Link>
            </div>
          </div>
        </section>

        {/* Location context */}
        <section className="py-12 px-4 border-b border-slate-800">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'City', value: region.city },
                { label: 'Region', value: region.region },
                { label: 'Country', value: countryName },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex flex-col p-5 rounded-xl bg-slate-900/70 border border-slate-700/50"
                >
                  <span className="text-xs text-slate-500 uppercase tracking-wider mb-1">{label}</span>
                  <span className="text-white font-semibold">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Empty state */}
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-xl font-bold text-white mb-6">
              {service.label} Workers in {region.city}
            </h2>
            <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-10 text-center">
              <span className="text-4xl mb-4 block" aria-hidden="true">{service.icon}</span>
              <p className="text-slate-300 font-semibold mb-2">
                Be the first to list in {region.city}
              </p>
              <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
                QuickTrade is growing fast across {countryName}. Post your job now and we&rsquo;ll
                match you with professionals in {region.city} as they join.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href="/jobs/new"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
                >
                  Post a Job
                </Link>
                <Link
                  href="/auth/register?role=worker"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-slate-600 hover:border-indigo-500/50 text-slate-300 hover:text-white text-sm font-semibold transition-colors"
                >
                  Join as a Worker
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Other regions */}
        <section className="pb-12 px-4 border-t border-slate-800 pt-12">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-lg font-bold text-white mb-5">
              {service.label} in Other NZ Cities
            </h2>
            <div className="flex flex-wrap gap-2">
              {NZ_REGIONS.filter((r) => r.slug !== region.slug).map((r) => (
                <Link
                  key={r.slug}
                  href={`/services/${service.id}/nz/${r.slug}`}
                  className="px-4 py-2 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-sm hover:border-indigo-500/50 hover:text-white hover:bg-slate-700/60 transition-all duration-200"
                >
                  {r.city}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Related services */}
        {relatedServices.length > 0 && (
          <section className="pb-16 px-4 border-t border-slate-800 pt-12">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-lg font-bold text-white mb-5">Related Services in {region.city}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {relatedServices.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/services/${rel.id}/nz/${region.slug}`}
                    className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-900/70 border border-slate-700/50 hover:border-indigo-500/40 transition-all duration-300 text-center"
                  >
                    <span className="text-2xl" aria-hidden="true">{rel.icon}</span>
                    <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors leading-tight">
                      {rel.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}
