import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up | QuickTrade',
  description:
    'Create your free QuickTrade account. Find work as a tradesperson or hire verified workers across New Zealand.',
}

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
