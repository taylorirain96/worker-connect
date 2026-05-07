import type { Metadata } from 'next'
import Link from 'next/link'
import Script from 'next/script'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { SITE_URL } from '@/lib/seo/config'

export const metadata: Metadata = {
  title: 'Press & Media | QuickTrade',
  description:
    "QuickTrade press resources, founder background, brand assets, and media contact details for New Zealand's trusted services marketplace.",
  alternates: {
    canonical: `${SITE_URL}/press`,
  },
  openGraph: {
    title: 'Press & Media | QuickTrade',
    description:
      "QuickTrade press resources, founder background, brand assets, and media contact details for New Zealand's trusted services marketplace.",
    url: `${SITE_URL}/press`,
    type: 'website',
  },
}

const pressPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'QuickTrade Press & Media',
  url: `${SITE_URL}/press`,
  description:
    "Press resources, founder background, and media contacts for QuickTrade, New Zealand's trusted services marketplace.",
  about: {
    '@type': 'Organization',
    name: 'QuickTrade',
    url: SITE_URL,
    areaServed: 'New Zealand',
    foundingLocation: 'Blenheim, Marlborough, New Zealand',
    email: 'press@quicktrade.co.nz',
  },
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Press', item: `${SITE_URL}/press` },
  ],
}

const stats = [
  { value: '17+', label: 'Services available at launch' },
  { value: '10', label: 'NZ regions covered' },
  { value: 'Blenheim', label: 'Founding hometown' },
  { value: 'Within 1', label: 'Business day response time' },
]

const factSheet = [
  {
    label: 'What QuickTrade does',
    value: 'Connects homeowners and businesses with verified local tradespeople across New Zealand.',
  },
  {
    label: 'Founded',
    value: 'Built in Blenheim, Marlborough, New Zealand.',
  },
  {
    label: 'Core promise',
    value: 'Make hiring trusted tradies faster, safer, and easier for Kiwis.',
  },
  {
    label: 'Media contact',
    value: 'press@quicktrade.co.nz',
  },
]

const storyAngles = [
  'Blenheim founder builds a verified-trades marketplace for New Zealand.',
  'QuickTrade aims to reduce the friction and risk of finding trusted tradies online.',
  'A New Zealand-first marketplace focused on local trust, transparent quotes, and secure payments.',
]

const pressAssets = [
  {
    title: 'QuickTrade logo',
    description: 'Download the QuickTrade wordmark for articles, interviews, and partner mentions.',
    href: '/press/quicktrade-wordmark.svg',
    fileLabel: 'SVG',
  },
  {
    title: 'Brand guide',
    description: 'Quick usage notes, approved colours, and a short company boilerplate for media teams.',
    href: '/press/quicktrade-brand-guide.txt',
    fileLabel: 'TXT',
  },
]

