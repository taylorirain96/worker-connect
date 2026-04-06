'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Button from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import ReferralCard from '@/components/referrals/ReferralCard'
import ReferralQRCode from '@/components/referrals/ReferralQRCode'
import { useAuth } from '@/components/providers/AuthProvider'
import {
  generateReferralCode,
  getReferralUrl,
  buildReferralStats,
  MILESTONE_BONUSES,
  REFERRAL_BONUSES,
} from '@/lib/referrals/referralLogic'
import { formatCurrency } from '@/lib/utils'
import type { Referral } from '@/types'
import {
  Users, Copy, Share2, CheckCircle, Gift, TrendingUp, Award
} from 'lucide-react'
import toast from 'react-hot-toast'

// ─── Mock data (replace with Firestore calls) ─────────────────────────────────
const MOCK_REFERRALS: Referral[] = [
  {
    id: '1',
    referrerId: 'worker1',
    referredId: 'worker2',
    referralCode: 'QT-AB12-XYZ',
    status: 'completed_3',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    earnedAmount: 25,
    referredName: 'Marcus Johnson',
    jobsCompleted: 5,
  },
  {
    id: '2',
    referrerId: 'worker1',
    referredId: 'worker3',
    referralCode: 'QT-AB12-XYZ',
    status: 'signed_up',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    earnedAmount: 0,
    referredName: 'Sarah Williams',
    jobsCompleted: 0,
  },
  {
    id: '3',
    referrerId: 'worker1',
    referredId: undefined,
    referralCode: 'QT-AB12-XYZ',
    status: 'pending',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    earnedAmount: 0,
    referredEmail: 'tom@example.com',
  },
  {
    id: '4',
    referrerId: 'worker1',
    referredId: 'worker4',
    referralCode: 'QT-AB12-XYZ',
    status: 'trusted_pro',
    createdAt: new Date(Date.now() - 180 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    earnedAmount: 175,
    referredName: 'Elena Rodriguez',
    jobsCompleted: 60,
  },
]

export default function ReferralsPage() {
  const { user } = useAuth()
  const referralCode = useMemo(
    () => (user?.uid ? generateReferralCode(user.uid) : 'QT-DEMO-CODE'),
    [user?.uid]
  )
  const referralUrl = getReferralUrl(referralCode)

  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')
  const [copied, setCopied] = useState(false)

  const stats = useMemo(() => buildReferralStats(MOCK_REFERRALS), [])

  const filtered = useMemo(() => {
    if (filter === 'active') return MOCK_REFERRALS.filter((r) => r.status === 'pending' || r.status === 'signed_up')
    if (filter === 'completed') return MOCK_REFERRALS.filter((r) => r.status !== 'pending' && r.status !== 'signed_up')
    return MOCK_REFERRALS
  }, [filter])

  const copyCode = async () => {
    await navigator.clipboard.writeText(referralCode)
    setCopied(true)
    toast.success('Referral code copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const copyLink = async () => {
    await navigator.clipboard.writeText(referralUrl)
    toast.success('Referral link copied!')
  }

  const shareLink = async () => {
    if (navigator.share) {
      await navigator.share({ title: 'Join QuickTrade!', url: referralUrl })
    } else {
      await copyLink()
    }
  }

  const milestoneNext = MILESTONE_BONUSES.find((m) => stats.milestoneProgress.current < m.referrals)

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

          {/* Header */}
          <div className="flex items-center gap-3">
            <Users className="h-7 w-7 text-primary-600 dark:text-primary-400" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Referrals</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Earn up to {formatCurrency(REFERRAL_BONUSES.trusted_pro)} per referred worker
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Referred', value: stats.totalReferred, icon: Users },
              { label: 'Completed', value: stats.totalCompleted, icon: CheckCircle },
              { label: 'Conversion', value: `${stats.conversionRate}%`, icon: TrendingUp },
              { label: 'Total Earned', value: formatCurrency(stats.totalEarned), icon: Gift },
            ].map(({ label, value, icon: Icon }) => (
              <Card key={label} padding="sm">
                <CardContent>
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="h-4 w-4 text-primary-500" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Milestone progress */}
          {milestoneNext && (
            <Card padding="sm">
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-500" />
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">
                      Milestone Bonus — {milestoneNext.referrals} referrals = {formatCurrency(milestoneNext.bonus)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {stats.milestoneProgress.current} / {milestoneNext.referrals}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min((stats.milestoneProgress.current / milestoneNext.referrals) * 100, 100)}%`,
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Referral code card */}
          <Card>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* QR code */}
                <div className="flex-shrink-0 p-3 bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                  <ReferralQRCode value={referralUrl} size={112} />
                </div>

                {/* Code + actions */}
                <div className="flex-1 min-w-0 space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Your Referral Code</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold tracking-widest text-primary-600 dark:text-primary-400 font-mono">
                        {referralCode}
                      </span>
                      <button
                        onClick={copyCode}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                        title="Copy code"
                      >
                        {copied ? <CheckCircle className="h-5 w-5 text-emerald-500" /> : <Copy className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={copyLink} variant="outline">
                      <Copy className="h-4 w-4" />
                      Copy Link
                    </Button>
                    <Button size="sm" onClick={shareLink}>
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                  </div>

                  <p className="text-xs text-gray-400 dark:text-gray-500 break-all">{referralUrl}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bonus tiers */}
          <Card padding="sm">
            <CardContent>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Bonus Structure</h2>
              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  { label: 'First 3 Jobs', amount: REFERRAL_BONUSES.completed_3, icon: '🎯' },
                  { label: '50 Jobs Done', amount: REFERRAL_BONUSES.completed_50, icon: '🏆' },
                  { label: 'Trusted Pro', amount: REFERRAL_BONUSES.trusted_pro, icon: '⭐' },
                ].map(({ label, amount, icon }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <span className="text-2xl">{icon}</span>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                      <p className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(amount)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Referral list */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-900 dark:text-white">Your Referrals</h2>
              <div className="flex gap-1">
                {(['all', 'active', 'completed'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`text-xs px-3 py-1 rounded-full capitalize transition-colors ${
                      filter === f
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {filtered.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No referrals yet. Share your code!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {filtered.map((r) => (
                  <ReferralCard key={r.id} referral={r} />
                ))}
              </div>
            )}
          </div>

          {/* Link to earnings */}
          <div className="text-center">
            <Link
              href="/earnings"
              className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 hover:underline"
            >
              View your full earnings dashboard →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
