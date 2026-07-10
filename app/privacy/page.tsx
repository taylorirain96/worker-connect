/* DRAFT — this content is a placeholder and has not been reviewed by a lawyer. Do not treat as legally binding until reviewed by qualified legal counsel. */
import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { SITE_URL } from '@/lib/seo/config'
import { LEGAL_DRAFT_NOTICE } from '@/lib/legalDraftNotice'

export const metadata: Metadata = {
  title: 'Privacy Policy | QuickTrade',
  description:
    'Draft placeholder privacy policy for QuickTrade. This page is a temporary structure pending legal review.',
  alternates: { canonical: `${SITE_URL}/privacy` },
}

const placeholderSections = [
  {
    heading: 'PLACEHOLDER — Data We Collect',
    points: [
      'Account data such as name, email, phone number, and profile details.',
      'Service usage data including messages, job interactions, and app activity logs.',
      'Transaction-related metadata associated with payments, payouts, and invoices.',
    ],
  },
  {
    heading: 'PLACEHOLDER — How We Use Data',
    points: [
      'To operate accounts, match users, process platform transactions, and provide support.',
      'To improve platform reliability, safety, fraud detection, and product performance.',
      'To send service communications and legally required notices.',
    ],
  },
  {
    heading: 'PLACEHOLDER — Third-Party Sharing (Stripe, Firebase, and Others)',
    points: [
      'Payment-related data may be processed by Stripe to enable billing and payout workflows.',
      'Application and storage infrastructure may rely on Firebase/Google Cloud services.',
      'Limited data may be shared with vetted providers for hosting, messaging, analytics, and compliance support.',
    ],
  },
  {
    heading: 'PLACEHOLDER — User Rights',
    points: [
      'Users may request access to, correction of, or deletion of eligible personal data.',
      'Users may manage communications preferences and opt out of non-essential marketing.',
      'Final legal wording for jurisdiction-specific rights and exceptions is pending legal review.',
    ],
  },
  {
    heading: 'PLACEHOLDER — Contact Information',
    points: [
      'For privacy questions, users may contact the QuickTrade privacy team via support channels.',
      'A dedicated privacy contact email and legal mailing details will be confirmed in the reviewed policy.',
      'Response timelines and escalation paths will be defined in the finalized legal document.',
    ],
  },
]

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col luxury-bg">
      <Navbar />
      <main className="flex-1 px-4 py-12 sm:py-16">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
          <nav className="flex items-center gap-2 text-sm text-slate-400">
            <Link href="/" className="transition-colors hover:text-slate-200">
              Home
            </Link>
            <span>/</span>
            <span className="text-slate-200">Privacy Policy</span>
          </nav>

          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100">
            <strong className="block font-semibold">DRAFT NOTICE</strong>
            <p className="mt-2">{LEGAL_DRAFT_NOTICE}</p>
          </div>

          <header className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Privacy Policy</h1>
            <p className="text-slate-300">
              This draft page provides a temporary structure for privacy disclosures while official language is prepared.
            </p>
          </header>

          <section className="grid gap-4">
            {placeholderSections.map((section) => (
              <Card key={section.heading} className="bg-slate-900/60 border-slate-700/60">
                <CardHeader>
                  <CardTitle className="text-white">{section.heading}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc space-y-2 pl-5 text-sm text-slate-300">
                    {section.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
