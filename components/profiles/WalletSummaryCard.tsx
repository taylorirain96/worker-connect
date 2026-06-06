'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Wallet, ArrowRight } from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'

/**
 * One shared wallet across both hats. Tradies see what they've earned;
 * Clients see the same balance they can spend hiring others, plus any
 * platform credits — so users never have to withdraw to their bank just
 * to spend money on Worker Connect.
 *
 * Falls back gracefully when a balance isn't available (no Stripe Connect
 * account yet, or provider not configured): the card stays informational
 * with a Set-up link so users still see the wallet concept.
 */
export default function WalletSummaryCard({ compact = false }: { compact?: boolean }) {
  const { user } = useAuth()
  const [available, setAvailable] = useState<number | null>(null)
  const [pending, setPending] = useState<number | null>(null)
  const [credit, setCredit] = useState<number | null>(null)
  const [currency, setCurrency] = useState<string>('nzd')
  const [needsSetup, setNeedsSetup] = useState(false)

  useEffect(() => {
    if (!user?.uid) return
    let cancelled = false
    ;(async () => {
      try {
        const [payRes, credRes] = await Promise.all([
          fetch('/api/payouts/balance', { headers: { 'x-user-id': user.uid } }),
          fetch(`/api/credits/balance?userId=${encodeURIComponent(user.uid)}`),
        ])
        if (cancelled) return
        if (payRes.ok) {
          const d = await payRes.json()
          setAvailable(typeof d.available === 'number' ? d.available : null)
          setPending(typeof d.pending === 'number' ? d.pending : null)
          if (typeof d.currency === 'string') setCurrency(d.currency)
        } else if (payRes.status === 404) {
          setNeedsSetup(true)
        }
        if (credRes.ok) {
          const d = await credRes.json()
          setCredit(typeof d.balance === 'number' ? d.balance : typeof d.credit === 'number' ? d.credit : null)
        }
      } catch {
        // Silent — card just shows the setup link.
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user?.uid])

  const fmt = (n: number) =>
    new Intl.NumberFormat(undefined, { style: 'currency', currency: currency.toUpperCase() }).format(n)

  return (
    <div
      className={`rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 dark:border-emerald-800 p-4 ${
        compact ? '' : 'sm:p-5'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center flex-shrink-0">
            <Wallet className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">
              Wallet · one balance, both hats
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white truncate">
              {available !== null ? fmt(available) : needsSetup ? '—' : 'Loading…'}
              {credit !== null && credit > 0 && (
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300 ml-2">
                  + {fmt(credit)} credit
                </span>
              )}
            </p>
            {pending !== null && pending > 0 && (
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                {fmt(pending)} pending clearance
              </p>
            )}
            {needsSetup && (
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                Set up payouts to start earning &amp; spending from one balance.
              </p>
            )}
          </div>
        </div>
        <Link
          href={needsSetup ? '/dashboard/worker/payout-setup' : '/earnings'}
          className="text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 flex-shrink-0"
        >
          {needsSetup ? 'Set up' : 'Wallet'} <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  )
}
