import type { Metadata } from 'next'
import Link from 'next/link'
import Script from 'next/script'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { SITE_URL } from '@/lib/seo/config'

export const metadata: Metadata = {
  title: 'Help Centre | QuickTrade',
  description:
    'Get answers to common questions about using QuickTrade. Find help for posting jobs, hiring workers, payments, accounts, and more.',
  alternates: { canonical: `${SITE_URL}/help` },
  openGraph: {
    title: 'Help Centre | QuickTrade',
    description:
      'Get answers to common questions about using QuickTrade. Find help for posting jobs, hiring workers, payments, and accounts.',
    url: `${SITE_URL}/help`,
    type: 'website',
  },
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How do I post a job on QuickTrade?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Click "Post a Job" in the navigation bar. Describe your project, set your budget, choose your location, and submit. Workers will send you quotes within minutes.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does payment work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'QuickTrade uses a secure escrow system. You pay upfront and funds are held safely until the job is complete and you approve the work. Then the worker is paid automatically.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I become a verified worker?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Go to your worker dashboard and click "Get Verified". Upload a government-issued photo ID. Our team reviews submissions within 1–2 business days.',
      },
    },
    {
      '@type': 'Question',
      name: 'What happens if I\'m not happy with the work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You can raise a dispute through the Platform before releasing payment. Our team will review the situation and mediate a fair resolution between you and the worker.',
      },
    },
  ],
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Help Centre', item: `${SITE_URL}/help` },
  ],
}

type FaqItem = { q: string; a: string }

