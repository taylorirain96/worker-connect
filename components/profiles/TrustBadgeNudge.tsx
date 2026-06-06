'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShieldCheck, X } from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'
import type { WorkerVerification } from '@/types/reputation'

const DISMISS_KEY = 'trustBadgeNudge:dismissedAt'
const DISMISS_DAYS = 7

/**
 * Friendly, non-blocking nudge that points tradies at the optional trust
 * badges they haven't uploaded yet. Implements the "smart contextual
 * reminder" pattern — tradies are never locked out, they're shown the
 * value first ("4× more likely to land this job") and can dismiss for a
 * week if they're not ready.
 */
export default function TrustBadgeNudge() {
  const { user } = useAuth()
  const [missing, setMissing] = useState<string[]>([])
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const d = localStorage.getItem(DISMISS_KEY)
    if (d) {
      const ts = Number(d)
      if (Number.isFinite(ts) && Date.now() - ts < DISMISS_DAYS * 86_400_000) {
        setDismissed(true)
      }
    }
  }, [])

  useEffect(() => {
    if (!user?.uid || dismissed) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/verification/status?workerId=${encodeURIComponent(user.uid)}`)
        if (!res.ok) return
        const data: { verification?: WorkerVerification } = await res.json()
        if (cancelled) return
        const items = data.verification?.items ?? []
        const has = (t: string) => items.some((i) => i.type === t && (i.status === 'verified' || i.status === 'pending'))
        const skipped = (t: string) => items.some((i) => i.type === t && i.status === 'skipped')
        const candidates = ['insurance', 'background_check', 'certification']
        setMissing(candidates.filter((t) => !has(t) && !skipped(t)))
      } catch {
        // Silent.
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user?.uid, dismissed])

  function dismiss() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(DISMISS_KEY, String(Date.now()))
    }
    setDismissed(true)
  }

  if (dismissed || missing.length === 0) return null

  const first = missing[0]
  const label =
    first === 'insurance'
      ? 'Insurance'
      : first === 'background_check'
      ? 'Background check'
      : 'Certification'

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 p-4 flex items-start gap-3">
      <div className="h-9 w-9 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0">
        <ShieldCheck className="h-5 w-5 text-amber-600 dark:text-amber-300" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
          Tip: Tradies with an <span className="underline">{label} badge</span> are 4× more likely to land
          high-paying jobs.
        </p>
        <p className="text-xs text-amber-800 dark:text-amber-200 mt-0.5">
          Totally optional — you can keep posting and applying without it. Upload it when you see the value.
        </p>
        <div className="flex gap-3 mt-2 text-xs font-semibold">
          <Link href="/dashboard/verification" className="text-amber-900 dark:text-amber-100 hover:underline">
            Add {label} →
          </Link>
        </div>
      </div>
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="p-1 text-amber-700 hover:text-amber-900 dark:text-amber-300 dark:hover:text-amber-100 flex-shrink-0"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
