'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Zap, Check, Star, RefreshCw } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import SubscriptionSelector from '@/components/payments/SubscriptionSelector'
import toast from 'react-hot-toast'
import { SUBSCRIPTION_PLANS } from '@/types/payment'
import type { Subscription } from '@/types/payment'
import type { BoostTransaction } from '@/types'
import { cn } from '@/lib/utils'

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NZ', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function WorkerSubscriptionPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [boosts, setBoosts] = useState(0)
  const [boostHistory, setBoostHistory] = useState<BoostTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/login')
  }, [user, authLoading, router])

  const fetchSubscription = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const res = await fetch(`/api/subscriptions?userId=${user.uid}`)
      if (!res.ok) throw new Error('Failed to load subscription')
      const data = await res.json() as { subscription: Subscription | null }
      setSubscription(data.subscription)

      const boostsRes = await fetch(`/api/boosts/balance?userId=${user.uid}`, {
        headers: { 'x-user-id': user.uid },
      })
      if (boostsRes.ok) {
        const boostsData = await boostsRes.json() as { boosts: number; transactions: BoostTransaction[] }
        setBoosts(boostsData.boosts)
        setBoostHistory(boostsData.transactions)
      }
    } catch {
      toast.error('Could not load subscription. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) void fetchSubscription()
  }, [user, fetchSubscription])

  const handleCancel = async () => {
    if (!user || !subscription) return
    if (!confirm('Are you sure you want to cancel your Pro subscription? You will lose Pro benefits at the end of your billing period.')) return
    setCancelling(true)
    try {
      const res = await fetch(`/api/subscriptions/${subscription.id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': user.uid },
      })
      if (!res.ok) throw new Error('Cancel failed')
      toast.success('Subscription cancelled. You keep Pro access until the end of your billing period.')
      await fetchSubscription()
    } catch {
      toast.error('Could not cancel subscription. Please try again.')
    } finally {
      setCancelling(false)
    }
  }

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  const currentPlan = subscription?.plan ?? 'free'
  const planConfig = SUBSCRIPTION_PLANS.find((p) => p.id === currentPlan) ?? SUBSCRIPTION_PLANS[0]

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <main className="flex-1 py-8 px-4">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/worker"
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Plan</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage your QuickTrade subscription</p>
            </div>
          </div>

          {loading && (
            <div className="flex justify-center py-16">
              <LoadingSpinner />
            </div>
          )}

          {!loading && (
            <>
              {/* Current Plan Card */}
              <Card className={cn(
                'border-2',
                currentPlan === 'pro' ? 'border-indigo-500' : 'border-gray-200 dark:border-gray-700'
              )}>
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'p-2.5 rounded-xl',
                        currentPlan === 'pro' ? 'bg-indigo-100 dark:bg-indigo-900/30' : 'bg-gray-100 dark:bg-gray-800'
                      )}>
                        {currentPlan === 'pro'
                          ? <Zap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                          : <Star className="h-5 w-5 text-gray-400" />
                        }
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{planConfig.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{planConfig.description}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {planConfig.monthlyPrice === 0 ? 'Free' : `$${planConfig.monthlyPrice} NZD/mo`}
                      </p>
                      {subscription?.status && (
                        <span className={cn(
                          'inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-1',
                          subscription.status === 'active'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        )}>
                          {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="mt-4 space-y-1.5">
                    {planConfig.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <Check className="h-4 w-4 text-indigo-500 mt-0.5 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {/* Billing info */}
                  {subscription && currentPlan !== 'free' && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span>
                        {subscription.cancelAtPeriodEnd
                          ? `Cancels on ${fmtDate(subscription.currentPeriodEnd)}`
                          : `Renews on ${fmtDate(subscription.currentPeriodEnd)}`
                        }
                      </span>
                      {!subscription.cancelAtPeriodEnd && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => void handleCancel()}
                          disabled={cancelling}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          {cancelling ? (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            'Cancel plan'
                          )}
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Upgrade / Change Plan */}
              {currentPlan === 'free' && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Upgrade Your Plan</h2>
                  <SubscriptionSelector
                    currentSubscription={subscription}
                    userId={user!.uid}
                    onSubscribed={(sub) => {
                      setSubscription(sub)
                      toast.success('Plan upgraded successfully!')
                    }}
                  />
                </div>
              )}

              {currentPlan !== 'free' && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  To change your plan,{' '}
                  <Link href="/contact" className="text-indigo-600 hover:underline">contact support</Link>.
                </p>
              )}

              <Card>
                <CardContent className="pt-5 space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Boosts</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Earn Boosts from achievements and leaderboard finishes.</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{boosts}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">available</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Recent Boost activity</p>
                    {boostHistory.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">No Boost activity yet.</p>
                    ) : (
                      <ul className="space-y-2">
                        {boostHistory.map((transaction) => (
                          <li
                            key={transaction.id}
                            className="flex items-start justify-between gap-4 rounded-lg border border-gray-100 dark:border-gray-800 px-3 py-2"
                          >
                            <div>
                              <p className="text-sm text-gray-900 dark:text-white">{transaction.reason}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{fmtDate(transaction.createdAt)}</p>
                            </div>
                            <span className={cn(
                              'text-sm font-semibold',
                              transaction.amount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400',
                            )}>
                              {transaction.amount >= 0 ? '+' : ''}{transaction.amount}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