const categories: { id: string; icon: string; title: string; faqs: FaqItem[] }[] = [
  {
    id: 'getting-started',
    icon: '🚀',
    title: 'Getting Started',
    faqs: [
      {
        q: 'What is QuickTrade?',
        a: 'QuickTrade is New Zealand\'s trusted marketplace for connecting homeowners with verified local tradespeople. Whether you need a plumber, electrician, builder, or cleaner — QuickTrade makes it fast, safe, and easy.',
      },
      {
        q: 'How do I create an account?',
        a: 'Click "Sign Up" and choose whether you\'re a homeowner or a tradesperson. You can sign up with your email address or with a Google account. It only takes a minute.',
      },
      {
        q: 'Is QuickTrade available across New Zealand?',
        a: 'Yes — QuickTrade supports all major NZ regions including Auckland, Wellington, Christchurch, Hamilton, Tauranga, Dunedin, and more.',
      },
      {
        q: 'Is there a free plan?',
        a: 'Yes. Homeowners can post one job and view worker profiles for free. Workers can apply for jobs and build their profile at no cost. Optional premium plans unlock additional features.',
      },
    ],
  },
  {
    id: 'posting-jobs',
    icon: '📋',
    title: 'Posting Jobs',
    faqs: [
      {
        q: 'How do I post a job?',
        a: 'Click "Post a Job" from the navigation bar or your dashboard. Describe the work needed, set your budget (fixed price or hourly), add photos if helpful, and choose your location. Your job goes live immediately.',
      },
      {
        q: 'Can I edit a job after posting it?',
        a: 'Yes — you can edit job details while the job is still open. Go to your job in the homeowner dashboard and click Edit.',
      },
      {
        q: 'How do I choose between quotes?',
        a: 'You\'ll receive quotes from interested workers. You can view each worker\'s profile, ratings, reviews, trade licences, and portfolio before deciding. Our comparison view lets you evaluate quotes side by side.',
      },
      {
        q: 'What are Job Templates?',
        a: 'Job Templates let you save common job types (like "annual heat pump service") so you can repost them quickly in future. Find them in your homeowner dashboard under Templates.',
      },
      {
        q: 'Can I request a specific worker?',
        a: 'Yes — you can send a Direct Job Request to any worker you\'ve favourited or previously worked with. Go to their profile or your Favourites list and click "Send Direct Request".',
      },
    ],
  },
  {
    id: 'payments',
    icon: '💳',
    title: 'Payments & Escrow',
    faqs: [
      {
        q: 'How does the escrow payment system work?',
        a: 'When you accept a quote, you fund the job escrow via Stripe. The money is held securely until the job is complete and you approve the work. Once you release payment, the worker is paid automatically (minus the platform commission).',
      },
      {
        q: 'When does the worker get paid?',
        a: 'The worker receives payment once you mark the job as complete and approve it. For milestone-based jobs, each milestone is paid out separately as it is approved.',
      },
      {
        q: 'What are the platform fees?',
        a: 'QuickTrade charges workers a 5% platform commission, deducted automatically at payment release. Homeowners pay no transaction fees. All prices include 15% GST.',
      },
      {
        q: 'What payment methods are accepted?',
        a: 'We accept all major credit and debit cards (Visa, Mastercard, Amex) via Stripe. Bank transfer (BACS) is also available for larger jobs.',
      },
      {
        q: 'Can I get a refund?',
        a: 'If a job is cancelled before work starts, the escrow is refunded minus any processing fees. If there\'s a dispute about completed work, our team will review and determine the appropriate resolution.',
      },
      {
        q: 'Are there promo codes?',
        a: 'Yes — QuickTrade occasionally issues promo codes. Enter your code at the payment step. You can also earn platform credits through our referral programme.',
      },
    ],
  },
  {
    id: 'workers',
    icon: '🔨',
    title: 'For Workers',
    faqs: [
      {
        q: 'How do I get more job leads?',
        a: 'Complete your profile (photo, bio, skills, trade licences, portfolio), get verified, and earn positive reviews. Verified workers with strong profiles appear higher in search results. You can also turn on "Available Now" to show you\'re ready for work.',
      },
      {
        q: 'How do I get verified?',
        a: 'Go to your worker dashboard and click "Verify Identity". Upload a valid NZ Driver\'s Licence or Passport. Our team reviews submissions within 1–2 business days.',
      },
      {
        q: 'How do I add my trade licences?',
        a: 'In your worker dashboard, go to "Trade Licences". Upload certificates for any trade licences you hold (LBP, Electrical, Plumbing, Gas, etc.). These display as badges on your public profile.',
      },
      {
        q: 'Can I offer fixed-price service packages?',
        a: 'Yes — go to "Service Packages" in your worker dashboard to create packages (e.g. "Heat Pump Service — $150 fixed"). Homeowners can book these directly from your profile.',
      },
      {
        q: 'How does worker availability work?',
        a: 'Set your weekly availability in the "Availability" section of your dashboard. You can also toggle "Available Now" on or off from your dashboard header to show live availability to homeowners.',
      },
      {
        q: 'How do I set up payouts?',
        a: 'Go to "Payout Setup" in your worker dashboard to connect your bank account via Stripe Connect. You\'ll need your NZ bank account and IRD number. Payouts are processed within 2–5 business days of job approval.',
      },
    ],
  },
  {
    id: 'safety-trust',
    icon: '🛡️',
    title: 'Safety & Trust',
    faqs: [
      {
        q: 'How does QuickTrade verify workers?',
        a: 'Workers can upload a government-issued photo ID for identity verification. They can also upload trade licence certificates, complete background checks, and add a WorkSafe NZ compliance checklist. Verified badges are displayed on worker profiles.',
      },
      {
        q: 'What if I have a dispute with a worker?',
        a: 'Before releasing payment, you can raise a dispute through the Platform. Go to the job and click "Raise Dispute". Our team will review the evidence from both parties and determine a fair outcome.',
      },
      {
        q: 'Can I leave a review?',
        a: 'Yes — after a job is completed, both homeowners and workers can leave a review. Reviews help maintain quality and trust across the platform. Workers can respond to reviews publicly.',
      },
      {
        q: 'Is my payment information secure?',
        a: 'All payments are processed by Stripe, which is PCI DSS Level 1 certified — the highest level of payment security. QuickTrade never stores your card details.',
      },
    ],
  },
  {
    id: 'accounts',
    icon: '👤',
    title: 'Accounts & Settings',
    faqs: [
      {
        q: 'Can I be both a homeowner and a worker?',
        a: 'Yes — QuickTrade supports dual-role accounts. You can toggle between your worker and homeowner dashboards from the menu in your profile.',
      },
      {
        q: 'How do I change my password?',
        a: 'Go to Settings → Security. If you signed up with Google, you manage your password through Google\'s account settings.',
      },
      {
        q: 'How do I delete my account?',
        a: 'Go to Settings and scroll to the "Delete Account" section, or email support@quicktrade.co.nz. Note that active jobs or pending payments must be resolved before deletion.',
      },
      {
        q: 'How do I manage notifications?',
        a: 'Go to Settings → Notifications to manage email, SMS, and push notification preferences. You can also use the unsubscribe link in any email.',
      },
    ],
  },
]

