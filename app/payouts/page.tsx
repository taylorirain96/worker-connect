'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { useAuth } from '@/components/providers/AuthProvider'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  ArrowLeft, TrendingUp, CheckCircle, Clock, XCircle, ArrowRight, ShieldCheck,
  Wallet, AlertCircle, X, Banknote, RefreshCw, Calendar,
} from 'lucide-react'
import toast from 'react-hot-toast'

// ─── Types ────────────────────────────────────────────────────────────────────

interface BalanceData {
  available: number
  pending: number
  currency: string
  stripeAccountId: string
}

interface PayoutHistoryItem {
  id: string
  amount: number
  currency: string
  status: 'paid' | 'in_transit' | 'pending' | 'failed' | 'canceled'
  bankAccountLast4?: string
  bankName?: string
  createdAt: string
  estimatedArrival?: string
  failureMessage?: string
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  PayoutHistoryItem['status'],
  { label: string; badgeClass: string; icon: React.ReactNode }
> = {
  paid: {
    label: 'Paid',
    badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
    icon: <CheckCircle className="h-3.5 w-3.5" />,
  },
  in_transit: {
    label: 'In Transit',
    badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  pending: {
    label: 'Pending',
    badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  failed: {
    label: 'Failed',
    badgeClass: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
  canceled: {
    label: 'Canceled',
    badgeClass: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
}

function StatusBadge({ status }: { status: PayoutHistoryItem['status'] }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.badgeClass}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  )
}

// ─── Withdraw Modal ───────────────────────────────────────────────────────────

interface WithdrawModalProps {
  available: number
  stripeAccountId: string
  onClose: () => void
  onSuccess: () => void
}

function WithdrawModal({ available, stripeAccountId, onClose, onSuccess }: WithdrawModalProps) {
  const [amount, setAmount] = useState<string>(available.toFixed(2))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount.')
      return
    }
    if (numAmount > available) {
      setError('Amount exceeds available balance.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/payouts/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: numAmount }),
      })
      const data = await res.json() as { error?: string }
      if (!res.ok) {
        setError(data.error ?? 'Failed to create payout.')
        return
      }
      setSuccess(true)
      toast.success('Withdrawal initiated! Funds will arrive in 1–3 business days.')
      onSuccess()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Withdraw Funds</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="h-5 w-5" />
          </button>
        </div>

        {success ? (
          <div className="px-6 py-8 text-center">
            <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
            <p className="text-lg font-semibold text-gray-900 dark:text-white">Withdrawal Initiated</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Funds will arrive in your bank account within 1–3 business days.
            </p>
            <Button className="mt-5 w-full" onClick={onClose}>Done</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {/* Available balance */}
            <div className="rounded-xl bg-indigo-50 dark:bg-indigo-900/20 p-4 text-center">
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mb-1">Available Balance</p>
              <p className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">
                {formatCurrency(available)}
              </p>
            </div>

            {/* Amount input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Amount to Withdraw
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input
                  type="number"
                  min="1"
                  max={available}
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 pl-7 pr-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <button
                type="button"
                onClick={() => setAmount(available.toFixed(2))}
                className="mt-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Use full balance
              </button>
            </div>

            {/* Bank account on file */}
            <div className="flex items-center gap-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 px-3 py-2 text-sm text-gray-600 dark:text-gray-300">
              <Banknote className="h-4 w-4 flex-shrink-0 text-gray-400" />
              <span>Bank account on file · Stripe Connect</span>
              <span className="ml-auto font-mono text-xs text-gray-400">
                {stripeAccountId.slice(-6)}
              </span>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm text-red-700 dark:text-red-400">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full gap-2">
              <ArrowRight className="h-4 w-4" />
              Withdraw Funds
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PayoutsPage() {
  const { user } = useAuth()

  const [balance, setBalance] = useState<BalanceData | null>(null)
  const [balanceLoading, setBalanceLoading] = useState(true)
  const [noAccount, setNoAccount] = useState(false)

  const [payouts, setPayouts] = useState<PayoutHistoryItem[]>([])
  const [payoutsLoading, setPayoutsLoading] = useState(true)

  const [totalEarned, setTotalEarned] = useState<number | null>(null)

  const [showWithdrawModal, setShowWithdrawModal] = useState(false)

  // ── Next payout date — earliest estimatedArrival from in_transit/pending payouts ──
  const nextPayoutDate = useMemo(() => {
    const upcoming = payouts
      .filter((p) => (p.status === 'in_transit' || p.status === 'pending') && p.estimatedArrival)
      .map((p) => new Date(p.estimatedArrival!).getTime())
    if (upcoming.length === 0) return null
    return new Date(Math.min(...upcoming))
  }, [payouts])


  const fetchBalance = useCallback(async () => {
    if (!user) return
    setBalanceLoading(true)
    try {
      const res = await fetch('/api/payouts/balance', {
        headers: { 'x-user-id': user.uid },
      })
      if (res.status === 404) {
        setNoAccount(true)
        return
      }
      if (!res.ok) return
      const data = await res.json() as BalanceData
      setBalance(data)
    } catch {
      // silently fail — UI shows dashes
    } finally {
      setBalanceLoading(false)
    }
  }, [user])

  // ── Fetch payout history ─────────────────────────────────────────────────────
  const fetchHistory = useCallback(async () => {
    if (!user) return
    setPayoutsLoading(true)
    try {
      const res = await fetch('/api/payouts/history', {
        headers: { 'x-user-id': user.uid },
      })
      if (!res.ok) return
      const data = await res.json() as { payouts: PayoutHistoryItem[] }
      setPayouts(data.payouts ?? [])
    } catch {
      // silently fail
    } finally {
      setPayoutsLoading(false)
    }
  }, [user])

  // ── Fetch total earned from tax earnings ─────────────────────────────────────
  const fetchTotalEarned = useCallback(async () => {
    if (!user) return
    try {
      const res = await fetch(`/api/tax/earnings/${user.uid}`, {
        headers: { 'x-user-id': user.uid },
      })
      if (!res.ok) return
      const data = await res.json() as { totals?: { gross: number } }
      setTotalEarned(data.totals?.gross ?? null)
    } catch {
      // silently fail
    }
  }, [user])

  useEffect(() => {
    fetchBalance()
    fetchHistory()
    fetchTotalEarned()
  }, [fetchBalance, fetchHistory, fetchTotalEarned])

  const handleWithdrawSuccess = () => {
    fetchBalance()
    fetchHistory()
  }

  // ── Empty state — no Stripe Connect account ──────────────────────────────────
  if (!balanceLoading && noAccount) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            <Link
              href="/payments"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Payments
            </Link>

            <div className="flex items-center gap-3">
              <TrendingUp className="h-7 w-7 text-indigo-600" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Payouts</h1>
            </div>

            <Card>
              <CardContent>
                <div className="py-8 text-center space-y-4">
                  <ShieldCheck className="h-14 w-14 text-indigo-300 dark:text-indigo-600 mx-auto" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Set up your bank account
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                    Connect your bank account via Stripe to start receiving payouts for completed jobs.
                  </p>
                  <Link href="/stripe">
                    <Button className="gap-2 mt-2">
                      <Banknote className="h-4 w-4" />
                      Set Up Bank Account
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

          {/* Back link */}
          <Link
            href="/payments"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Payments
          </Link>

          {/* Header */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-7 w-7 text-indigo-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Payouts</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user?.displayName ?? 'Worker'}&apos;s earnings &amp; withdrawals
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowWithdrawModal(true)}
              disabled={!balance || balance.available <= 0}
              className="gap-2"
            >
              <Wallet className="h-4 w-4" />
              Withdraw Funds
            </Button>
          </div>

          {/* Balance summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Available Balance */}
            <Card className="border-indigo-200 dark:border-indigo-800">
              <CardContent>
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="h-4 w-4 text-indigo-500" />
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Available Balance
                  </p>
                </div>
                {balanceLoading ? (
                  <div className="h-7 w-24 bg-gray-100 dark:bg-gray-700 animate-pulse rounded" />
                ) : (
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {balance ? formatCurrency(balance.available) : '—'}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">Ready to withdraw</p>
              </CardContent>
            </Card>

            {/* Pending Balance */}
            <Card className="border-amber-200 dark:border-amber-800">
              <CardContent>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Pending Balance
                  </p>
                </div>
                {balanceLoading ? (
                  <div className="h-7 w-24 bg-gray-100 dark:bg-gray-700 animate-pulse rounded" />
                ) : (
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {balance ? formatCurrency(balance.pending) : '—'}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">In transit / settling</p>
              </CardContent>
            </Card>

            {/* Total Earned */}
            <Card className="border-emerald-200 dark:border-emerald-800">
              <CardContent>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Total Earned
                  </p>
                </div>
                {totalEarned === null ? (
                  <div className="h-7 w-24 bg-gray-100 dark:bg-gray-700 animate-pulse rounded" />
                ) : (
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(totalEarned)}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">All time</p>
              </CardContent>
            </Card>

            {/* Next Payout */}
            <Card className="border-violet-200 dark:border-violet-800">
              <CardContent>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-violet-500" />
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Next Payout
                  </p>
                </div>
                {payoutsLoading ? (
                  <div className="h-7 w-24 bg-gray-100 dark:bg-gray-700 animate-pulse rounded" />
                ) : (
                  <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                    {nextPayoutDate
                      ? nextPayoutDate.toLocaleDateString('en-NZ', { day: 'numeric', month: 'short' })
                      : '—'}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">Estimated arrival</p>
              </CardContent>
            </Card>
          </div>

          {/* Payout history */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-900 dark:text-white">Payout History</h2>
              <button
                onClick={fetchHistory}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                title="Refresh"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>

            <Card padding="none">
              {/* Table header */}
              <div className="hidden sm:grid grid-cols-4 gap-4 px-5 py-3 border-b border-gray-100 dark:border-gray-700 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                <span>Date</span>
                <span>Amount</span>
                <span>Status</span>
                <span>Bank Account</span>
              </div>

              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {payoutsLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 px-5 py-4">
                      <div className="h-4 flex-1 bg-gray-100 dark:bg-gray-700 animate-pulse rounded" />
                    </div>
                  ))
                ) : payouts.length === 0 ? (
                  <div className="py-12 text-center text-gray-400 dark:text-gray-600">
                    <TrendingUp className="h-10 w-10 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No payouts yet</p>
                  </div>
                ) : (
                  payouts.map((payout) => (
                    <div
                      key={payout.id}
                      className="grid grid-cols-1 sm:grid-cols-4 gap-1 sm:gap-4 items-center px-5 py-4"
                    >
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {formatDate(payout.createdAt)}
                      </span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(payout.amount)}
                      </span>
                      <span>
                        <StatusBadge status={payout.status} />
                        {payout.failureMessage && (
                          <p className="text-xs text-red-500 mt-0.5">{payout.failureMessage}</p>
                        )}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                        {payout.bankName ?? 'Bank'}
                        {payout.bankAccountLast4 && ` ···· ${payout.bankAccountLast4}`}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Secure note */}
          <div className="flex items-start gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl text-sm text-indigo-800 dark:text-indigo-300">
            <ShieldCheck className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-0.5">Secure Payouts via Stripe Connect</p>
              <p>
                All payouts are processed securely through Stripe.{' '}
                <Link href="/stripe" className="underline">
                  Manage bank account
                </Link>{' '}
                to update your payout destination.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Withdraw modal */}
      {showWithdrawModal && balance && (
        <WithdrawModal
          available={balance.available}
          stripeAccountId={balance.stripeAccountId}
          onClose={() => setShowWithdrawModal(false)}
          onSuccess={handleWithdrawSuccess}
        />
      )}
    </div>
  )
}
