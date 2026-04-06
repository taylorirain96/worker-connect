'use client'
import { useMemo } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Card, CardContent } from '@/components/ui/Card'
import EarningsChart from '@/components/earnings/EarningsChart'
import { useAuth } from '@/components/providers/AuthProvider'
import { buildEarningsSummary } from '@/lib/earnings/calculateEarnings'
import { calculateMultiplier, getMultiplierSources, formatMultiplier } from '@/lib/earnings/multipliers'
import { formatCurrency } from '@/lib/utils'
import type { EarningsTransaction } from '@/types'
import {
  DollarSign, TrendingUp, Clock, ArrowUpRight, Users, Zap, Info
} from 'lucide-react'
import Button from '@/components/ui/Button'

// ─── Mock data (replace with Firestore calls) ─────────────────────────────────
const MOCK_TRANSACTIONS: EarningsTransaction[] = [
  ...Array.from({ length: 12 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const jobs = 8 - Math.floor(i * 0.5)
    return Array.from({ length: Math.max(1, jobs) }, (__, j) => ({
      id: `${monthStr}-${j}`,
      workerId: 'worker1',
      type: j % 5 === 0 ? ('referral_bonus' as const) : j % 7 === 0 ? ('bonus' as const) : ('job' as const),
      amount: j % 5 === 0 ? 25 : j % 7 === 0 ? 50 : Math.round(15 + Math.random() * 30),
      description: j % 5 === 0 ? 'Referral bonus — Marcus J.' : j % 7 === 0 ? 'Milestone bonus' : 'Job cashback',
      status: i === 0 && j < 2 ? ('pending' as const) : ('available' as const),
      createdAt: new Date(d.getFullYear(), d.getMonth(), 5 + j).toISOString(),
      weekOf: monthStr,
    }))
  }).flat(),
]

const MOCK_MULTIPLIER_CTX = {
  leaderboardRank: 2 as const,
  recentReferral: true,
  recentReferralExpiresAt: new Date(Date.now() + 12 * 86400000).toISOString(),
  loyaltyUnlocked: true,
  photoDocumentation: false,
}

export default function EarningsPage() {
  const { user } = useAuth()
  const summary = useMemo(() => buildEarningsSummary(MOCK_TRANSACTIONS), [])
  const multiplier = useMemo(() => calculateMultiplier(MOCK_MULTIPLIER_CTX), [])
  const multiplierSources = useMemo(() => getMultiplierSources(MOCK_MULTIPLIER_CTX), [])

  const growth =
    summary.totalLastMonth > 0
      ? (((summary.totalThisMonth - summary.totalLastMonth) / summary.totalLastMonth) * 100).toFixed(1)
      : null

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

          {/* Header */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <DollarSign className="h-7 w-7 text-emerald-500" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Earnings</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user?.displayName ?? 'Worker'}&apos;s earnings dashboard
                </p>
              </div>
            </div>
            <Link href="/earnings/withdraw">
              <Button>
                <ArrowUpRight className="h-4 w-4" />
                Withdraw
              </Button>
            </Link>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Lifetime', value: formatCurrency(summary.totalLifetime), sub: 'total', icon: DollarSign, color: 'text-gray-900 dark:text-white' },
              { label: 'This Month', value: formatCurrency(summary.totalThisMonth), sub: growth ? `${growth}% vs last month` : 'vs last month', icon: TrendingUp, color: 'text-emerald-600 dark:text-emerald-400' },
              { label: 'Available', value: formatCurrency(summary.availableBalance), sub: 'ready to withdraw', icon: Zap, color: 'text-primary-600 dark:text-primary-400' },
              { label: 'Pending', value: formatCurrency(summary.pendingBalance), sub: 'processing', icon: Clock, color: 'text-amber-600 dark:text-amber-400' },
            ].map(({ label, value, sub, icon: Icon, color }) => (
              <Card key={label} padding="sm">
                <CardContent>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon className="h-4 w-4 text-gray-400" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
                  </div>
                  <p className={`text-xl font-bold ${color}`}>{value}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">{sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Available balance + quick withdraw */}
          {summary.availableBalance >= 25 && (
            <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20">
              <CardContent>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                      {formatCurrency(summary.availableBalance)} ready to withdraw
                    </p>
                    <p className="text-sm text-emerald-700 dark:text-emerald-400">Standard transfers are free</p>
                  </div>
                  <Link href="/earnings/withdraw">
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                      Withdraw Now
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Multiplier */}
          <Card padding="sm">
            <CardContent>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <span className="font-semibold text-gray-900 dark:text-white">
                    Active Multiplier: {formatMultiplier(multiplier)}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Info className="h-3.5 w-3.5" />
                  Max 3.0x
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {multiplierSources.filter((s) => s.active).map((s) => (
                  <span
                    key={s.id}
                    className="text-xs bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800 px-2 py-1 rounded-full"
                  >
                    {s.label} +{(s.value * 100).toFixed(0)}%
                    {s.expiresAt && (
                      <span className="ml-1 opacity-60">
                        · expires {new Date(s.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </span>
                ))}
                {multiplierSources.filter((s) => s.active).length === 0 && (
                  <span className="text-xs text-gray-400">No active boosts — complete jobs &amp; referrals to earn multipliers!</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Earnings chart */}
          <Card>
            <CardContent>
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Last 12 Months</h2>
              <EarningsChart data={summary.monthlyBreakdown} height={200} />
            </CardContent>
          </Card>

          {/* Breakdown */}
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { label: 'Cashback', amount: summary.cashbackEarned, icon: '💼', color: 'text-primary-600 dark:text-primary-400' },
              { label: 'Referrals', amount: summary.referralEarned, icon: '👥', color: 'text-emerald-600 dark:text-emerald-400' },
              { label: 'Bonuses', amount: summary.bonusEarned, icon: '🎁', color: 'text-purple-600 dark:text-purple-400' },
            ].map(({ label, amount, icon, color }) => (
              <Card key={label} padding="sm">
                <CardContent>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{icon}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">{label}</span>
                  </div>
                  <p className={`text-2xl font-bold ${color}`}>{formatCurrency(amount)}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick links */}
          <div className="flex flex-wrap gap-3">
            <Link href="/earnings/history">
              <Button variant="outline" size="sm">
                Transaction History
              </Button>
            </Link>
            <Link href="/referrals">
              <Button variant="outline" size="sm">
                <Users className="h-4 w-4" />
                Referral Dashboard
              </Button>
            </Link>
            <Link href="/earnings/withdraw">
              <Button variant="outline" size="sm">
                <ArrowUpRight className="h-4 w-4" />
                Withdraw Funds
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
