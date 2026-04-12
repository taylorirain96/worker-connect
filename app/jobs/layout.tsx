import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/seo/config'

export const metadata: Metadata = {
  title: 'Browse Jobs in New Zealand | QuickTrade',
  description:
    'Find local trade jobs across New Zealand. Browse plumbing, electrical, building, cleaning and more — posted by verified employers. Apply on QuickTrade today.',
  alternates: { canonical: `${SITE_URL}/jobs` },
  openGraph: {
    title: 'Browse Jobs in New Zealand | QuickTrade',
    description:
      'Find local trade jobs across New Zealand. Browse plumbing, electrical, building, cleaning and more — posted by verified employers.',
    url: `${SITE_URL}/jobs`,
    type: 'website',
  },
}

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
