'use client'

import { MapPin, CheckCircle } from 'lucide-react'
import { isRelocationReady } from '@/lib/utils/completionRateCalc'

interface Props {
  targetCity: string | null
  completionRate: number
}

export function RelocationBadge({ targetCity, completionRate }: Props) {
  const ready = isRelocationReady(targetCity, completionRate)

  if (!ready) return null

  return (
    <div className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium">
      <CheckCircle className="w-4 h-4" />
      Relocation Ready
      {targetCity && (
        <>
          <span className="text-green-400 mx-0.5">·</span>
          <MapPin className="w-3.5 h-3.5" />
          <span className="text-green-600">{targetCity}</span>
        </>
      )}
    </div>
  )
}