export default function HelpPage() {
  return (
    <div className="flex flex-col min-h-screen luxury-bg">
      <Script
        id="jsonld-faq"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
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
          <div className="relative max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium mb-6">
              <span>💬</span>
              <span>Help Centre</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
              How can we help?
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10">
              Find answers to common questions, or get in touch with our support team.
            </p>

            {/* Quick links */}
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((cat) => (
                <a
                  key={cat.id}
                  href={`#${cat.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-700 bg-slate-800/50 text-slate-300 hover:border-indigo-500/50 hover:text-indigo-300 text-sm transition-colors"
                >
                  <span>{cat.icon}</span>
                  <span>{cat.title}</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ sections */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto space-y-16">
            {categories.map((cat) => (
              <div key={cat.id} id={cat.id} className="scroll-mt-24">
                <div className="flex items-center gap-3 mb-8">
                  <span className="text-2xl">{cat.icon}</span>
                  <h2 className="text-2xl font-bold text-white">{cat.title}</h2>
                </div>
                <div className="space-y-4">
                  {cat.faqs.map((faq, i) => (
                    <details
                      key={i}
                      className="group border border-slate-700/60 rounded-xl bg-slate-800/30 hover:border-indigo-500/30 transition-colors"
                    >
                      <summary className="flex items-center justify-between gap-4 px-6 py-4 cursor-pointer select-none list-none">
                        <span className="text-sm font-medium text-white">{faq.q}</span>
                        <span className="flex-shrink-0 text-slate-500 group-open:rotate-180 transition-transform duration-200">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      </summary>
                      <div className="px-6 pb-5">
                        <p className="text-slate-400 text-sm leading-relaxed">{faq.a}</p>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div
              className="relative overflow-hidden rounded-2xl p-10 text-center"
              style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.10) 100%)' }}
            >
              <div className="absolute inset-0 rounded-2xl border border-indigo-500/20 pointer-events-none" />
              <div className="text-3xl mb-4">🤝</div>
              <h2 className="text-2xl font-bold text-white mb-3">Still need help?</h2>
              <p className="text-slate-400 mb-6 max-w-md mx-auto">
                Our support team is available Monday–Friday, 8am–6pm NZST. We typically respond within a few hours.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
                >
                  Contact Support
                </Link>
                <a
                  href="mailto:support@quicktrade.co.nz"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-600 hover:border-indigo-500/50 text-slate-300 hover:text-white text-sm font-medium transition-colors"
                >
                  support@quicktrade.co.nz
                </a>
              </div>
              <p className="mt-6 text-slate-500 text-xs">
                You can also read our{' '}
                <Link href="/privacy" className="text-indigo-400 hover:text-indigo-300 transition-colors">Privacy Policy</Link>
                {' '}and{' '}
                <Link href="/terms" className="text-indigo-400 hover:text-indigo-300 transition-colors">Terms of Service</Link>.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
