import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/seo/config'

export const metadata: Metadata = {
  title: 'Find Verified Trade Workers in New Zealand | QuickTrade',
  description:
    'Browse skilled tradespeople across New Zealand — plumbers, electricians, builders, cleaners and more. Verified profiles, real reviews, secure payments.',
  alternates: { canonical: `${SITE_URL}/workers` },
  openGraph: {
    title: 'Find Verified Trade Workers in New Zealand | QuickTrade',
    description:
      'Browse skilled tradespeople across New Zealand — plumbers, electricians, builders, cleaners and more. Verified profiles, real reviews, secure payments.',
    url: `${SITE_URL}/workers`,
    type: 'website',
  },
}

export default function WorkersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
