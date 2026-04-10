import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Script from 'next/script'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { SERVICES, getService } from '@/lib/seo/services'
import { NZ_REGIONS } from '@/lib/seo/regions'
import { buildServicePageJsonLd } from '@/lib/seo/jsonld'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://worker-connect.vercel.app'

interface Props {
  params: Promise<{ service: string }>
}

export async function generateStaticParams() {
  return SERVICES.map((s) => ({ service: s.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { service: serviceId } = await params
  const service = getService(serviceId)
  if (!service) return {}

  const title = `${service.label} Services | QuickTrade New Zealand`
  const description = `Looking for a trusted ${service.label.toLowerCase()} professional? Browse vetted ${service.label.toLowerCase()} workers across New Zealand on QuickTrade. Compare profiles, read real reviews, and hire with confidence.`
  const canonical = `${SITE_URL}/services/${service.id}`

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
  const { service: serviceId } = await params
  const service = getService(serviceId)
  if (!service) notFound()

  const canonical = `${SITE_URL}/services/${service.id}`
  const jsonLd = buildServicePageJsonLd(service, canonical)

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
              <span className="text-slate-300">{service.label}</span>
            </nav>

            <div className="flex items-center gap-4 mb-4">
              <span className="text-4xl" aria-hidden="true">{service.icon}</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-medium">
                {service.group}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
              {service.label}{' '}
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                Services
              </span>
            </h1>

            <p className="text-lg text-slate-400 max-w-2xl mb-8">
              {service.description} Browse verified {service.label.toLowerCase()} professionals
              across New Zealand — real reviews, transparent pricing, and secure payments.
            </p>

            <div className="flex flex-wrap gap-2">
              {service.keywords.map((kw) => (
                <span
                  key={kw}
                  className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-xs"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* NZ city links */}
        <section className="py-14 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-2">
              Find {service.label} Professionals Near You
            </h2>
            <p className="text-slate-400 mb-8">
              Select your city to see {service.label.toLowerCase()} workers available in your area.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {NZ_REGIONS.map((region) => (
                <Link
                  key={region.slug}
                  href={`/services/${service.id}/nz/${region.slug}`}
                  className="group flex flex-col p-4 rounded-xl bg-slate-900/70 border border-slate-700/50 hover:border-indigo-500/40 hover:shadow-[0_0_20px_rgba(99,102,241,0.12)] transition-all duration-300"
                >
                  <span className="font-semibold text-slate-200 group-hover:text-white transition-colors text-sm">
                    {region.city}
                  </span>
                  <span className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors mt-0.5">
                    {region.region}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Empty state / placeholder listings */}
        <section className="pb-16 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-xl font-bold text-white mb-6">
              Available {service.label} Workers
            </h2>
            <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-10 text-center">
              <span className="text-4xl mb-4 block" aria-hidden="true">{service.icon}</span>
              <p className="text-slate-300 font-semibold mb-2">
                Workers are joining QuickTrade every day
              </p>
              <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
                Be the first in your area to connect. Post a job and qualified{' '}
                {service.label.toLowerCase()} professionals will reach out to you.
              </p>
              <Link
                href="/jobs/new"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
              >
                Post a Job
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
