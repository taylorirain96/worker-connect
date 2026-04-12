import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/seo/config'

export const metadata: Metadata = {
  title: 'Sign In | QuickTrade',
  description: 'Sign in to your QuickTrade account.',
  alternates: {
    canonical: `${SITE_URL}/auth/login`,
  },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
