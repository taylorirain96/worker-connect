import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { SERVICES, getServiceBySlug, getServiceDetails } from '@/lib/seo/servicesData'
import { AU_CITIES } from '@/lib/utils'
import { SITE_URL } from '@/lib/seo/config'
import Script from 'next/script'

interface Props {
  params: Promise<{ service: string; city: string }>
}

export async function generateStaticParams() {
  const paths: { service: string; city: string }[] = []
  for (const service of SERVICES) {
    for (const city of AU_CITIES) {
      paths.push({ service: service.slug, city: city.toLowerCase().replace(/\s+/g, '-') })
    }
  }
  return paths
}

function getCityFromSlug(slug: string): string | undefined {
  return AU_CITIES.find(
    (c) => c.toLowerCase().replace(/\s+/g, '-') === slug,
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { service: serviceSlug, city: citySlug } = await params
  const service = getServiceBySlug(serviceSlug)
  const cityName = getCityFromSlug(citySlug)

  if (!service || !cityName) return {}

  const details = getServiceDetails(serviceSlug)
  const priceHint = details ? ` Prices from A$${details.priceFrom} ${details.priceUnit} (inc. GST).` : ''
  const title = `${service.namePlural} in ${cityName} | QuickTrade AU`
  const description = `Find trusted ${service.namePlural} in ${cityName}, Australia. Compare quotes and reviews on QuickTrade — Australia's trusted tradie marketplace.${priceHint}`
  const canonical = `${SITE_URL}/services/${service.slug}/au/${citySlug}`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: 'website' },
  }
}

export default async function AUServiceCityPage({ params }: Props) {
  const { service: serviceSlug, city: citySlug } = await params
  const service = getServiceBySlug(serviceSlug)
  const cityName = getCityFromSlug(citySlug)

  if (!service || !cityName) notFound()

  const details = getServiceDetails(serviceSlug)
  const otherCities = AU_CITIES.filter((c) => c.toLowerCase().replace(/\s+/g, '-') !== citySlug)
  const otherServices = SERVICES.filter((s) => s.slug !== service.slug)

  // GST-inclusive AU pricing (NZD prices used as AUD approximation)
  const auPriceFrom = details ? Math.round(details.priceFrom * 1.1) : null
  const auPriceTo = details ? Math.round(details.priceTo * 1.1) : null

  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    areaServed: { '@type': 'City', name: cityName, containedInPlace: { '@type': 'Country', name: 'Australia' } },
    provider: { '@type': 'Organization', name: 'QuickTrade', url: SITE_URL },
  }

  return (
    <div className="flex flex-col min-h-screen luxury-bg">
      <Script id="jsonld-au-service" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section
          className="relative overflow-hidden py-20 px-4"
          style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #111827 60%, #0a0f1e 100%)' }}
        >
          <div className="max-w-4xl mx-auto">
            <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6 flex-wrap">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span>›</span>
              <Link href="/au" className="hover:text-white transition-colors">Australia</Link>
              <span>›</span>
              <Link href={`/services/${service.slug}`} className="hover:text-white transition-colors">{service.name}</Link>
              <span>›</span>
              <span className="text-slate-300">{cityName}</span>
            </nav>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium mb-6">
              <span>🇦🇺</span>
              <span>{cityName}, Australia</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
              {service.namePlural} in{' '}
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                {cityName}
              </span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mb-6">
              Find trusted {service.namePlural} in {cityName}, Australia. Get competitive quotes, compare reviews,
              and hire with confidence. All prices include 10% GST.
            </p>

            {auPriceFrom && auPriceTo && (
              <div className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <span className="text-slate-400 text-sm">Typical price (inc. GST):</span>
                <span className="text-white font-semibold">A${auPriceFrom}–A${auPriceTo}</span>
                <span className="text-slate-400 text-sm">{details?.priceUnit}</span>
              </div>
            )}
          </div>
        </section>

        {/* Why hire */}
        {details && (
          <section className="py-14 px-4 border-b border-slate-800">
            <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10">
              <div>
                <h2 className="text-xl font-bold text-white mb-4">
                  Why Hire a Professional {service.name} in {cityName}?
                </h2>
                <ul className="space-y-3">
                  {details.whyHire.map((reason, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-300 text-sm">
                      <span className="text-indigo-400 mt-0.5 shrink-0">✓</span>
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-4">
                  Common {service.name} Jobs in {cityName}
                </h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {details.commonJobs.map((job, i) => (
                    <li key={i} className="flex items-center gap-2 px-4 py-3 rounded-lg bg-slate-900/60 border border-slate-700/50 text-slate-300 text-sm">
                      <span className="text-indigo-400">›</span>
                      {job}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="py-10 px-4 bg-indigo-600/10 border-y border-indigo-500/20">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
            <p className="text-slate-300 text-lg">
              Post a job and receive quotes from local{' '}
              <strong className="text-white">{service.namePlural}</strong> in {cityName} today.
            </p>
            <Link
              href="/auth/register"
              className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Get Free Quotes
            </Link>
          </div>
        </section>

        {/* FAQs */}
        {details?.faqs.length ? (
          <section className="py-14 px-4 border-t border-slate-800">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-white mb-8">{service.name} FAQs in {cityName}</h2>
              <div className="space-y-4">
                {details.faqs.map((faq, i) => (
                  <div key={i} className="rounded-xl bg-slate-900/60 border border-slate-700/50 p-6">
                    <h3 className="text-white font-semibold mb-2">{faq.question}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* Other AU cities */}
        <section className="py-12 px-4 border-t border-slate-800">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-xl font-bold text-white mb-6">{service.name} in other Australian cities</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {otherCities.map((city) => (
                <Link
                  key={city}
                  href={`/services/${service.slug}/au/${city.toLowerCase().replace(/\s+/g, '-')}`}
                  className="p-3 rounded-xl bg-slate-900/70 border border-slate-700/50 hover:border-indigo-500/40 transition-all text-center"
                >
                  <p className="text-sm font-medium text-slate-200">{city}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Australia</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Other services */}
        <section className="py-12 px-4 border-t border-slate-800">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-xl font-bold text-white mb-6">Other services in {cityName}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {otherServices.map((svc) => (
                <Link
                  key={svc.slug}
                  href={`/services/${svc.slug}/au/${citySlug}`}
                  className="p-3 rounded-xl bg-slate-900/70 border border-slate-700/50 hover:border-indigo-500/40 transition-all"
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
