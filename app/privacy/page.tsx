import type { Metadata } from 'next'
import Link from 'next/link'
import Script from 'next/script'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { SITE_URL } from '@/lib/seo/config'

export const metadata: Metadata = {
  title: 'Privacy Policy | QuickTrade',
  description:
    'Read the QuickTrade Privacy Policy. Learn how we collect, use, and protect your personal information in accordance with New Zealand privacy law.',
  alternates: { canonical: `${SITE_URL}/privacy` },
  openGraph: {
    title: 'Privacy Policy | QuickTrade',
    description:
      'Read the QuickTrade Privacy Policy. Learn how we collect, use, and protect your personal information.',
    url: `${SITE_URL}/privacy`,
    type: 'website',
  },
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Privacy Policy', item: `${SITE_URL}/privacy` },
  ],
}

const sections = [
  {
    id: 'information-we-collect',
    title: '1. Information We Collect',
    content: [
      {
        subtitle: 'Account Information',
        text: 'When you register on QuickTrade, we collect your name, email address, phone number, and role (homeowner or tradesperson). Workers may also provide trade qualifications, business details, and identity verification documents.',
      },
      {
        subtitle: 'Profile & Work Information',
        text: 'Workers can upload profile photos, portfolio images, video introductions, trade licence certificates, and background check documents. Homeowners may upload photos when posting jobs or leaving reviews.',
      },
      {
        subtitle: 'Transaction Information',
        text: 'When payments are processed, we collect billing information through our payment provider (Stripe). We store transaction records, job details, quote amounts, and payout history.',
      },
      {
        subtitle: 'Usage Information',
        text: 'We automatically collect information about how you use QuickTrade, including pages visited, search queries, job interactions, message activity, and device/browser information.',
      },
      {
        subtitle: 'Communications',
        text: 'We retain messages sent through the platform, notifications, and any support correspondence.',
      },
    ],
  },
  {
    id: 'how-we-use-information',
    title: '2. How We Use Your Information',
    content: [
      {
        subtitle: 'Providing the Service',
        text: 'We use your information to create and manage your account, match you with relevant jobs or workers, process payments, facilitate communication between parties, and deliver our platform features.',
      },
      {
        subtitle: 'Safety & Trust',
        text: 'We use identity documents, licence certificates, and background check data to verify worker credentials and maintain a safe marketplace. Verification status is displayed on worker profiles.',
      },
      {
        subtitle: 'Communications',
        text: 'We send transactional emails (booking confirmations, payment receipts, job updates), push notifications, and SMS alerts. You can manage notification preferences in your account settings.',
      },
      {
        subtitle: 'Improving Our Platform',
        text: 'We use aggregated, anonymised usage data to improve search results, job matching algorithms, and overall platform performance.',
      },
      {
        subtitle: 'Legal Compliance',
        text: 'We may use or disclose information as required by New Zealand law, including the Privacy Act 2020, or in response to lawful requests from authorities.',
      },
    ],
  },
  {
    id: 'sharing-information',
    title: '3. Sharing Your Information',
    content: [
      {
        subtitle: 'Between Platform Users',
        text: 'Worker profiles (name, photo, trade, ratings, portfolio, certifications, availability) are visible to homeowners. When a job is accepted or a booking is confirmed, relevant contact details are shared between the parties.',
      },
      {
        subtitle: 'Service Providers',
        text: 'We share data with trusted third-party providers: Stripe (payments), Firebase/Google Cloud (infrastructure), Resend (email), Twilio (SMS), and Vercel (hosting). These providers are contractually bound to protect your data.',
      },
      {
        subtitle: 'We Do Not Sell Your Data',
        text: 'QuickTrade does not sell, rent, or trade your personal information to third parties for marketing purposes.',
      },
      {
        subtitle: 'Business Transfers',
        text: 'If QuickTrade is acquired or merged, your information may be transferred as part of that transaction. You will be notified in advance.',
      },
    ],
  },
  {
    id: 'data-storage',
    title: '4. Data Storage & Security',
    content: [
      {
        subtitle: 'Storage Location',
        text: 'Your data is stored on Google Firebase infrastructure. Data may be processed in the United States and other countries where Google Cloud operates. All transfers comply with applicable privacy law.',
      },
      {
        subtitle: 'Security Measures',
        text: 'We implement industry-standard security including encrypted connections (HTTPS/TLS), Firebase Authentication, Firestore security rules, and Stripe\'s PCI-DSS compliant payment processing.',
      },
      {
        subtitle: 'Retention',
        text: 'We retain your account data while your account is active. After deletion, we may retain transaction records and anonymised data as required by law or for legitimate business purposes for up to 7 years.',
      },
    ],
  },
  {
    id: 'your-rights',
    title: '5. Your Rights',
    content: [
      {
        subtitle: 'Access & Correction',
        text: 'Under the Privacy Act 2020, you have the right to access personal information we hold about you and request corrections if it is inaccurate.',
      },
      {
        subtitle: 'Account Deletion',
        text: 'You may request deletion of your account and personal data by contacting support@quicktrade.co.nz. Note that some data may be retained for legal or financial record-keeping purposes.',
      },
      {
        subtitle: 'Opt-Out',
        text: 'You can unsubscribe from marketing emails at any time using the unsubscribe link in any email. You can manage push notification and SMS preferences in your account settings.',
      },
      {
        subtitle: 'Data Portability',
        text: 'You may request an export of your personal data in a machine-readable format by contacting us.',
      },
    ],
  },
  {
    id: 'cookies',
    title: '6. Cookies & Tracking',
    content: [
      {
        subtitle: 'Essential Cookies',
        text: 'We use cookies that are necessary for authentication and platform functionality. These cannot be disabled.',
      },
      {
        subtitle: 'Analytics',
        text: 'We use Google Analytics 4 to understand how users interact with our platform. This may set analytics cookies. You can opt out via your browser settings or Google\'s opt-out tools.',
      },
      {
        subtitle: 'Firebase & FCM',
        text: 'Firebase uses local storage and service workers to manage authentication sessions and deliver push notifications.',
      },
    ],
  },
  {
    id: 'children',
    title: '7. Children\'s Privacy',
    content: [
      {
        subtitle: '',
        text: 'QuickTrade is not intended for use by anyone under the age of 18. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us immediately.',
      },
    ],
  },
  {
    id: 'changes',
    title: '8. Changes to This Policy',
    content: [
      {
        subtitle: '',
        text: 'We may update this Privacy Policy from time to time. We will notify you of significant changes by email or through a prominent notice on the platform. Continued use of QuickTrade after changes constitutes acceptance of the updated policy.',
      },
    ],
  },
  {
    id: 'contact',
    title: '9. Contact Us',
    content: [
      {
        subtitle: '',
        text: 'If you have questions about this Privacy Policy or wish to exercise your privacy rights, please contact our Privacy Officer at privacy@quicktrade.co.nz or by writing to QuickTrade, New Zealand.',
      },
    ],
  },
]

export default function PrivacyPage() {
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
              <span className="text-slate-300">Privacy Policy</span>
            </nav>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium mb-6">
              <span>🔒</span>
              <span>Your privacy matters</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
              Privacy Policy
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mb-4">
              We are committed to protecting your personal information and being transparent about how we use it.
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
                <div className="p-5 rounded-xl border border-indigo-500/20 bg-indigo-500/5 text-slate-300 text-sm leading-relaxed">
                  This Privacy Policy explains how QuickTrade Limited collects, uses, stores, and protects your personal information when you use the QuickTrade platform (quicktrade-pi.vercel.app). By using our platform, you agree to the practices described in this policy. This policy is written in accordance with the New Zealand <strong className="text-white">Privacy Act 2020</strong>.
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
                    For questions about this Privacy Policy, contact us at{' '}
                    <a href="mailto:privacy@quicktrade.co.nz" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                      privacy@quicktrade.co.nz
                    </a>
                  </p>
                  <p className="mt-2">
                    You can also read our{' '}
                    <Link href="/terms" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                      Terms of Service
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
