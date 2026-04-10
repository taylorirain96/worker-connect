import type { Metadata } from 'next'
import Link from 'next/link'
import Script from 'next/script'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

const BASE = 'https://quicktrade.co.nz'
const PAGE_URL = `${BASE}/reports/nz-home-services-price-index`

export const metadata: Metadata = {
  title: 'NZ Home Services Price Index 2026 | QuickTrade',
  description:
    'New Zealand home services pricing data for 2026. Average costs for plumbing, electrical, cleaning, and more — based on QuickTrade platform data.',
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'NZ Home Services Price Index 2026 | QuickTrade',
    description:
      'New Zealand home services pricing data for 2026. Average costs for plumbing, electrical, cleaning, and more.',
    url: PAGE_URL,
    type: 'article',
  },
}

const PRICE_DATA = [
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
    service: 'House Cleaning',
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

export default function NZPriceIndexPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'NZ Home Services Price Index 2026',
    description:
      'New Zealand home services pricing data for 2026. Average costs for plumbing, electrical, cleaning, and more — based on QuickTrade platform data.',
    url: PAGE_URL,
    author: {
      '@type': 'Organization',
      name: 'QuickTrade',
      url: BASE,
    },
    publisher: {
      '@type': 'Organization',
      name: 'QuickTrade',
      url: BASE,
    },
    datePublished: '2026-04-01',
    dateModified: '2026-04-10',
    about: {
      '@type': 'Thing',
      name: 'Home Services Pricing in New Zealand',
    },
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Script
        id="jsonld-price-index"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <p className="text-sm font-semibold text-primary-600 uppercase tracking-widest mb-3">
              Reports
            </p>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              NZ Home Services Price Index 2026
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Early Edition — April 2026
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              This index provides indicative pricing ranges for common home services across New
              Zealand, compiled from QuickTrade platform data and market research. Use it as a
              starting point when budgeting for home maintenance, repairs, or improvements.
            </p>
          </div>
        </section>

        <div className="max-w-3xl mx-auto px-4 py-12 space-y-10">
          {/* Methodology note */}
          <Card className="border-amber-300 dark:border-amber-600 bg-amber-50 dark:bg-amber-900/20">
            <CardHeader>
              <CardTitle className="text-amber-800 dark:text-amber-300">
                ⚠ Methodology &amp; Disclaimer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Prices shown are <strong>indicative ranges only</strong> based on early QuickTrade
                platform data and publicly available market information as at April 2026. Actual
                costs vary based on job complexity, materials, access, and individual provider
                rates. Always request quotes from multiple providers before committing.
              </p>
            </CardContent>
          </Card>

          {/* Price table */}
          <Card>
            <CardHeader>
              <CardTitle>Price Ranges by City</CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">
                      Service
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">
                      NZ Average
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">
                      Blenheim
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">
                      Auckland
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">
                      Wellington
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {PRICE_DATA.map((row, i) => (
                    <tr
                      key={row.service}
                      className={`border-b border-gray-100 dark:border-gray-800 ${
                        i % 2 === 0 ? '' : 'bg-gray-50/50 dark:bg-gray-800/30'
                      }`}
                    >
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                        {row.service}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{row.nzAvg}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{row.blenheim}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{row.auckland}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{row.wellington}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Share */}
          <Card>
            <CardHeader>
              <CardTitle>Share This Report</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Found this useful? Share it with homeowners, property managers, or anyone budgeting
                for home services in New Zealand.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 font-mono break-all">
                {PAGE_URL}
              </p>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Ready to get real quotes? Find trusted service providers on QuickTrade.
            </p>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition-colors"
            >
              Find Trusted Service Providers
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
