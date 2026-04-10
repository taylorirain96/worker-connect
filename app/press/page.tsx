import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

export const metadata: Metadata = {
  title: 'Press & Media | QuickTrade',
  description:
    "QuickTrade press resources, founder story, brand assets, and media contact. New Zealand's trusted services marketplace, founded in Blenheim.",
  alternates: { canonical: 'https://quicktrade.co.nz/press' },
}

export default function PressPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-16 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-sm font-semibold text-primary-600 uppercase tracking-widest mb-3">
              Press &amp; Media
            </p>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              QuickTrade in the Press
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Resources for journalists, bloggers, and media professionals covering the New Zealand
              trades and home services sector.
            </p>
          </div>
        </section>

        <div className="max-w-3xl mx-auto px-4 py-12 space-y-10">
          {/* About */}
          <Card>
            <CardHeader>
              <CardTitle>About QuickTrade</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                QuickTrade is New Zealand&rsquo;s trusted marketplace for home services — connecting
                homeowners and businesses with verified local tradespeople and service providers.
                We make it easy to find, compare, and hire qualified professionals across plumbing,
                electrical, cleaning, landscaping, and 13 other services. QuickTrade operates
                across 10 NZ cities and regions, with a focus on quality, transparency, and
                community trust.
              </p>
            </CardContent>
          </Card>

          {/* Founder story */}
          <Card>
            <CardHeader>
              <CardTitle>Founder Story</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Founded in Blenheim, New Zealand — QuickTrade was built to solve a real local
                problem: finding reliable tradespeople in NZ is still mostly word-of-mouth. We&rsquo;re
                changing that. Starting from Marlborough and expanding across the country,
                QuickTrade gives every Kiwi access to trusted local professionals — no matter where
                they live.
              </p>
            </CardContent>
          </Card>

          {/* Key stats */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              QuickTrade at a Glance
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: '17+ Services', sub: 'From plumbing to car detailing' },
                { label: '10 NZ Regions', sub: 'Auckland to Queenstown' },
                { label: 'quicktrade.co.nz', sub: 'Our home on the web' },
              ].map((stat) => (
                <Card key={stat.label} padding="sm">
                  <CardContent>
                    <p className="text-2xl font-bold text-primary-600 mb-1">{stat.label}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{stat.sub}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Brand assets */}
          <Card>
            <CardHeader>
              <CardTitle>Brand Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                For logo files, brand guidelines, and high-resolution imagery, please contact our
                press team.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Email:{' '}
                <a
                  href="mailto:press@quicktrade.co.nz"
                  className="text-primary-600 hover:underline"
                >
                  press@quicktrade.co.nz
                </a>
              </p>
            </CardContent>
          </Card>

          {/* As seen in */}
          <Card>
            <CardHeader>
              <CardTitle>As Seen In</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 dark:text-gray-400 italic text-sm">
                Media coverage coming soon. If you&rsquo;re a journalist covering NZ home services,
                technology, or local business — we&rsquo;d love to talk.{' '}
                <a href="mailto:press@quicktrade.co.nz" className="text-primary-600 hover:underline">
                  Get in touch
                </a>
                .
              </p>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="text-center">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition-colors"
            >
              Explore Our Services
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