export default function PressPage() {
  return (
    <div className="flex flex-col min-h-screen luxury-bg">
      <Script
        id="jsonld-press-page"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pressPageJsonLd) }}
      />
      <Script
        id="jsonld-press-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <Navbar />

      <main className="flex-1">
        <section
          className="relative overflow-hidden py-20 px-4"
          style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #111827 60%, #0a0f1e 100%)' }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(99,102,241,0.18) 0%, transparent 70%)' }}
          />
          <div className="relative max-w-5xl mx-auto">
            <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
              <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
              <span>/</span>
              <span className="text-slate-300">Press</span>
            </nav>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium mb-6">
              <span>📰</span>
              <span>Press &amp; Media</span>
            </div>

            <div className="grid lg:grid-cols-[1.4fr_0.9fr] gap-10 items-start">
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
                  QuickTrade{' '}
                  <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                    press kit
                  </span>
                </h1>
                <p className="text-lg text-slate-400 max-w-2xl mb-8">
                  Media resources for journalists, bloggers, and partners covering QuickTrade —
                  the New Zealand-built marketplace connecting people with trusted local tradies.
                </p>

                <div className="flex flex-wrap gap-3">
                  <a
                    href="mailto:press@quicktrade.co.nz"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors"
                  >
                    Email press@quicktrade.co.nz
                  </a>
                  <a
                    href="/press/quicktrade-brand-guide.txt"
                    download
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-600 hover:border-slate-500 text-slate-200 font-semibold transition-colors"
                  >
                    Download media notes
                  </a>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-900/70 border border-slate-700/50 p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Quick facts</h2>
                <div className="space-y-4">
                  {factSheet.map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-1">{label}</p>
                      <p className="text-sm text-slate-300 leading-relaxed">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 border-b border-slate-800">
          <div className="max-w-5xl mx-auto grid lg:grid-cols-[1.2fr_0.8fr] gap-12">
            <div className="space-y-8">
              <div className="rounded-2xl bg-slate-900/70 border border-slate-700/50 p-8">
                <h2 className="text-2xl font-bold text-white mb-4">Company overview</h2>
                <p className="text-slate-300 leading-relaxed mb-4">
                  QuickTrade is a New Zealand marketplace for local services and skilled trades.
                  The platform helps homeowners and businesses post jobs, compare quotes, review
                  worker profiles, and hire with more confidence.
                </p>
                <p className="text-slate-300 leading-relaxed">
                  The business was built in Blenheim, Marlborough with a simple goal: make it
                  easier for Kiwis to find trustworthy tradies without relying on guesswork,
                  scattered Facebook posts, or word-of-mouth alone.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-900/70 border border-slate-700/50 p-8">
                <h2 className="text-2xl font-bold text-white mb-4">Founder background</h2>
                <p className="text-slate-300 leading-relaxed mb-4">
                  QuickTrade is led by a Blenheim-based founder focused on solving a practical
                  New Zealand problem: it is still too hard to quickly find reliable, qualified
                  people for everyday trade and home-service work.
                </p>
                <blockquote className="border-l-2 border-indigo-400 pl-4 text-slate-300 italic leading-relaxed">
                  “QuickTrade was built for New Zealand first. The goal is to give homeowners and
                  businesses a better way to hire, while helping great tradies win more work with
                  less friction.”
                </blockquote>
                <p className="text-sm text-slate-500 mt-4">Founder, QuickTrade · Blenheim, NZ</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="rounded-2xl bg-slate-900/70 border border-slate-700/50 p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Key stats</h2>
                <div className="grid grid-cols-2 gap-4">
                  {stats.map(({ value, label }) => (
                    <div
                      key={label}
                      className="rounded-xl bg-slate-950/60 border border-slate-700/50 p-5"
                    >
                      <p className="text-2xl sm:text-3xl font-bold text-indigo-400">{value}</p>
                      <p className="text-sm text-slate-400 mt-2">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-slate-900/70 border border-slate-700/50 p-8">
                <h2 className="text-2xl font-bold text-white mb-4">Story angles</h2>
                <ul className="space-y-3">
                  {storyAngles.map((angle) => (
                    <li key={angle} className="flex items-start gap-3 text-slate-300 text-sm leading-relaxed">
                      <span className="text-indigo-400 mt-0.5">•</span>
                      <span>{angle}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 border-b border-slate-800">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Downloadable press assets</h2>
                <p className="text-slate-400">
                  Grab approved assets for articles, interviews, newsletter mentions, and local
                  business coverage.
                </p>
              </div>
              <a
                href="mailto:press@quicktrade.co.nz"
                className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Need photos or additional files? Email the press team →
              </a>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {pressAssets.map(({ title, description, href, fileLabel }) => (
                <div key={title} className="rounded-2xl bg-slate-900/70 border border-slate-700/50 p-8">
                  <div className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 mb-4">
                    {fileLabel}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6">{description}</p>
                  <a
                    href={href}
                    download
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-slate-600 hover:border-slate-500 text-white text-sm font-semibold transition-colors"
                  >
                    Download asset
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-4 border-b border-slate-800">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-slate-900/70 border border-slate-700/50 p-8">
              <h2 className="text-2xl font-bold text-white mb-4">Press contact</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                For interviews, comment requests, quotes, or media opportunities, contact:
              </p>
              <a
                href="mailto:press@quicktrade.co.nz"
                className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
              >
                press@quicktrade.co.nz
              </a>
              <p className="text-sm text-slate-500 mt-3">
                Typical response time: within one business day.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-900/70 border border-slate-700/50 p-8">
              <h2 className="text-2xl font-bold text-white mb-4">As seen in</h2>
              <p className="text-slate-400 leading-relaxed mb-4">
                We&apos;re building this section as coverage lands. Early local and trade-industry
                mentions are especially welcome.
              </p>
              <p className="text-slate-300 text-sm">
                Pitch angle: <span className="text-white">“Blenheim founder builds a verified-trades marketplace to help solve a national trust problem.”</span>
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto text-center rounded-3xl border border-indigo-500/20 bg-indigo-500/5 p-10">
            <p className="text-sm uppercase tracking-[0.25em] text-indigo-300 mb-3">Media-ready</p>
            <h2 className="text-3xl font-bold text-white mb-4">Need something specific?</h2>
            <p className="text-slate-400 max-w-2xl mx-auto mb-8">
              We can provide interview availability, founder comments, extra images, and updated
              platform context for local or national stories.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href="mailto:press@quicktrade.co.nz"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors"
              >
                Contact media team
              </a>
              <Link
                href="/services"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-600 hover:border-slate-500 text-slate-200 font-semibold transition-colors"
              >
                Browse all services
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
