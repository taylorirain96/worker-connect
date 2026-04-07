'use client'
import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { CheckCircle, AlertCircle, ExternalLink, DollarSign, Shield, Zap } from 'lucide-react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

type ConnectStatus = 'idle' | 'loading' | 'connected' | 'incomplete' | 'error'

function StripeConnectContent() {
  const { user, profile } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<ConnectStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  // Detect return from Stripe onboarding
  const returned = searchParams.get('returned') === '1'
  const refreshed = searchParams.get('refresh') === '1'

  useEffect(() => {
    if (!user) return

    async function checkAccountStatus() {
      const accountId = profile?.stripeAccountId
      if (!accountId) {
        setStatus('idle')
        return
      }

      setStatus('loading')
      try {
        const res = await fetch(`/api/stripe/connect/status?accountId=${encodeURIComponent(accountId)}`)
        if (!res.ok) throw new Error('Failed to fetch account status')
        const data = await res.json() as { payoutsEnabled: boolean; detailsSubmitted: boolean }
        setStatus(data.payoutsEnabled && data.detailsSubmitted ? 'connected' : 'incomplete')
      } catch (err) {
        console.error(err)
        setStatus('error')
        setErrorMessage('Could not verify your Stripe account status.')
      }
    }

    // Always re-check when the user returns from Stripe
    if (returned || refreshed || profile?.stripeAccountId) {
      checkAccountStatus()
    }
  }, [user, profile?.stripeAccountId, returned, refreshed])

  async function handleConnect() {
    if (!user) {
      router.push('/auth/login')
      return
    }

    setStatus('loading')
    setErrorMessage('')

    try {
      let accountId = profile?.stripeAccountId

      // Step 1: Create a Stripe Connect Express account if the worker doesn't have one yet
      if (!accountId) {
        const createRes = await fetch('/api/stripe/connect/account', { method: 'POST' })
        if (!createRes.ok) throw new Error('Failed to create Stripe account')
        const createData = await createRes.json() as { accountId: string }
        accountId = createData.accountId

        // Persist the account ID to Firestore immediately
        if (db) {
          await updateDoc(doc(db, 'users', user.uid), { stripeAccountId: accountId })
        }
      }

      // Step 2: Get the onboarding link
      const origin = window.location.origin
      const linkRes = await fetch('/api/stripe/connect/account-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId,
          refreshUrl: `${origin}/stripe/connect?refresh=1`,
          returnUrl: `${origin}/stripe/connect?returned=1`,
        }),
      })

      if (!linkRes.ok) throw new Error('Failed to get onboarding link')
      const linkData = await linkRes.json() as { url: string }
      window.location.href = linkData.url
    } catch (err) {
      console.error(err)
      setStatus('error')
      setErrorMessage('Something went wrong. Please try again.')
    }
  }

  const isWorker = profile?.role === 'worker'

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-16 w-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl mb-4">
              <DollarSign className="h-8 w-8 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Connect Your Bank Account</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Link your Stripe account to receive payments for completed jobs directly into your bank account.
            </p>
          </div>

          {!isWorker && (
            <Card className="border-yellow-200 dark:border-yellow-800 mb-6">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    This page is for workers only. Employers pay for jobs through the job payment flow.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {status === 'connected' ? (
            <Card className="border-green-200 dark:border-green-800">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center py-4">
                  <CheckCircle className="h-12 w-12 text-green-500 mb-3" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Account Connected!</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Your Stripe account is verified and payouts are enabled. You will receive payment automatically when jobs are marked complete.
                  </p>
                  <Button variant="outline" onClick={() => router.push('/earnings')}>
                    View Earnings
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : status === 'incomplete' ? (
            <Card className="border-yellow-200 dark:border-yellow-800">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center py-4">
                  <AlertCircle className="h-10 w-10 text-yellow-500 mb-3" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Setup Incomplete</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Your Stripe account was created but requires additional information before payouts can be enabled.
                  </p>
                  <Button onClick={handleConnect} className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Continue Setup
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Why do I need this?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-6">
                  {[
                    {
                      icon: <DollarSign className="h-5 w-5 text-primary-600" />,
                      title: 'Get Paid Fast',
                      description: 'Receive payment directly to your bank account within 2 business days of job completion.',
                    },
                    {
                      icon: <Shield className="h-5 w-5 text-green-600" />,
                      title: 'Secure & Trusted',
                      description: 'Powered by Stripe — the same payment infrastructure used by millions of businesses worldwide.',
                    },
                    {
                      icon: <Zap className="h-5 w-5 text-yellow-500" />,
                      title: 'Instant Transfers Available',
                      description: 'Opt into instant payouts (small fee applies) to get funds in minutes instead of days.',
                    },
                  ].map(({ icon, title, description }) => (
                    <div key={title} className="flex gap-3">
                      <div className="flex-shrink-0 mt-0.5">{icon}</div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{title}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {status === 'error' && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg mb-4">
                    <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
                  </div>
                )}

                <Button
                  onClick={handleConnect}
                  disabled={status === 'loading' || !isWorker}
                  className="w-full flex items-center justify-center gap-2"
                >
                  {status === 'loading' ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <ExternalLink className="h-4 w-4" />
                      Connect with Stripe
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-gray-400 mt-3">
                  You will be redirected to Stripe to securely enter your bank details. QuickTrade never stores your banking information.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function StripeConnectPage() {
  return (
    <Suspense fallback={<div className="flex flex-col min-h-screen"><div className="flex-1 flex items-center justify-center"><LoadingSpinner size="lg" /></div></div>}>
      <StripeConnectContent />
    </Suspense>
  )
}
