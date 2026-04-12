import type { Metadata } from 'next'
import Link from 'next/link'
import Script from 'next/script'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { SITE_URL } from '@/lib/seo/config'

export const metadata: Metadata = {
  title: 'Contact QuickTrade | Get in Touch',
  description:
    'Contact the QuickTrade team. Reach us by email, use our contact form, or find us on social media. We\'re here to help with any questions about our platform.',
  alternates: { canonical: `${SITE_URL}/contact` },
  openGraph: {
    title: 'Contact QuickTrade | Get in Touch',
    description:
      'Contact the QuickTrade team. Reach us by email, use our contact form, or find us on social media.',
    url: `${SITE_URL}/contact`,
    type: 'website',
  },
}

const contactPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'Contact QuickTrade',
  url: `${SITE_URL}/contact`,
  description: 'Contact page for QuickTrade — New Zealand\'s trusted trade marketplace.',
  publisher: {
    '@type': 'Organization',
    name: 'QuickTrade',
    url: SITE_URL,
    email: 'support@quicktrade.co.nz',
  },
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Contact', item: `${SITE_URL}/contact` },
  ],
}

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen luxury-bg">
      <Script
        id="jsonld-contact-page"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageJsonLd) }}
      />
      <Script
        id="jsonld-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section
          className="relative overflow-hidden py-20 px-4"
          style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #111827 60%, #0a0f1e 100%)' }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(99,102,241,0.18) 0%, transparent 70%)' }}
          />
          <div className="relative max-w-4xl mx-auto">
            <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
              <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
              <span>/</span>
              <span className="text-slate-300">Contact</span>
            </nav>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium mb-6">
              <span>💬</span>
              <span>We&apos;re here to help</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
              Get in{' '}
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                Touch
              </span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl">
              Have a question, suggestion, or need support? We&apos;d love to hear from you. Our team typically responds within one business day.
            </p>
          </div>
        </section>

        {/* Contact Grid */}
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-xl font-bold text-white mb-6">Send us a message</h2>
              <form className="space-y-5" aria-label="Contact form">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1.5">
                    Full name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    placeholder="Your full name"
                    className="w-full rounded-xl bg-slate-900/70 border border-slate-700/60 px-4 py-3 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="you@example.com"
                    className="w-full rounded-xl bg-slate-900/70 border border-slate-700/60 px-4 py-3 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-1.5">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    required
                    placeholder="How can we help you?"
                    className="w-full rounded-xl bg-slate-900/70 border border-slate-700/60 px-4 py-3 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Details */}
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-bold text-white mb-6">Contact details</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-5 rounded-xl bg-slate-900/60 border border-slate-700/50">
                    <div className="shrink-0 h-10 w-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-xl">
                      📧
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-300 mb-0.5">Email</p>
                      <a
                        href="mailto:support@quicktrade.co.nz"
                        className="text-indigo-400 hover:text-indigo-300 transition-colors text-sm"
                      >
                        support@quicktrade.co.nz
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-5 rounded-xl bg-slate-900/60 border border-slate-700/50">
                    <div className="shrink-0 h-10 w-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-xl">
                      📍
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-300 mb-0.5">Location</p>
                      <p className="text-slate-400 text-sm">New Zealand (remote-first team)</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-5 rounded-xl bg-slate-900/60 border border-slate-700/50">
                    <div className="shrink-0 h-10 w-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-xl">
                      ⏱
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-300 mb-0.5">Response time</p>
                      <p className="text-slate-400 text-sm">Usually within 1 business day</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social */}
              <div>
                <h3 className="text-base font-semibold text-white mb-4">Follow us</h3>
                <div className="flex flex-wrap gap-3">
                  {[
                    { label: 'Facebook', href: 'https://facebook.com/quicktradenz', icon: '📘' },
                    { label: 'Instagram', href: 'https://instagram.com/quicktradenz', icon: '📸' },
                    { label: 'LinkedIn', href: 'https://linkedin.com/company/quicktradenz', icon: '💼' },
                  ].map(({ label, href, icon }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/60 border border-slate-700/50 hover:border-indigo-500/40 text-slate-300 hover:text-white text-sm transition-all"
                    >
                      <span>{icon}</span>
                      {label}
                    </a>
                  ))}
                </div>
              </div>

              {/* Quick links */}
              <div>
                <h3 className="text-base font-semibold text-white mb-4">Quick links</h3>
                <div className="space-y-2">
                  {[
                    { label: 'About QuickTrade', href: '/about' },
                    { label: 'How It Works', href: '/how-it-works' },
                    { label: 'Browse Services', href: '/services' },
                  ].map(({ label, href }) => (
                    <Link
                      key={label}
                      href={href}
                      className="flex items-center gap-2 text-sm text-slate-400 hover:text-indigo-400 transition-colors"
                    >
                      <span className="text-indigo-500">›</span>
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
