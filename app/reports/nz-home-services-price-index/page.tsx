import type { Metadata } from 'next'
import Link from 'next/link'
import Script from 'next/script'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'NZ Home Services Price Index 2026 | QuickTrade',
  description:
    'New Zealand home services pricing data for 2026. Average costs for plumbing, electrical, cleaning, and more — based on QuickTrade platform data.',
  alternates: {
    canonical: 'https://quicktrade.co.nz/reports/nz-home-services-price-index',
  },
}

const priceData = [
  {
    service: 'Plumbing (hourly)',
    nzAvg: '$90–$150/hr',
    blenheim: '$85–$130/hr',
    auckland: '$100–$160/hr',
    wellington: '$95–$155/hr',
  },
  {
    service: 'Electrical (hourly)',
    nzAvg: '$95–$160/hr',
    blenheim: '$90–$140/hr',
    auckland: '$110–$170/hr',
    wellington: '$100–$165/hr',
  },
  {
    service: 'House Cleaning (per session)',
    nzAvg: '$80–$180',
    blenheim: '$75–$150',
    auckland: '$90–$200',
    wellington: '$85–$190',
  },
  {
    service: 'Heat Pump Install',
    nzAvg: '$1,800–$3,500',
    blenheim: '$1,700–$3,200',
    auckland: '$2,000–$4,000',
    wellington: '$1,900–$3,800',
  },
  {
    service: 'Lawn Mowing',
    nzAvg: '$60–$150',
    blenheim: '$55–$130',
    auckland: '$70–$170',
    wellington: '$65–$160',
  },
  {
    service: 'Rubbish Removal',
    nzAvg: '$150–$400',
    blenheim: '$140–$350',
    auckland: '$180–$450',
    wellington: '$160–$420',
  },
  {
    service: 'Painting (per room)',
    nzAvg: '$300–$700',
    blenheim: '$280–$650',
    auckland: '$350–$800',
    wellington: '$320–$750',
  },
  {
    service: 'Roof Repair',
    nzAvg: '$500–$2,500',
    blenheim: '$450–$2,200',
    auckland: '$600–$3,000',
    wellington: '$550–$2,800',
  },
]

const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Report',
  name: 'NZ Home Services Price Index 2026',
  description:
    'New Zealand home services pricing data for 2026. Average costs for plumbing, electrical, cleaning, and more — based on QuickTrade platform data.',
  url: 'https://quicktrade.co.nz/reports/nz-home-services-price-index',
  datePublished: '2026-04-01',
  publisher: {
    '@type': 'Organization',
    name: 'QuickTrade',
    url: 'https://quicktrade.co.nz',
  },
}

export default function PriceIndexPage() {
  const shareUrl = 'https://quicktrade.co.nz/reports/nz-home-services-price-index'
  const shareText = 'NZ Home Services Price Index 2026 — average costs for plumbing, electrical, cleaning and more from QuickTrade'

  return (
    <div className="flex flex-col min-h-screen luxury-bg">
      <Script
        id="jsonld-report"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section
          className="relative overflow-hidden py-20 px-4"
          style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #111827 60%, #0a0f1e 100%)' }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium mb-6">
              <span>📊</span>
              <span>QuickTrade Research</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3 tracking-tight">
              NZ Home Services{' '}
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                Price Index 2026
              </span>
            </h1>
            <p className="text-slate-400 text-lg">
              Early Edition — based on QuickTrade platform data as at April 2026
            </p>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto space-y-10">
            {/* Intro */}
            <div className="rounded-2xl bg-slate-900/70 border border-slate-700/50 p-8">
              <p className="text-slate-300 leading-relaxed">
                Understanding what home services cost in New Zealand can be difficult. QuickTrade
                has compiled this early price index from jobs posted and quoted on our platform to
                give homeowners a transparent starting point. Prices vary by region, job complexity,
                and urgency — always get multiple quotes before committing.
              </p>
            </div>

            {/* Methodology */}
            <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-6">
              <div className="flex items-start gap-3">
                <span className="text-xl shrink-0">⚠️</span>
                <div>
                  <p className="font-semibold text-amber-300 mb-1">Methodology Note</p>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    This is an early-stage index based on a limited sample of QuickTrade platform
                    data. Figures represent indicative ranges only and will be updated as more data
                    is collected. Always get multiple quotes.
                  </p>
                </div>
              </div>
            </div>

            {/* Price table */}
            <div className="rounded-2xl bg-slate-900/70 border border-slate-700/50 overflow-hidden">
              <div className="p-6 border-b border-slate-700/50">
                <h2 className="text-xl font-bold text-white">Indicative Price Ranges</h2>
                <p className="text-slate-500 text-sm mt-1">
                  All figures are indicative only. Actual prices may vary.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700/50">
                      <th className="text-left p-4 text-slate-300 font-semibold whitespace-nowrap">Service</th>
                      <th className="text-left p-4 text-slate-300 font-semibold whitespace-nowrap">NZ Average</th>
                      <th className="text-left p-4 text-slate-300 font-semibold whitespace-nowrap">Blenheim/Marlborough</th>
                      <th className="text-left p-4 text-slate-300 font-semibold whitespace-nowrap">Auckland</th>
                      <th className="text-left p-4 text-slate-300 font-semibold whitespace-nowrap">Wellington</th>
                    </tr>
                  </thead>
                  <tbody>
                    {priceData.map((row, i) => (
                      <tr
                        key={row.service}
                        className={`border-b border-slate-800/50 ${i % 2 === 0 ? 'bg-slate-900/30' : ''}`}
                      >
                        <td className="p-4 text-slate-200 font-medium whitespace-nowrap">{row.service}</td>
                        <td className="p-4 text-slate-300">{row.nzAvg}</td>
                        <td className="p-4 text-slate-400">{row.blenheim}</td>
                        <td className="p-4 text-slate-400">{row.auckland}</td>
                        <td className="p-4 text-slate-400">{row.wellington}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Share */}
            <div className="rounded-2xl bg-slate-900/70 border border-slate-700/50 p-6">
              <h2 className="text-lg font-bold text-white mb-4">Share this report</h2>
              <div className="flex flex-wrap gap-3">
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-sm hover:border-indigo-500/50 hover:text-white transition-all"
                >
                  Share on X (Twitter)
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-sm hover:border-indigo-500/50 hover:text-white transition-all"
                >
                  Share on LinkedIn
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-sm hover:border-indigo-500/50 hover:text-white transition-all"
                >
                  Share on Facebook
                </a>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center">
              <p className="text-slate-400 mb-4">Find trusted service providers on QuickTrade</p>
              <Link
                href="/services"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-lg transition-colors"
              >
                Browse All Services
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
