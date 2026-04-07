'use client'

import { ShieldCheck } from 'lucide-react'

interface Props {
  count: 1 | 2 | 3 | 4 | 5
  size?: 'sm' | 'md' | 'lg'
}

const SIZE_MAP = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-7 h-7',
}

export function TrustShields({ count, size = 'md' }: Props) {
  const cls = SIZE_MAP[size]
  return (
    <div className="flex gap-0.5" title={`${count} of 5 trust shields`}>
      {Array.from({ length: 5 }, (_, i) => (
        <ShieldCheck
          key={i}
          className={`${cls} ${i < count ? 'text-indigo-600' : 'text-gray-200'} transition-colors`}
        />
      ))}
    </div>
  )
}
