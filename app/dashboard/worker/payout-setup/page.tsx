'use client'

/**
 * Worker Payout Setup — /app/dashboard/worker/payout-setup/page.tsx
 *
 * Allows workers to connect their bank account via Stripe Connect so they
 * can receive payouts when jobs are completed and escrow is released.
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import {
  CreditCard,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Shield,
  Zap,
  DollarSign,
} from 'lucide-react'

export default function PayoutSetupPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
    // Check if the worker already has a Stripe account connected
    if (profile && 'stripeAccountId' in profile && profile.stripeAccountId) {
      setIsConnected(true)
    }
  }, [loading, user, profile, router])

  // Check for mock_onboarding return param after redirect back from Stripe
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('mock_onboarding') === '1' || params.get('onboarding') === 'complete') {
        setIsConnected(true)
      }
    }
  }, [])

  async function handleConnectBank() {
    if (!user) return
    setConnecting(true)
    setError(null)
    try {
      const res = await fetch('/api/stripe/connect/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workerId: user.uid,
          email: user.email ?? '',
          refreshUrl: `${window.location.origin}/dashboard/worker/payout-setup`,
          returnUrl: `${window.location.origin}/dashboard/worker/payout-setup?onboarding=complete`,
        }),
      })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'Failed to start bank account setup')
      }
      const data = await res.json() as { url: string }
      window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setConnecting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen luxury-bg">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-slate-400">Loading…</div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen luxury-bg">
      <Navbar />
      <main className="flex-1 py-10 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Back link */}
          <Link
            href="/dashboard/worker/earnings"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Earnings
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Payout Setup</h1>
            <p className="text-slate-400">
              Connect your bank account so you can receive payments when jobs are completed.
            </p>
          </div>

          {/* Status card */}
          {isConnected ? (
            <Card className="mb-6 border-emerald-500/30 bg-emerald-900/20">
              <CardContent className="p-6 flex items-start gap-4">
                <CheckCircle className="h-8 w-8 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-semibold text-lg mb-1">Bank account connected ✅</p>
                  <p className="text-slate-400 text-sm">
                    You&apos;re all set. When a homeowner releases payment from escrow, your earnings will be
                    transferred to your bank account automatically.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-indigo-400" />
                  Connect Your Bank Account
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-400 text-sm">
                  To receive payments when jobs are completed, you need to connect your NZ bank account
                  through Stripe Connect. This is a one-time setup that takes about 2 minutes.
                </p>

                {error && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-red-900/30 border border-red-500/30">
                    <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                )}

                <Button
                  onClick={handleConnectBank}
                  disabled={connecting}
                  className="w-full"
                >
                  {connecting ? 'Redirecting to Stripe…' : 'Connect Your Bank Account'}
                </Button>

                <p className="text-slate-500 text-xs text-center">
                  Powered by Stripe Connect. Your bank details are stored securely by Stripe — not by QuickTrade.
                </p>
              </CardContent>
            </Card>
          )}

          {/* How payouts work */}
          <Card>
            <CardHeader>
              <CardTitle>How payouts work</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="text-white font-medium mb-0.5">Homeowner accepts your quote</p>
                    <p className="text-slate-400 text-sm">They pay the job amount into escrow — funds are held securely by Stripe.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="text-white font-medium mb-0.5">You complete the job</p>
                    <p className="text-slate-400 text-sm">Do the work. The homeowner confirms completion through the app.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    3
                  </div>
                  <div>
                    <p className="text-white font-medium mb-0.5">Payment released to you</p>
                    <p className="text-slate-400 text-sm">
                      Funds are transferred to your bank account, minus the platform commission.
                      Commission ranges from 18% (new workers) down to 10% (elite workers).
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center text-center p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <Shield className="h-5 w-5 text-indigo-400 mb-2" />
                  <p className="text-white text-xs font-semibold">Secure escrow</p>
                </div>
                <div className="flex flex-col items-center text-center p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <Zap className="h-5 w-5 text-emerald-400 mb-2" />
                  <p className="text-white text-xs font-semibold">Fast transfers</p>
                </div>
                <div className="flex flex-col items-center text-center p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <DollarSign className="h-5 w-5 text-yellow-400 mb-2" />
                  <p className="text-white text-xs font-semibold">NZD payouts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
