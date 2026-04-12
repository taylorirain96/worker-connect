'use client'

import { useState } from 'react'
import Link from 'next/link'
import { X, ArrowRight } from 'lucide-react'

export default function FoundersDealBanner() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="relative w-full bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 py-3 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-4 flex-wrap">
        <p className="text-white text-sm sm:text-base font-medium text-center">
          🎉{' '}
          <span className="font-bold">Founding Member Deals are LIVE</span> — Limited spots
          available!
        </p>
        <Link
          href="/founders-deal"
          className="inline-flex items-center gap-1.5 bg-white text-indigo-700 font-bold text-sm px-4 py-1.5 rounded-full hover:bg-indigo-50 transition-colors whitespace-nowrap"
        >
          Claim Your Deal
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss banner"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors p-1"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
