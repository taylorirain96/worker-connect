'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Button from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { useAuth } from '@/components/providers/AuthProvider'
import { ensureReferralCode, fetchReferrals } from '@/lib/referrals/referralService'
import { REFERRAL_CREDIT_REWARD } from '@/lib/referrals/constants'
import type { Referral, CreditTransaction } from '@/types'
import { Users, Copy, CheckCircle, Gift, Share2, Mail, DollarSign } from 'lucide-react'
import toast from 'react-hot-toast'

function formatNZD(amount: number) {
  return new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: 'NZD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function ReferralDashboardPage() {
  const { user, profile } = useAuth()
  const [referralCode, setReferralCode] = useState<string>('')
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [creditBalance, setCreditBalance] = useState<number>(0)
  const [transactions, setTransactions] = useState<CreditTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  const referralUrl =
    referralCode && typeof window !== 'undefined'
      ? `${window.location.origin}/signup?ref=${referralCode}`
      : ''

  const loadData = useCallback(async () => {
    if (!user?.uid) return
    setLoading(true)
    try {
      const [code, refs] = await Promise.all([
        ensureReferralCode(user.uid),
        fetchReferrals(user.uid),
      ])
      setReferralCode(code)
      setReferrals(refs)

      const res = await fetch(`/api/credits/balance?userId=${user.uid}`)
      if (res.ok) {
        const data = await res.json()
        setCreditBalance(data.credit ?? 0)
        setTransactions(data.transactions ?? [])
      }
    } catch {
      toast.error('Could not load referral data')
    } finally {
      setLoading(false)
    }
  }, [user?.uid])

  useEffect(() => {
    loadData()
  }, [loadData])

  const totalReferred = referrals.length
  const completedFirstJob = referrals.filter(
    (r) => r.status !== 'pending' && r.status !== 'signed_up',
  ).length
  const totalCreditEarned = referrals.reduce((sum, r) => sum + (r.earnedAmount ?? 0), 0)

  const copyLink = async () => {
    if (!referralUrl) return
    await navigator.clipboard.writeText(referralUrl)
    setCopied(true)
    toast.success('Referral link copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const shareWhatsApp = () => {
    const whatsappMessage = encodeURIComponent(
      `Join WorkerConnect and get NZ$${REFERRAL_CREDIT_REWARD} credit on your first job! Sign up here: ${referralUrl}`,
    )
    window.open(`https://wa.me/?text=${whatsappMessage}`, '_blank')
  }

  const shareFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}`,
      '_blank',
    )
  }

  const shareEmail = () => {
    const subject = encodeURIComponent(`Join WorkerConnect — Get NZ$${REFERRAL_CREDIT_REWARD} Credit!`)
    const body = encodeURIComponent(
      `Hey!\n\nI've been using WorkerConnect to find great tradespeople in NZ. Use my referral link to sign up and we'll both get NZ$${REFERRAL_CREDIT_REWARD} credit when you complete your first job.\n\n${referralUrl}\n\nSee you there!`,
    )
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Page header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Gift className="h-6 w-6 text-primary-500" />
              Refer a Friend
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
              Give NZ${REFERRAL_CREDIT_REWARD} credit, get NZ${REFERRAL_CREDIT_REWARD} credit — for every friend who completes their first job.
            </p>
          </div>

          {/* Credit balance banner */}
          {creditBalance > 0 && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl p-4 flex items-center gap-3">
              <DollarSign className="h-6 w-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <div>
                <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                  You have {formatNZD(creditBalance)} credit available
                </p>
                <p className="text-sm text-emerald-600 dark:text-emerald-400">
                  Your credit is automatically applied at checkout.
                </p>
              </div>
            </div>
          )}

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4 text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalReferred}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">People Referred</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{completedFirstJob}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Completed First Job</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatNZD(totalCreditEarned)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Credit Earned</p>
              </CardContent>
            </Card>
          </div>

          {/* Referral link card */}
          <Card>
            <CardContent className="pt-5 space-y-4">
              <h2 className="font-semibold text-gray-900 dark:text-white">Your Referral Link</h2>

              {referralUrl ? (
                <>
                  <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
                    <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate font-mono">
                      {referralUrl}
                    </span>
                    <button
                      onClick={copyLink}
                      className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex-shrink-0"
                      title="Copy link"
                    >
                      {copied ? (
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <Copy className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={copyLink} variant="outline">
                      <Copy className="h-4 w-4 mr-1" />
                      Copy Link
                    </Button>
                    <Button size="sm" onClick={shareWhatsApp} variant="outline">
                      <Share2 className="h-4 w-4 mr-1" />
                      WhatsApp
                    </Button>
                    <Button size="sm" onClick={shareFacebook} variant="outline">
                      <Share2 className="h-4 w-4 mr-1" />
                      Facebook
                    </Button>
                    <Button size="sm" onClick={shareEmail} variant="outline">
                      <Mail className="h-4 w-4 mr-1" />
                      Email
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-400">Loading your referral link…</p>
              )}
            </CardContent>
          </Card>

          {/* How it works */}
          <Card>
            <CardContent className="pt-5 space-y-4">
              <h2 className="font-semibold text-gray-900 dark:text-white">How It Works</h2>
              <ol className="space-y-3">
                {[
                  {
                    step: '1',
                    title: 'Share your link',
                    desc: 'Send your unique referral link to friends, family, or tradespeople you know.',
                  },
                  {
                    step: '2',
                    title: 'They sign up',
                    desc: 'Your contact creates a WorkerConnect account using your link.',
                  },
                  {
                    step: '3',
                    title: `Both get NZ$${REFERRAL_CREDIT_REWARD}`,
                    desc: `When they complete their first job, you each receive NZ$${REFERRAL_CREDIT_REWARD} credit automatically.`,
                  },
                ].map(({ step, title, desc }) => (
                  <li key={step} className="flex gap-3">
                    <span className="h-7 w-7 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-sm font-bold flex items-center justify-center flex-shrink-0">
                      {step}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {/* Referral list */}
          {referrals.length > 0 && (
            <Card>
              <CardContent className="pt-5 space-y-3">
                <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary-500" />
                  Your Referrals
                </h2>
                <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                  {referrals.map((r) => (
                    <li key={r.id} className="py-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {r.referredName ?? r.referredEmail ?? 'Invited User'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {r.status === 'signed_up' ? 'Signed up — awaiting first job' : 'First job completed ✓'}
                        </p>
                      </div>
                      {(r.earnedAmount ?? 0) > 0 && (
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                          +{formatNZD(r.earnedAmount ?? 0)}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Credit transaction history */}
          {transactions.length > 0 && (
            <Card>
              <CardContent className="pt-5 space-y-3">
                <h2 className="font-semibold text-gray-900 dark:text-white">Credit History</h2>
                <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                  {transactions.map((tx) => (
                    <li key={tx.id} className="py-3 flex items-center justify-between gap-3">
                      <p className="text-sm text-gray-700 dark:text-gray-300">{tx.description}</p>
                      <span
                        className={`text-sm font-bold flex-shrink-0 ${
                          tx.amount >= 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-red-500 dark:text-red-400'
                        }`}
                      >
                        {tx.amount >= 0 ? '+' : ''}{formatNZD(tx.amount)}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <div className="text-center">
            <Link
              href="/dashboard"
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
