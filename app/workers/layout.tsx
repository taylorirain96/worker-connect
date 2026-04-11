import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hire Trade Workers in New Zealand | QuickTrade',
  description:
    'Find and hire verified trade workers in Marlborough, Nelson, Blenheim and Wellington. Browse worker profiles, read reviews and hire in minutes.',
  keywords:
    'hire trade workers NZ, tradesperson Marlborough, electrician for hire Nelson, plumber Blenheim, builder Wellington',
}

export default function WorkersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
