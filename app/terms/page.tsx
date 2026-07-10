/* DRAFT — this content is a placeholder and has not been reviewed by a lawyer. Do not treat as legally binding until reviewed by qualified legal counsel. */
import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { SITE_URL } from '@/lib/seo/config'

const DRAFT_NOTICE =
  'DRAFT — this content is a placeholder and has not been reviewed by a lawyer. Do not treat as legally binding until reviewed by qualified legal counsel.'

export const metadata: Metadata = {
  title: 'Terms of Service | QuickTrade',
  description:
    'Draft placeholder terms of service for QuickTrade. This page is a temporary structure pending legal review.',
  alternates: { canonical: `${SITE_URL}/terms` },
}

const termSections = [
  {
    heading: 'PLACEHOLDER — User Obligations',
    points: [
      'Users must provide accurate account details and keep login credentials secure.',
      'Workers and clients must communicate respectfully and comply with all applicable local laws.',
      'Users must not misuse the platform, attempt fraud, or bypass platform safeguards and fees.',
    ],
  },
  {
    heading: 'PLACEHOLDER — Payment Terms',
    points: [
      'Platform fees, subscriptions, and transaction charges will be outlined in final legal terms.',
      'Payments may be processed through approved providers, and payout timing may depend on verification and dispute status.',
      'Refund and cancellation rules will be finalized by legal counsel and published in the final policy.',
    ],
  },
  {
    heading: 'PLACEHOLDER — Dispute Resolution',
    points: [
      'Users should first attempt to resolve disputes directly through documented in-platform communication.',
      'If unresolved, disputes may be escalated to platform support for review under future formal procedures.',
      'Final legal wording for escalation steps, mediation, and jurisdiction is pending legal review.',
    ],
  },
  {
    heading: 'PLACEHOLDER — Liability Limits',
    points: [
      'The final terms will define limits on platform liability to the maximum extent permitted by law.',
      'No final legal commitments are made in this placeholder draft regarding indirect, consequential, or special damages.',
      'Any non-excludable rights under applicable consumer law will be preserved in the reviewed version.',
    ],
  },
  {
    heading: 'PLACEHOLDER — Termination',
    points: [
      'Accounts may be suspended or terminated for policy violations, fraud, or safety risks.',
      'Users may request account closure, subject to outstanding obligations and legal retention requirements.',
      'Final notice periods, appeal rights, and post-termination obligations are pending legal review.',
    ],
  },
]

export default function TermsPage() {
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
            <span className="text-slate-200">Terms of Service</span>
          </nav>

          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100">
            <strong className="block font-semibold">DRAFT NOTICE</strong>
            <p className="mt-2">{DRAFT_NOTICE}</p>
          </div>

          <header className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Terms of Service</h1>
            <p className="text-slate-300">
              This draft page provides a temporary structure for legal terms while official language is prepared.
            </p>
          </header>

          <section className="grid gap-4">
            {termSections.map((section) => (
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
