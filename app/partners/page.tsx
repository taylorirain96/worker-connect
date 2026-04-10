import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { CheckCircle, Award, RefreshCw } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Partner with QuickTrade | QuickTrade NZ',
  description:
    "Become a QuickTrade partner. Get listed on New Zealand's trusted services marketplace and earn a verified partner badge for your website.",
  alternates: { canonical: 'https://quicktrade.co.nz/partners' },
}

export default function PartnersPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-16 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-sm font-semibold text-primary-600 uppercase tracking-widest mb-3">
              Partners
            </p>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Become a QuickTrade Partner
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Join New Zealand&rsquo;s trusted services network. We partner with property managers,
              trade suppliers, and local businesses across Marlborough, Nelson, Wellington, and
              beyond.
            </p>
          </div>
        </section>

        <div className="max-w-3xl mx-auto px-4 py-12 space-y-10">
          {/* Benefits */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Partner Benefits
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  icon: CheckCircle,
                  title: 'Free Partner Listing',
                  desc: 'Get your business listed on QuickTrade at no cost — visible to thousands of homeowners and businesses across NZ.',
                },
                {
                  icon: Award,
                  title: 'Verified Partner Badge',
                  desc: "Display the QuickTrade Verified Partner badge on your website, email signature, and marketing materials.",
                },
                {
                  icon: RefreshCw,
                  title: 'Mutual Referrals',
                  desc: 'We send job leads your way; you refer your clients to QuickTrade for services outside your scope.',
                },
              ].map((b) => (
                <Card key={b.title} padding="sm">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-1">
                      <b.icon className="h-5 w-5 text-primary-600" />
                      <CardTitle className="text-sm">{b.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{b.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* How it works */}
          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                {[
                  { step: '1', text: 'Apply via email — tell us about your business and the services or referrals you can offer.' },
                  { step: '2', text: "We review your application and set up a free listing on QuickTrade within 5 business days." },
                  { step: '3', text: 'Once approved, download your Verified Partner Badge and embed it on your website.' },
                ].map((item) => (
                  <li key={item.step} className="flex gap-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 flex items-center justify-center text-sm font-bold">
                      {item.step}
                    </span>
                    <p className="text-gray-700 dark:text-gray-300 text-sm pt-1">{item.text}</p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {/* Badge preview */}
          <Card>
            <CardHeader>
              <CardTitle>Partner Badge Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="inline-flex items-center gap-3 px-5 py-3 rounded-xl border-2 border-primary-600 bg-white dark:bg-gray-900 shadow-sm mb-4">
                <Award className="h-7 w-7 text-primary-600" />
                <div>
                  <p className="text-xs font-bold text-primary-600 uppercase tracking-wide">
                    Verified Partner
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">QuickTrade NZ</p>
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Embed code for your website:
              </p>
              <pre className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-xs text-gray-700 dark:text-gray-300 overflow-x-auto whitespace-pre-wrap">
                {`<!-- QuickTrade Verified Partner Badge -->
<a href="https://quicktrade.co.nz/partners" target="_blank" rel="noopener">
  <img src="https://quicktrade.co.nz/badge-partner.png"
       alt="QuickTrade Verified Partner"
       width="200" height="60" />
</a>`}
              </pre>
            </CardContent>
          </Card>

          {/* Target partners note */}
          <Card>
            <CardHeader>
              <CardTitle>Who We Partner With</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>🏠 Property managers and real estate agencies (especially Marlborough &amp; Nelson)</li>
                <li>🔨 Trade suppliers, hardware stores, and building merchants</li>
                <li>🏢 Local businesses that regularly need home or commercial services</li>
                <li>🌿 Lifestyle block owners and rural property managers in NZ</li>
              </ul>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="text-center space-y-3">
            <a href="mailto:partners@quicktrade.co.nz">
              <Button size="lg">Apply to Become a Partner</Button>
            </a>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Email:{' '}
              <a href="mailto:partners@quicktrade.co.nz" className="text-primary-600 hover:underline">
                partners@quicktrade.co.nz
              </a>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
