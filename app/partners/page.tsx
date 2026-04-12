import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { SITE_URL } from '@/lib/seo/config'

export const metadata: Metadata = {
  title: 'Partner with QuickTrade | QuickTrade NZ',
  description:
    "Become a QuickTrade partner. Get listed on New Zealand's trusted services marketplace and earn a verified partner badge for your website.",
  alternates: {
    canonical: `${SITE_URL}/partners`,
  },
}

export default function PartnersPage() {
  const embedCode = `<a href="https://quicktrade.co.nz">
  <img src="https://quicktrade.co.nz/partner-badge.png" alt="QuickTrade Verified Partner">
</a>`

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
              <span>🤝</span>
              <span>Partner Programme</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
              Become a{' '}
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                QuickTrade Partner
              </span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Join New Zealand&apos;s trusted services marketplace and grow your business through
              mutual referrals and verified exposure.
            </p>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto space-y-12">
            {/* Benefits */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Partnership Benefits</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="rounded-2xl bg-slate-900/70 border border-slate-700/50 p-6">
                  <div className="text-3xl mb-3">📋</div>
                  <h3 className="text-lg font-semibold text-white mb-2">Free Partner Listing</h3>
                  <p className="text-slate-400 text-sm">
                    Your business featured on the QuickTrade partners page — visible to thousands
                    of NZ homeowners and businesses.
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-900/70 border border-slate-700/50 p-6">
                  <div className="text-3xl mb-3">🛡️</div>
                  <h3 className="text-lg font-semibold text-white mb-2">Verified Partner Badge</h3>
                  <p className="text-slate-400 text-sm">
                    Embed our badge on your website to show customers you&apos;re a verified
                    QuickTrade partner.
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-900/70 border border-slate-700/50 p-6">
                  <div className="text-3xl mb-3">🔄</div>
                  <h3 className="text-lg font-semibold text-white mb-2">Mutual Referrals</h3>
                  <p className="text-slate-400 text-sm">
                    We refer customers your way, and you refer customers to us. A simple win-win
                    for both businesses.
                  </p>
                </div>
              </div>
            </div>

            {/* How it works */}
            <div className="rounded-2xl bg-slate-900/70 border border-slate-700/50 p-8">
              <h2 className="text-2xl font-bold text-white mb-6">How It Works</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  { step: '1', title: 'Apply', desc: 'Email partners@quicktrade.co.nz with your business details.' },
                  { step: '2', title: 'Get Listed', desc: "We'll review your application and add you to our partners page." },
                  { step: '3', title: 'Embed Badge', desc: 'Download the partner badge and add it to your website.' },
                ].map(({ step, title, desc }) => (
                  <div key={step} className="flex items-start gap-4">
                    <div className="shrink-0 w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                      {step}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{title}</p>
                      <p className="text-slate-400 text-sm mt-1">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Badge preview */}
            <div className="rounded-2xl bg-slate-900/70 border border-slate-700/50 p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Partner Badge Preview</h2>
              <div className="flex flex-col sm:flex-row items-start gap-8">
                <div className="inline-flex items-center gap-3 px-6 py-4 rounded-xl border-2 border-indigo-500 bg-indigo-500/10">
                  <span className="text-2xl">🛡️</span>
                  <div>
                    <p className="font-bold text-white text-sm">QuickTrade</p>
                    <p className="text-indigo-400 text-xs font-semibold tracking-wide uppercase">
                      Verified Partner
                    </p>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-400 mb-2">Embed code (copy &amp; paste):</p>
                  <pre className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-xs text-slate-300 overflow-x-auto whitespace-pre-wrap break-all">
                    {embedCode}
                  </pre>
                </div>
              </div>
            </div>

            {/* Target partners */}
            <div className="rounded-2xl bg-indigo-500/10 border border-indigo-500/30 p-8">
              <p className="text-slate-300">
                <span className="font-semibold text-white">Who we&apos;re looking for: </span>
                We&apos;re especially looking for property managers, trade suppliers, and local
                businesses in Marlborough, Nelson, and Wellington.
              </p>
            </div>

            {/* CTA */}
            <div className="text-center">
              <a
                href="mailto:partners@quicktrade.co.nz"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-lg transition-colors"
              >
                Apply to Become a Partner
              </a>
              <p className="text-slate-500 text-sm mt-3">
                Email us at{' '}
                <a href="mailto:partners@quicktrade.co.nz" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                  partners@quicktrade.co.nz
                </a>
              </p>
            </div>

            <div className="text-center">
              <Link href="/services" className="text-slate-400 hover:text-white transition-colors text-sm">
                ← Browse all services
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
