import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/seo/config'

export const metadata: Metadata = {
  title: 'Top Workers Leaderboard | QuickTrade NZ',
  description:
    'See the top-ranked trade workers on QuickTrade New Zealand this week. Compete for weekly champion points, earn badges, and climb the rankings.',
  alternates: { canonical: `${SITE_URL}/leaderboard` },
  openGraph: {
    title: 'Top Workers Leaderboard | QuickTrade NZ',
    description:
      'See the top-ranked trade workers on QuickTrade New Zealand this week. Compete for weekly champion points, earn badges, and climb the rankings.',
    url: `${SITE_URL}/leaderboard`,
    type: 'website',
  },
}

export default function LeaderboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
