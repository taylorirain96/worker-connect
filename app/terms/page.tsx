import type { Metadata } from 'next'
import Link from 'next/link'
import Script from 'next/script'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { SITE_URL } from '@/lib/seo/config'

export const metadata: Metadata = {
  title: 'Terms of Service | QuickTrade',
  description:
    'Read the QuickTrade Terms of Service. Understand the rules, rights, and responsibilities that apply when you use the QuickTrade platform.',
  alternates: { canonical: `${SITE_URL}/terms` },
  openGraph: {
    title: 'Terms of Service | QuickTrade',
    description:
      'Read the QuickTrade Terms of Service. Understand the rules, rights, and responsibilities that apply when you use the QuickTrade platform.',
    url: `${SITE_URL}/terms`,
    type: 'website',
  },
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Terms of Service', item: `${SITE_URL}/terms` },
  ],
}

const sections = [
  {
    id: 'acceptance',
    title: '1. Acceptance of Terms',
    content: [
      {
        subtitle: '',
        text: 'By accessing or using the QuickTrade platform (the "Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not use the Platform. These Terms constitute a legally binding agreement between you and QuickTrade Limited ("QuickTrade", "we", "us", or "our").',
      },
      {
        subtitle: '',
        text: 'We reserve the right to update these Terms at any time. Continued use of the Platform after changes are posted constitutes your acceptance of the revised Terms.',
      },
    ],
  },
  {
    id: 'platform-description',
    title: '2. Platform Description',
    content: [
      {
        subtitle: '',
        text: 'QuickTrade is an online marketplace that connects homeowners and businesses ("Homeowners") with independent tradespeople and service providers ("Workers"). QuickTrade acts as an intermediary platform only — we are not a party to any service agreement between Homeowners and Workers.',
      },
      {
        subtitle: '',
        text: 'QuickTrade does not employ Workers and is not responsible for the quality, safety, legality, or timeliness of work performed. Workers are independent contractors, not employees of QuickTrade.',
      },
    ],
  },
  {
    id: 'accounts',
    title: '3. Accounts & Eligibility',
    content: [
      {
        subtitle: 'Eligibility',
        text: 'You must be at least 18 years of age and legally capable of entering into binding contracts to use the Platform. By creating an account, you represent and warrant that you meet these requirements.',
      },
      {
        subtitle: 'Account Accuracy',
        text: 'You agree to provide accurate, current, and complete information when creating your account. You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account.',
      },
      {
        subtitle: 'Worker Accounts',
        text: 'Workers must provide accurate information about their qualifications, licences, and experience. Misrepresentation of credentials may result in immediate account suspension and potential legal action.',
      },
      {
        subtitle: 'Account Termination',
        text: 'QuickTrade reserves the right to suspend or terminate accounts at its discretion for violations of these Terms, fraudulent activity, or harm to other users.',
      },
    ],
  },
  {
    id: 'services-payments',
    title: '4. Services & Payments',
    content: [
      {
        subtitle: 'Escrow System',
        text: 'For fixed-price jobs, Homeowners fund an escrow held by QuickTrade via Stripe. Funds are released to Workers upon job completion and Homeowner approval. QuickTrade deducts a platform commission (currently 5%) from Worker payouts at the time of release.',
      },
      {
        subtitle: 'Service Packages',
        text: 'Workers may offer fixed-price service packages which Homeowners can book directly. Payment is processed through the same escrow system.',
      },
      {
        subtitle: 'Subscription Plans',
        text: 'Premium subscription plans (Worker Pro, Employer Pro, Employer Business) are billed monthly in New Zealand Dollars (NZD) including 15% GST. Subscriptions auto-renew unless cancelled.',
      },
      {
        subtitle: 'Refunds',
        text: 'Subscription fees are non-refundable except where required by the Consumer Guarantees Act 1993 or other applicable New Zealand law. Escrow funds may be refunded at QuickTrade\'s discretion following dispute resolution.',
      },
      {
        subtitle: 'GST',
        text: 'All prices include 15% New Zealand Goods and Services Tax (GST) where applicable. QuickTrade is GST registered.',
      },
    ],
  },
  {
    id: 'worker-obligations',
    title: '5. Worker Obligations',
    content: [
      {
        subtitle: 'Licence & Compliance',
        text: 'Workers must hold all licences, registrations, and certifications required by New Zealand law for the services they offer. Workers are solely responsible for complying with all applicable regulations, including WorkSafe NZ requirements.',
      },
      {
        subtitle: 'Quality of Work',
        text: 'Workers guarantee that services will be performed professionally, with reasonable skill and care, in accordance with industry standards.',
      },
      {
        subtitle: 'Insurance',
        text: 'Workers are encouraged to hold appropriate public liability insurance. QuickTrade does not provide insurance coverage for Workers or their work.',
      },
      {
        subtitle: 'Taxes',
        text: 'Workers are responsible for all taxes on their earnings, including income tax and GST where applicable. QuickTrade provides earnings reports but does not withhold tax on behalf of Workers.',
      },
    ],
  },
  {
    id: 'homeowner-obligations',
    title: '6. Homeowner Obligations',
    content: [
      {
        subtitle: 'Accurate Job Descriptions',
        text: 'Homeowners must provide accurate, complete job descriptions. Misrepresenting the scope of work may result in additional charges and is a violation of these Terms.',
      },
      {
        subtitle: 'Safe Working Conditions',
        text: 'Homeowners must ensure a safe working environment for Workers, in accordance with the Health and Safety at Work Act 2015.',
      },
      {
        subtitle: 'Timely Payment',
        text: 'Homeowners agree to fund escrow in full before work commences and to release payment promptly upon satisfactory job completion.',
      },
    ],
  },
  {
    id: 'prohibited-conduct',
    title: '7. Prohibited Conduct',
    content: [
      {
        subtitle: '',
        text: 'You must not: (a) circumvent the Platform by transacting directly with users you met through QuickTrade to avoid platform fees; (b) post false, misleading, or fraudulent content; (c) harass, threaten, or discriminate against other users; (d) attempt to hack, scrape, or interfere with the Platform; (e) use the Platform for illegal purposes; (f) create multiple accounts to circumvent bans or restrictions.',
      },
      {
        subtitle: '',
        text: 'Violation of these prohibitions may result in immediate account suspension and legal liability.',
      },
    ],
  },
  {
    id: 'disputes',
    title: '8. Disputes Between Users',
    content: [
      {
        subtitle: 'Dispute Resolution',
        text: 'QuickTrade provides a dispute resolution process for conflicts between Homeowners and Workers. Either party may raise a dispute through the Platform. QuickTrade will review the matter and make a determination about escrow release at its sole discretion.',
      },
      {
        subtitle: 'Limitation',
        text: 'QuickTrade\'s dispute resolution process is provided as a convenience. We make no guarantee of any particular outcome. Parties retain the right to pursue disputes through New Zealand courts.',
      },
    ],
  },
  {
    id: 'intellectual-property',
    title: '9. Intellectual Property',
    content: [
      {
        subtitle: 'Platform',
        text: 'The QuickTrade platform, including its design, code, and content, is owned by QuickTrade Limited and protected by New Zealand and international intellectual property law.',
      },
      {
        subtitle: 'User Content',
        text: 'You retain ownership of content you upload (photos, reviews, job descriptions). By posting content, you grant QuickTrade a non-exclusive, royalty-free licence to display, reproduce, and promote that content on the Platform.',
      },
    ],
  },
  {
    id: 'liability',
    title: '10. Limitation of Liability',
    content: [
      {
        subtitle: '',
        text: 'To the maximum extent permitted by law, QuickTrade\'s total liability for any claim arising from your use of the Platform is limited to the fees you paid to QuickTrade in the 3 months prior to the claim.',
      },
      {
        subtitle: '',
        text: 'QuickTrade is not liable for: (a) the quality or safety of work performed by Workers; (b) personal injury or property damage; (c) indirect, incidental, or consequential loss; (d) loss of data or business interruption.',
      },
      {
        subtitle: '',
        text: 'Nothing in these Terms limits liability for fraud, wilful misconduct, or any liability that cannot be excluded under the Consumer Guarantees Act 1993 or Fair Trading Act 1986.',
      },
    ],
  },
  {
    id: 'governing-law',
    title: '11. Governing Law',
    content: [
      {
        subtitle: '',
        text: 'These Terms are governed by the laws of New Zealand. Any disputes shall be subject to the exclusive jurisdiction of the New Zealand courts. If any provision is found unenforceable, the remaining provisions continue in full force.',
      },
    ],
  },
  {
    id: 'contact',
    title: '12. Contact',
    content: [
      {
        subtitle: '',
        text: 'For questions about these Terms, contact us at legal@quicktrade.co.nz or through our contact page.',
      },
    ],
  },
]

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen luxury-bg">
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
              <span className="text-slate-300">Terms of Service</span>
            </nav>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium mb-6">
              <span>📋</span>
              <span>Please read carefully</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
              Terms of Service
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mb-4">
              These terms govern your use of the QuickTrade platform. By using QuickTrade, you agree to these terms.
            </p>
            <p className="text-slate-500 text-sm">
              Last updated: May 2026 &nbsp;·&nbsp; Effective: May 2026
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
              {/* Table of Contents */}
              <aside className="lg:col-span-1">
                <div className="sticky top-24">
                  <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Contents</h2>
                  <nav className="space-y-2">
                    {sections.map((s) => (
                      <a
                        key={s.id}
                        href={`#${s.id}`}
                        className="block text-sm text-slate-400 hover:text-indigo-400 transition-colors leading-snug"
                      >
                        {s.title}
                      </a>
                    ))}
                  </nav>
                  <div className="mt-8 pt-6 border-t border-slate-800">
                    <p className="text-xs text-slate-500 mb-3">Have questions?</p>
                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      Contact us →
                    </Link>
                  </div>
                </div>
              </aside>

              {/* Sections */}
              <div className="lg:col-span-3 space-y-12">
                <div className="p-5 rounded-xl border border-amber-500/20 bg-amber-500/5 text-slate-300 text-sm leading-relaxed">
                  <strong className="text-amber-300">Important:</strong> These Terms of Service constitute a legally binding agreement. Please read them carefully before using QuickTrade. If you do not agree, do not use the platform.
                </div>

                {sections.map((section) => (
                  <div key={section.id} id={section.id} className="scroll-mt-24">
                    <h2 className="text-xl font-bold text-white mb-6 pb-3 border-b border-slate-800">
                      {section.title}
                    </h2>
                    <div className="space-y-5">
                      {section.content.map((item, i) => (
                        <div key={i}>
                          {item.subtitle && (
                            <h3 className="text-sm font-semibold text-indigo-300 mb-1.5">{item.subtitle}</h3>
                          )}
                          <p className="text-slate-400 text-sm leading-relaxed">{item.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="p-5 rounded-xl border border-slate-700 bg-slate-800/30 text-sm text-slate-400">
                  <p>
                    For questions about these Terms, email{' '}
                    <a href="mailto:legal@quicktrade.co.nz" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                      legal@quicktrade.co.nz
                    </a>
                  </p>
                  <p className="mt-2">
                    You can also read our{' '}
                    <Link href="/privacy" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                      Privacy Policy
                    </Link>
                    {' '}or visit our{' '}
                    <Link href="/help" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                      Help Centre
                    </Link>.
                  </p>
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
