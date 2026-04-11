import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing | QuickTrade NZ',
  description:
    'Simple, fair pricing for workers and employers. Gig work, recruitment track, employer subscriptions, worker pro tiers, add-ons, and rewards — all in one place.',
  alternates: {
    canonical: 'https://quicktrade.co.nz/pricing',
  },
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
