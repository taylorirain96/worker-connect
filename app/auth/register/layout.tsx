import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/seo/config'

export const metadata: Metadata = {
  title: 'Create Your Free Account | QuickTrade NZ',
  description:
    'Join QuickTrade for free. Sign up as a tradesperson to find work, or as a business to hire verified local workers across New Zealand.',
  alternates: { canonical: `${SITE_URL}/auth/register` },
}

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
