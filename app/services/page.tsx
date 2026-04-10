import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { SERVICES, SERVICE_GROUPS, getServicesGrouped, type ServiceGroup } from '@/lib/seo/services'

export const metadata: Metadata = {
  title: 'Local Services Directory | QuickTrade New Zealand',
  description:
    'Find trusted tradespeople and service professionals across New Zealand. Browse plumbing, electrical, cleaning, landscaping, moving, and more — hire with confidence.',
  alternates: {
    canonical: '/services',
  },
  openGraph: {
    title: 'Local Services Directory | QuickTrade New Zealand',
    description:
      'Browse all service categories on QuickTrade. Find vetted professionals for every home and business need.',
    type: 'website',
  },
}

const GROUP_ICONS: Record<ServiceGroup, string> = {
  'Trades & Repairs': '🔧',
  'Home Improvement': '🏡',
  Cleaning: '🧹',
  'Moving & Delivery': '📦',
  'Outdoor & Garden': '🌿',
  'Auto Services': '🚗',
  'Tech Help': '💻',
  'Personal Services': '👤',
  'Business Services': '💼',
  Events: '🎉',
  Other: '✨',
}

export default function ServicesPage() {
  const grouped = getServicesGrouped()

  return (
    <div className="flex flex-col min-h-screen luxury-bg">
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
              Browse every service category on QuickTrade — from plumbing and electrical to
              cleaning and landscaping. Vetted professionals, real reviews, fair prices.
            </p>
          </div>
        </section>

        {/* All service categories */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="space-y-14">
              {(Object.keys(grouped) as ServiceGroup[]).map((group) => (
                <div key={group}>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-2xl" aria-hidden="true">
                      {GROUP_ICONS[group]}
                    </span>
                    <h2 className="text-xl font-bold text-white">{group}</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {grouped[group].map((service) => (
                      <Link
                        key={service.id}
                        href={`/services/${service.id}`}
                        className="group flex items-start gap-4 p-5 rounded-2xl bg-slate-900/70 border border-slate-700/50 hover:border-indigo-500/40 hover:shadow-[0_0_24px_rgba(99,102,241,0.15)] transition-all duration-300"
                      >
                        <span className="text-2xl shrink-0 mt-0.5" aria-hidden="true">
                          {service.icon}
                        </span>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-200 group-hover:text-white transition-colors">
                            {service.label}
                          </p>
                          <p className="text-sm text-slate-500 mt-0.5 group-hover:text-slate-400 transition-colors leading-snug">
                            {service.description}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* NZ cities CTA */}
        <section className="py-12 px-4 border-t border-slate-800">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-white mb-3">
              Services Across New Zealand
            </h2>
            <p className="text-slate-400 mb-8">
              We&rsquo;re starting with the regions that need it most. Select your city to see
              available professionals near you.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { slug: 'blenheim', label: 'Blenheim' },
                { slug: 'auckland', label: 'Auckland' },
                { slug: 'wellington', label: 'Wellington' },
                { slug: 'christchurch', label: 'Christchurch' },
                { slug: 'hamilton', label: 'Hamilton' },
                { slug: 'tauranga', label: 'Tauranga' },
                { slug: 'dunedin', label: 'Dunedin' },
                { slug: 'nelson', label: 'Nelson' },
                { slug: 'queenstown', label: 'Queenstown' },
              ].map(({ slug, label }) => (
                <Link
                  key={slug}
                  href={`/services/plumbing/nz/${slug}`}
                  className="px-4 py-2 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-sm hover:border-indigo-500/50 hover:text-white hover:bg-slate-700/60 transition-all duration-200"
                >
                  {label}
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
