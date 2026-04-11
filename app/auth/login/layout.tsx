import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In | QuickTrade',
  description: 'Sign in to your QuickTrade account.',
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
