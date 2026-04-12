import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/seo/config'

export const metadata: Metadata = {
  title: "Founder's Deal — Lock In Early Access Pricing | QuickTrade NZ",
  description:
    'Join QuickTrade as a founding member and lock in exclusive early access pricing before we go public. Limited spots available for New Zealand tradespeople.',
  alternates: { canonical: `${SITE_URL}/founders-deal` },
  openGraph: {
    title: "Founder's Deal — Lock In Early Access Pricing | QuickTrade NZ",
    description:
      'Join QuickTrade as a founding member and lock in exclusive early access pricing before we go public. Limited spots available.',
    url: `${SITE_URL}/founders-deal`,
    type: 'website',
  },
}

export default function FoundersDealLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
