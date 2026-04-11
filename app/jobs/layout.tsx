import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Trade Jobs in New Zealand | QuickTrade',
  description:
    'Browse trade jobs in Marlborough, Nelson, Blenheim and Wellington. Apply to plumbing, electrical, carpentry, painting, roofing and labouring jobs today.',
  keywords:
    'trade jobs NZ, trade jobs Marlborough, trade jobs Nelson, electrician jobs Blenheim, plumber jobs Wellington',
}

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
