import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { SITE_URL } from '@/lib/seo/config'

export const metadata: Metadata = {
  title: 'Press & Media | QuickTrade',
  description:
    "QuickTrade press resources, founder story, brand assets, and media contact. New Zealand's trusted services marketplace, founded in Blenheim.",
  alternates: {
    canonical: `${SITE_URL}/press`,
  },
}

export default function PressPage() {
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
              <span>📰</span>
              <span>Press &amp; Media</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
              QuickTrade{' '}
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                in the Press
              </span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Media resources, brand assets, and press contacts for journalists and content creators.
            </p>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            {/* About */}
            <div className="rounded-2xl bg-slate-900/70 border border-slate-700/50 p-8">
              <h2 className="text-2xl font-bold text-white mb-4">About QuickTrade</h2>
              <p className="text-slate-400 leading-relaxed">
                QuickTrade is New Zealand&apos;s trusted marketplace for local services and skilled
                trades. Founded in Blenheim, Marlborough, we connect verified tradespeople with
                homeowners and businesses across NZ. Our platform makes it easy to post a job,
                receive multiple quotes, compare reviews, and hire with confidence.
              </p>
            </div>

            {/* Founder story */}
            <div className="rounded-2xl bg-slate-900/70 border border-slate-700/50 p-8">
              <h2 className="text-2xl font-bold text-white mb-4">Founder Story</h2>
              <p className="text-slate-400 leading-relaxed">
                Founded in Blenheim, New Zealand, QuickTrade was built to solve a real problem:
                finding reliable local tradespeople in NZ is still mostly word-of-mouth. Whether
                you need a plumber in Blenheim or an electrician in Auckland, the process of
                finding someone trustworthy has barely changed in decades. We&apos;re changing
                that — starting right here in Marlborough, and expanding across New Zealand.
              </p>
            </div>

            {/* Key stats */}
            <div className="rounded-2xl bg-slate-900/70 border border-slate-700/50 p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Key Stats <span className="text-sm font-normal text-slate-500">(as of launch)</span></h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-indigo-400">17+</p>
                  <p className="text-slate-400 text-sm mt-1">Services available</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-indigo-400">10</p>
                  <p className="text-slate-400 text-sm mt-1">NZ regions covered</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-indigo-400 text-sm">quicktrade.co.nz</p>
                  <p className="text-slate-400 text-sm mt-1">Platform</p>
                </div>
              </div>
            </div>

            {/* Brand assets */}
            <div className="rounded-2xl bg-slate-900/70 border border-slate-700/50 p-8">
              <h2 className="text-2xl font-bold text-white mb-4">Brand Assets</h2>
              <p className="text-slate-400">
                For logo files and brand guidelines, email{' '}
                <a
                  href="mailto:press@quicktrade.co.nz"
                  className="text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  press@quicktrade.co.nz
                </a>
              </p>
            </div>

            {/* Press contact */}
            <div className="rounded-2xl bg-slate-900/70 border border-slate-700/50 p-8">
              <h2 className="text-2xl font-bold text-white mb-4">Press Contact</h2>
              <p className="text-slate-400">
                Media enquiries:{' '}
                <a
                  href="mailto:press@quicktrade.co.nz"
                  className="text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  press@quicktrade.co.nz
                </a>
              </p>
            </div>

            {/* As seen in */}
            <div className="rounded-2xl bg-slate-900/70 border border-slate-700/50 p-8">
              <h2 className="text-2xl font-bold text-white mb-4">As Seen In</h2>
              <p className="text-slate-500 italic">
                Coverage coming soon — contact us to arrange an interview:{' '}
                <a
                  href="mailto:press@quicktrade.co.nz"
                  className="text-indigo-400 hover:text-indigo-300 transition-colors not-italic"
                >
                  press@quicktrade.co.nz
                </a>
              </p>
            </div>

            {/* Back to services */}
            <div className="text-center">
              <Link
                href="/services"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors"
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
