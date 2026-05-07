import type { Metadata } from 'next'
import Link from 'next/link'
import Script from 'next/script'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { SITE_URL } from '@/lib/seo/config'

export const metadata: Metadata = {
  title: 'About QuickTrade | New Zealand\'s Trusted Trade Marketplace',
  description:
    'Learn about QuickTrade — the platform connecting New Zealand homeowners and businesses with verified local tradespeople. Our mission, story, and values.',
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    title: 'About QuickTrade | New Zealand\'s Trusted Trade Marketplace',
    description:
      'Learn about QuickTrade — the platform connecting New Zealand homeowners and businesses with verified local tradespeople.',
    url: `${SITE_URL}/about`,
    type: 'website',
  },
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: 'QuickTrade',
  url: SITE_URL,
  logo: {
    '@type': 'ImageObject',
    url: `${SITE_URL}/logo.png`,
  },
  description:
    "New Zealand's trusted marketplace connecting homeowners and businesses with verified local tradespeople — plumbers, electricians, builders, cleaners and more.",
  foundingDate: '2024',
  areaServed: {
    '@type': 'Country',
    name: 'New Zealand',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'support@quicktrade.co.nz',
    contactType: 'customer support',
    availableLanguage: 'English',
    areaServed: 'NZ',
  },
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'About', item: `${SITE_URL}/about` },
  ],
}

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen luxury-bg">
      <Script
        id="jsonld-organization"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
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
              <span className="text-slate-300">About</span>
            </nav>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium mb-6">
              <span>🇳🇿</span>
              <span>Built for New Zealand</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
              About{' '}
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                QuickTrade
              </span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl">
              We&apos;re on a mission to make hiring trusted tradespeople in New Zealand fast, fair, and frustration-free.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="py-16 px-4 border-b border-slate-800">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Our Mission</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              QuickTrade exists to close the gap between New Zealand homeowners who need quality tradespeople and skilled
              tradies who deserve steady, well-paying work. Too often, kiwis struggle to find reliable help — and talented
              tradespeople waste time chasing leads rather than doing great work.
            </p>
            <p className="text-slate-300 leading-relaxed">
              We built QuickTrade to fix that. Post a job, receive quotes from verified local professionals, and hire with
              confidence — all in one place, without the guesswork.
            </p>
          </div>
        </section>

        {/* Founding Story */}
        <section className="py-16 px-4 border-b border-slate-800">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">The Founding Story</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                QuickTrade was founded in New Zealand by people who had seen firsthand how difficult it was to connect
                homeowners with trustworthy tradespeople. Whether it was a leaky pipe, an electrical upgrade, or a full
                renovation — finding someone reliable, affordable, and available was harder than it should be.
              </p>
              <p className="text-slate-300 leading-relaxed">
                We set out to build the platform that New Zealand needed: one focused on trust, transparency, and fair
                outcomes for both homeowners and the hardworking tradies who keep our homes running.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '12,000+', label: 'Active Workers' },
                { value: '45,000+', label: 'Jobs Completed' },
                { value: 'NZ Wide', label: 'Coverage' },
                { value: '4.8★', label: 'Avg Rating' },
              ].map(({ value, label }) => (
                <div
                  key={label}
                  className="rounded-xl bg-slate-900/60 border border-slate-700/50 p-6 text-center"
                >
                  <div className="text-2xl font-bold text-indigo-400 mb-1">{value}</div>
                  <div className="text-sm text-slate-400">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* NZ Focus */}
        <section className="py-16 px-4 border-b border-slate-800">
          <div className="max-w-4xl mx-auto">
            <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🇳🇿</span>
                <h2 className="text-2xl font-bold text-white">100% New Zealand Focus</h2>
              </div>
              <p className="text-slate-300 leading-relaxed">
                We aren&apos;t a global platform bolted onto the NZ market. QuickTrade was designed from day one for
                New Zealand — our cities, our regions, our trades, and our way of doing things. From Northland to
                Southland, we cover every region with local knowledge and genuine care for kiwi communities.
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 px-4 border-b border-slate-800">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-8">Our Values</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                {
                  icon: '🤝',
                  title: 'Trust',
                  description:
                    'Every worker on QuickTrade is reviewed by real employers. We verify credentials so you don\'t have to worry.',
                },
                {
                  icon: '🔍',
                  title: 'Transparency',
                  description:
                    'No hidden fees, no surprises. See real pricing upfront, read genuine reviews, and know exactly who you\'re hiring.',
                },
                {
                  icon: '💰',
                  title: 'Fair Pricing',
                  description:
                    'Our escrow payment system ensures tradies get paid fairly and homeowners only pay for work they\'re happy with.',
                },
              ].map(({ icon, title, description }) => (
                <div
                  key={title}
                  className="rounded-xl bg-slate-900/60 border border-slate-700/50 p-6"
                >
                  <div className="text-3xl mb-3">{icon}</div>
                  <h3 className="text-white font-semibold mb-2">{title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How we are different */}
        <section className="py-16 px-4 border-b border-slate-800">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-4">How QuickTrade is Different</h2>
            <p className="text-slate-400 leading-relaxed mb-8">
              There are other ways to find a tradie in New Zealand — word of mouth, Facebook groups, Google searches. But none of them offer the combination of verified professionals, real reviews, and secure payments all in one place.
            </p>
            <div className="space-y-4">
              {[
                {
                  heading: 'We verify identity — not just registration',
                  body: "Registering on QuickTrade is easy, but earning a verified badge requires identity confirmation. This means you're not just hiring someone with a profile — you're hiring someone who has been vetted.",
                },
                {
                  heading: 'Your money is protected before a shovel hits the ground',
                  body: "On QuickTrade, payment goes into escrow before work begins. Your money is held safely and only released when you confirm the job is done to your satisfaction. You'll never be left having paid upfront with no recourse.",
                },
                {
                  heading: 'Reviews cannot be bought or manipulated',
                  body: "Every review on a QuickTrade worker's profile was submitted by a homeowner or business that hired them through the platform. There's no way to buy reviews, import reviews from other sources, or remove legitimate ones.",
                },
                {
                  heading: 'Workers are incentivised to do great work',
                  body: "Our commission tier system means workers pay less as they grow — rewarding quality and consistency. Workers who build strong reputations earn more while paying lower rates, so everyone's interests are aligned.",
                },
              ].map(({ heading, body }) => (
                <div key={heading} className="rounded-xl bg-slate-900/60 border border-slate-700/50 p-6">
                  <h3 className="text-white font-semibold mb-2">{heading}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* NZ Regions */}
        <section className="py-16 px-4 border-b border-slate-800">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-4">Available Across All of New Zealand</h2>
            <p className="text-slate-400 leading-relaxed mb-8">
              QuickTrade is not limited to the major cities. We have verified tradespeople available in every region of New Zealand, from Northland to Southland.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {[
                'Auckland', 'Wellington', 'Christchurch', 'Hamilton', 'Tauranga',
                'Dunedin', 'Palmerston North', 'Nelson', 'Queenstown', 'Rotorua',
                'New Plymouth', 'Whangarei', 'Invercargill', 'Napier', 'Hastings',
                'Whanganui', 'Gisborne', 'Blenheim', 'Masterton', 'Greymouth',
              ].map((city) => (
                <div
                  key={city}
                  className="rounded-lg bg-slate-900/60 border border-slate-700/50 px-3 py-2 text-sm text-slate-300 text-center"
                >
                  {city}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 px-4 border-b border-slate-800">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-8">What our users say</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                {
                  quote: "Found a plumber within two hours of posting my job. He turned up on time, fixed the problem, and the payment was handled so smoothly through the app. Will definitely use QuickTrade again.",
                  name: 'Sarah M.',
                  location: 'Auckland',
                  role: 'Homeowner',
                },
                {
                  quote: "As an electrician I was skeptical, but the jobs on QuickTrade are genuine and the escrow payment means I always get paid. My schedule has been full since I joined.",
                  name: 'James K.',
                  location: 'Wellington',
                  role: 'Electrician',
                },
                {
                  quote: "The verified badge made all the difference. Clients trust me more and I win more quotes because of it. The commission drops as you complete more jobs, which is a great incentive.",
                  name: 'Tom R.',
                  location: 'Christchurch',
                  role: 'Builder',
                },
              ].map(({ quote, name, location, role }) => (
                <div key={name} className="rounded-xl bg-slate-900/60 border border-slate-700/50 p-6">
                  <p className="text-slate-300 text-sm leading-relaxed mb-4 italic">&quot;{quote}&quot;</p>
                  <div>
                    <p className="text-white text-sm font-semibold">{name}</p>
                    <p className="text-slate-500 text-xs">{role} · {location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 px-4 border-b border-slate-800">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-8">Common Questions About QuickTrade</h2>
            <div className="space-y-4">
              {[
                {
                  q: 'Who is QuickTrade for?',
                  a: 'QuickTrade is for two groups: homeowners and businesses who need trusted tradespeople for home repairs, renovations, and maintenance; and qualified tradespeople and workers who want a steady supply of paid work without the hassle of chasing leads.',
                },
                {
                  q: 'Is QuickTrade only for big jobs?',
                  a: 'Not at all. QuickTrade is used for everything from small repairs (like fixing a leaking tap or patching a wall) to large renovations and full commercial builds. If a job requires a skilled professional, QuickTrade can help.',
                },
                {
                  q: 'How does QuickTrade make money?',
                  a: 'QuickTrade charges workers a small commission on each completed job — starting at 18% for new workers and decreasing to 10% as they complete more jobs. Homeowners and businesses pay nothing to post jobs or use the platform.',
                },
                {
                  q: 'Is my personal information safe?',
                  a: "Yes. QuickTrade takes privacy and security seriously. We use industry-standard encryption and never sell your personal information. Payment information is handled via Stripe, a PCI-compliant payment processor.",
                },
                {
                  q: 'How do I get started?',
                  a: 'Simply create a free account, describe what you need, and post your job — it takes less than five minutes. Verified tradespeople in your area will send quotes, and you can compare and hire with confidence.',
                },
              ].map(({ q, a }) => (
                <div key={q} className="rounded-xl bg-slate-900/60 border border-slate-700/50 p-6">
                  <h3 className="text-white font-semibold mb-2">{q}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="pb-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-10 text-center">
              <p className="text-slate-300 font-semibold mb-2">Ready to join QuickTrade?</p>
              <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
                Whether you need a tradie or you are one, get started for free today.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/auth/register"
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
                >
                  Create Free Account
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full border border-slate-700 hover:border-indigo-500/50 text-slate-300 hover:text-white text-sm font-semibold transition-colors"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
