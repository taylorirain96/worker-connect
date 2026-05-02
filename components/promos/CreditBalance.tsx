'use client'
import { useEffect, useState } from 'react'
import { DollarSign } from 'lucide-react'

type LoadState = 'loading' | 'loaded' | 'error'

interface CreditBalanceProps {
  userId: string
  /** When true, shows a compact inline badge */
  compact?: boolean
}

export default function CreditBalance({ userId, compact = false }: CreditBalanceProps) {
  const [credit, setCredit] = useState<number>(0)
  const [state, setState] = useState<LoadState>('loading')

  useEffect(() => {
    if (!userId) return
    setState('loading')
    fetch(`/api/credits/balance?userId=${userId}`)
      .then((r) => r.json())
      .then((d) => {
        setCredit(d.credit ?? 0)
        setState('loaded')
      })
      .catch(() => {
        setCredit(0)
        setState('error')
      })
  }, [userId])

  // Show nothing while loading or on error or when balance is zero
  if (state !== 'loaded' || credit <= 0) return null

  const formatted = new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: 'NZD',
    minimumFractionDigits: 0,
  }).format(credit)

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
        <DollarSign className="h-3 w-3" />
        {formatted} credit
      </span>
    )
  }

  return (
    <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700">
      <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
      <div>
        <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
          {formatted} credit available
        </p>
        <p className="text-xs text-emerald-600 dark:text-emerald-500">
          Automatically applied at checkout
        </p>
      </div>
    </div>
  )
}
