import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/seo/config'

export const metadata: Metadata = {
  title: 'Pricing | QuickTrade — Transparent Trade Platform Pricing',
  description:
    'Simple, transparent pricing for employers and workers. Free to browse, no hidden fees. See QuickTrade subscription plans and add-ons.',
  alternates: {
    canonical: `${SITE_URL}/pricing`,
  },
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              { "@type": "Question", "name": "Is QuickTrade free to use?", "acceptedAnswer": { "@type": "Answer", "text": "Workers can create a free account and apply for jobs. Employers pay a small fee only when they hire. No subscription required to get started." } },
              { "@type": "Question", "name": "How does QuickTrade work for tradespeople?", "acceptedAnswer": { "@type": "Answer", "text": "Create a free profile, browse jobs near you, and apply directly. You only pay a small platform fee when you complete a job." } },
              { "@type": "Question", "name": "Is payment secure on QuickTrade?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. All payments are held in escrow and only released to the worker once the employer confirms the job is complete." } },
              { "@type": "Question", "name": "What trades are available on QuickTrade?", "acceptedAnswer": { "@type": "Answer", "text": "QuickTrade covers plumbing, electrical, carpentry, HVAC, roofing, painting, landscaping, flooring, cleaning, moving, and general handyman work across New Zealand." } }
            ]
          })
        }}
      />
      {children}
    </>
  )
}
