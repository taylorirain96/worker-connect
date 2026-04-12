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
  return <>{children}</>
}
