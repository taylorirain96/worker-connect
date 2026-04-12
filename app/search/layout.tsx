import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/seo/config'

export const metadata: Metadata = {
  title: 'Search Jobs & Workers in New Zealand | QuickTrade',
  description:
    'Search for trade jobs and skilled workers across New Zealand. Filter by category, location, budget and more on QuickTrade.',
  alternates: { canonical: `${SITE_URL}/search` },
  robots: { index: false },
}

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
