'use client'
import { useEffect, useState, useCallback } from 'react'
import { collection, query, where, getDocs, type DocumentData } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/components/providers/AuthProvider'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'
import { DollarSign, Users, RefreshCw } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface AffiliateRow {
  uid: string
  displayName: string | null
  email: string | null
  referralCode: string | null
  affiliateBalance: number
  affiliatePaidOut: number
  payingOut: boolean
}

function docToRow(id: string, data: DocumentData): AffiliateRow {
  return {
    uid: id,
    displayName: (data.displayName as string | null) ?? null,
    email: (data.email as string | null) ?? null,
    referralCode: (data.referralCode as string | null) ?? null,
    affiliateBalance: (data.affiliateBalance as number | undefined) ?? 0,
    affiliatePaidOut: (data.affiliatePaidOut as number | undefined) ?? 0,
    payingOut: false,
  }
}

export default function AdminAffiliatesPage() {
  const { user } = useAuth()
  const [rows, setRows] = useState<AffiliateRow[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAffiliates = useCallback(async () => {
    if (!db) return
    setLoading(true)
    try {
      const q = query(collection(db, 'users'), where('affiliateBalance', '>', 0))
      const snap = await getDocs(q)
      setRows(snap.docs.map((d) => docToRow(d.id, d.data())))
    } catch (err) {
      console.error('[admin/affiliates] fetch error:', err)
      toast.error('Failed to load affiliates')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAffiliates()
  }, [fetchAffiliates])

  const handlePayout = async (targetUserId: string) => {
    if (!user) return
    setRows((prev) =>
      prev.map((r) => (r.uid === targetUserId ? { ...r, payingOut: true } : r))
    )
    try {
      const res = await fetch('/api/affiliates/payout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.uid,
        },
        body: JSON.stringify({ targetUserId }),
      })
      const data = await res.json() as { error?: string; amount?: number }
      if (!res.ok) {
        toast.error(data.error ?? 'Payout failed')
      } else {
        toast.success(`NZ$${(data.amount ?? 0).toFixed(2)} paid out successfully`)
        await fetchAffiliates()
      }
    } catch {
      toast.error('Network error — please try again')
    } finally {
      setRows((prev) =>
        prev.map((r) => (r.uid === targetUserId ? { ...r, payingOut: false } : r))
      )
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <DollarSign className="h-6 w-6 text-indigo-400" />
          <div>
            <h1 className="text-xl font-bold text-white">Affiliate Payouts</h1>
            <p className="text-sm text-slate-400">Users with pending affiliate balance</p>
          </div>
        </div>
        <button
          onClick={fetchAffiliates}
          className="flex items-center gap-2 rounded-lg bg-slate-700 hover:bg-slate-600 px-3 py-2 text-sm text-slate-200 transition-colors"
          title="Refresh"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-700 overflow-hidden">
        {/* Table header */}
        <div className="hidden sm:grid grid-cols-5 gap-4 bg-slate-800 px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">
          <span className="col-span-2">User</span>
          <span>Balance</span>
          <span>Paid Out</span>
          <span>Action</span>
        </div>

        <div className="divide-y divide-slate-700">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <div className="h-4 flex-1 bg-slate-700 animate-pulse rounded" />
              </div>
            ))
          ) : rows.length === 0 ? (
            <div className="py-16 text-center">
              <Users className="h-10 w-10 text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-400">No affiliates with pending balance</p>
            </div>
          ) : (
            rows.map((row) => (
              <div
                key={row.uid}
                className="grid grid-cols-1 sm:grid-cols-5 gap-2 sm:gap-4 items-center px-5 py-4 hover:bg-slate-800/50 transition-colors"
              >
                {/* User info */}
                <div className="sm:col-span-2">
                  <p className="text-sm font-medium text-white">
                    {row.displayName ?? '—'}
                  </p>
                  <p className="text-xs text-slate-400">{row.email ?? '—'}</p>
                  {row.referralCode && (
                    <p className="text-xs text-indigo-400 font-mono mt-0.5">
                      Code: {row.referralCode}
                    </p>
                  )}
                </div>

                {/* Balance */}
                <div>
                  <p className="text-sm font-bold text-emerald-400">
                    {formatCurrency(row.affiliateBalance)}
                  </p>
                  <p className="text-xs text-slate-500">pending</p>
                </div>

                {/* Paid out */}
                <div>
                  <p className="text-sm text-slate-300">
                    {formatCurrency(row.affiliatePaidOut)}
                  </p>
                  <p className="text-xs text-slate-500">all time</p>
                </div>

                {/* Action */}
                <div>
                  <Button
                    size="sm"
                    onClick={() => handlePayout(row.uid)}
                    loading={row.payingOut}
                    disabled={row.affiliateBalance < 50 || row.payingOut}
                    className="text-xs"
                  >
                    Pay Out
                  </Button>
                  {row.affiliateBalance < 50 && (
                    <p className="text-xs text-slate-500 mt-1">Min NZ$50</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
