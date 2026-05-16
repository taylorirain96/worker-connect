import type { Metadata } from 'next'
import Script from 'next/script'
import PricingContent from '@/components/pricing/PricingContent'
import { SITE_URL } from '@/lib/seo/config'

export const metadata: Metadata = {
  title: 'Pricing | Free to Post, Free to Apply | QuickTrade NZ',
  description:
    'QuickTrade is free for homeowners to post jobs and for workers to apply. Workers pay a small commission only when they get paid — starting at 18% and dropping to 10% as you grow. Optional Pro plans from $49/month.',
  alternates: { canonical: `${SITE_URL}/pricing` },
  openGraph: {
    title: 'Pricing | Free to Post, Free to Apply | QuickTrade NZ',
    description:
      'Post jobs free. Apply free. Workers pay commission only on completed earnings — as low as 10%. Optional Pro plans for higher earners.',
    url: `${SITE_URL}/pricing`,
    type: 'website',
  },
}

const pricingFaqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Do homeowners pay anything to post a job?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No — posting a job is completely free. You only pay the agreed job price through escrow when the work is done. There are no posting fees, no sign-up fees, and no credit card required to get started.',
      },
    },
    {
      '@type': 'Question',
      name: 'When exactly does QuickTrade take commission?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "QuickTrade's commission is only deducted when the employer releases payment from escrow after the job is completed. You never pay anything upfront — the commission comes from earnings you've already received.",
      },
    },
    {
      '@type': 'Question',
      name: "What's included in the Pro Worker subscription?",
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Pro Worker ($49 NZD/month) gives you a flat 8% commission rate on every job — down from the standard 18% starting rate. If you\'re doing 3+ jobs a month, Pro easily pays for itself. Elite Worker ($89/month) drops your rate to 6%.',
      },
    },
  ],
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Pricing', item: `${SITE_URL}/pricing` },
  ],
}

export default function PricingPage() {
  return (
    <>
      <Script
        id="jsonld-pricing-faq"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingFaqJsonLd) }}
      />
      <Script
        id="jsonld-pricing-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <PricingContent />
    </>
  )
}

