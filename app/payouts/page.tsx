'use client'
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { useAuth } from '@/components/providers/AuthProvider'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Payout, PayoutSettings } from '@/types'
import {
  ArrowLeft, TrendingUp, CheckCircle, Clock, XCircle, Settings, ArrowRight, ShieldCheck
} from 'lucide-react'
import toast from 'react-hot-toast'

// ─── Mock data (replace with Firestore calls via paymentService) ──────────────
const MOCK_PAYOUTS: Payout[] = [
  {
    id: 'po_1',
    workerId: 'worker_1',
    amount: 250,
    currency: 'usd',
    method: 'bank_account',
    status: 'paid',
    bankAccountLast4: '4242',
    bankName: 'Chase',
    estimatedArrival: new Date(Date.now() - 3 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    paidAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'po_2',
    workerId: 'worker_1',
    amount: 180,
    currency: 'usd',
    method: 'bank_account',
    status: 'in_transit',
    bankAccountLast4: '4242',
    bankName: 'Chase',
    estimatedArrival: new Date(Date.now() + 2 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'po_3',
    workerId: 'worker_1',
    amount: 95,
    currency: 'usd',
    method: 'bank_account',
    status: 'failed',
    failureMessage: 'Insufficient funds in connected account',
    bankAccountLast4: '8888',
    bankName: 'Wells Fargo',
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
]

const MOCK_SETTINGS: PayoutSettings = {
  workerId: 'worker_1',
  schedule: 'weekly',
  minimumAmount: 50,
  method: 'bank_account',
  bankAccountId: 'ba_1',
  updatedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
}

const STATUS_CONFIG: Record<Payout['status'], { label: string; icon: React.ReactNode; className: string }> = {
  pending: {
    label: 'Pending',
    icon: <Clock className="h-4 w-4 text-amber-500" />,
    className: 'text-amber-600',
  },
  in_transit: {
    label: 'In Transit',
    icon: <Clock className="h-4 w-4 text-blue-500" />,
    className: 'text-blue-600',
  },
  paid: {
    label: 'Paid',
    icon: <CheckCircle className="h-4 w-4 text-emerald-500" />,
    className: 'text-emerald-600',
  },
  failed: {
    label: 'Failed',
    icon: <XCircle className="h-4 w-4 text-red-500" />,
    className: 'text-red-600',
  },
  canceled: {
    label: 'Canceled',
    icon: <XCircle className="h-4 w-4 text-gray-400" />,
    className: 'text-gray-500',
  },
}

const SCHEDULE_LABELS: Record<PayoutSettings['schedule'], string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  manual: 'Manual',
}

export default function PayoutsPage() {
  const { user } = useAuth()
  const [settings, setSettings] = useState<PayoutSettings>(MOCK_SETTINGS)
  const [showSettings, setShowSettings] = useState(false)
  const [isRequesting, setIsRequesting] = useState(false)

  const totalPaid = MOCK_PAYOUTS
    .filter((p) => p.status === 'paid')
    .reduce((s, p) => s + p.amount, 0)
  const inTransit = MOCK_PAYOUTS
    .filter((p) => p.status === 'in_transit')
    .reduce((s, p) => s + p.amount, 0)

  const handleRequestPayout = async () => {
    setIsRequesting(true)
    try {
      // In production, call POST /api/payouts with workerId, amount, stripeConnectAccountId
      await new Promise((r) => setTimeout(r, 1000))
      toast.success('Payout requested! Funds will arrive in 1-3 business days.')
    } catch {
      toast.error('Failed to request payout. Please try again.')
    } finally {
      setIsRequesting(false)
    }
  }

  const handleSaveSettings = () => {
    // In production, call paymentService.savePayoutSettings(workerId, settings)
    toast.success('Payout settings saved!')
    setShowSettings(false)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">

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
              <TrendingUp className="h-7 w-7 text-emerald-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Payouts</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user?.displayName ?? 'Worker'}&apos;s payout history
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowSettings(!showSettings)}>
                <Settings className="h-4 w-4" />
                Settings
              </Button>
              <Button size="sm" onClick={handleRequestPayout} disabled={isRequesting}>
                {isRequesting ? 'Requesting...' : 'Request Payout'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <Card padding="sm">
              <CardContent>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Paid Out</p>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(totalPaid)}
                </p>
              </CardContent>
            </Card>
            <Card padding="sm">
              <CardContent>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">In Transit</p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(inTransit)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Payout schedule info */}
          <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20">
            <CardContent>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                    {SCHEDULE_LABELS[settings.schedule]} automatic payouts
                  </p>
                  <p className="text-sm text-emerald-700 dark:text-emerald-400">
                    Minimum threshold: {formatCurrency(settings.minimumAmount)} · Method: Bank account
                  </p>
                </div>
                <ShieldCheck className="h-8 w-8 text-emerald-500 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          {/* Settings panel */}
          {showSettings && (
            <Card>
              <CardContent>
                <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Payout Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Payout Schedule
                    </label>
                    <select
                      value={settings.schedule}
                      onChange={(e) => setSettings({ ...settings, schedule: e.target.value as PayoutSettings['schedule'] })}
                      className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="manual">Manual (on request)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Minimum Payout Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                      <input
                        type="number"
                        min={25}
                        value={settings.minimumAmount}
                        onChange={(e) => setSettings({ ...settings, minimumAmount: Number(e.target.value) })}
                        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 pl-7 pr-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Minimum is $25.00</p>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <Button variant="ghost" size="sm" onClick={() => setShowSettings(false)}>Cancel</Button>
                    <Button size="sm" onClick={handleSaveSettings}>Save Settings</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payout history */}
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Payout History</h2>
            <Card padding="none">
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {MOCK_PAYOUTS.length === 0 ? (
                  <div className="py-12 text-center text-gray-400 dark:text-gray-600">
                    <TrendingUp className="h-10 w-10 mx-auto mb-2 opacity-40" />
                    No payouts yet
                  </div>
                ) : (
                  MOCK_PAYOUTS.map((payout) => {
                    const cfg = STATUS_CONFIG[payout.status]
                    return (
                      <div key={payout.id} className="flex items-center gap-4 px-5 py-4">
                        <div className="flex-shrink-0">{cfg.icon}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {payout.bankName ?? 'Bank account'}
                            {payout.bankAccountLast4 && ` ···· ${payout.bankAccountLast4}`}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {formatDate(payout.createdAt)}
                            {payout.estimatedArrival && (
                              <span className="ml-2">· Est. arrival {formatDate(payout.estimatedArrival)}</span>
                            )}
                          </p>
                          {payout.failureMessage && (
                            <p className="text-xs text-red-500 mt-0.5">{payout.failureMessage}</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(payout.amount)}
                          </span>
                          <span className={`text-xs font-medium ${cfg.className}`}>{cfg.label}</span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </Card>
          </div>

          {/* Bank account setup note */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-sm text-blue-800 dark:text-blue-300">
            <ShieldCheck className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-0.5">Secure Payouts via Stripe Connect</p>
              <p>
                All payouts are processed securely through Stripe.{' '}
                <Link href="/earnings/withdraw" className="underline">
                  Manage bank accounts
                </Link>{' '}
                to update your payout destination.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
