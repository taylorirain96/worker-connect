'use client'
import { useState } from 'react'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import Button from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { CreditCard, Wallet, Building2, Lock, AlertCircle } from 'lucide-react'
import type { PaymentMethod, Currency } from '@/types/payment'

// ─── Stripe Loader ─────────────────────────────────────────────────────────────

const stripePromise = typeof window !== 'undefined'
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '')
  : null

// ─── Card appearance ───────────────────────────────────────────────────────────

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '15px',
      color: '#374151',
      fontFamily: 'ui-sans-serif, system-ui, sans-serif',
      '::placeholder': { color: '#9ca3af' },
    },
    invalid: { color: '#ef4444' },
  },
}

// ─── Inner form (must live inside <Elements>) ──────────────────────────────────

interface InnerFormProps {
  amount: number
  currency: Currency
  jobId: string
  employerId: string
  workerId: string
  onSuccess: (paymentId: string) => void
  onError: (message: string) => void
}

function PaymentFormInner({ amount, currency, jobId, employerId, workerId, onSuccess, onError }: InnerFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [method, setMethod] = useState<PaymentMethod>('card')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setLoading(true)
    setError(null)

    try {
      // Step 1 — create intent
      const intentRes = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency, jobId, employerId, workerId, method }),
      })
      const intentData = await intentRes.json() as { clientSecret?: string; error?: string }
      if (!intentRes.ok || !intentData.clientSecret) {
        throw new Error(intentData.error ?? 'Failed to create payment intent')
      }

      // Step 2 — confirm with Stripe.js
      const cardEl = elements.getElement(CardElement)
      if (!cardEl) throw new Error('Card element not found')

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(intentData.clientSecret, {
        payment_method: { card: cardEl },
      })

      if (stripeError) throw new Error(stripeError.message ?? 'Payment failed')
      if (paymentIntent?.status === 'succeeded' || paymentIntent?.status === 'processing') {
        onSuccess(paymentIntent.id)
      } else {
        throw new Error('Unexpected payment status: ' + paymentIntent?.status)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Payment failed. Please try again.'
      setError(msg)
      onError(msg)
    } finally {
      setLoading(false)
    }
  }

  const METHODS: { id: PaymentMethod; label: string; icon: React.ReactNode }[] = [
    { id: 'card', label: 'Credit / Debit Card', icon: <CreditCard className="h-4 w-4" /> },
    { id: 'wallet', label: 'Digital Wallet', icon: <Wallet className="h-4 w-4" /> },
    { id: 'bank_transfer', label: 'Bank Transfer', icon: <Building2 className="h-4 w-4" /> },
  ]

  const formattedAmount = new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment method selector */}
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Payment method</p>
        <div className="grid grid-cols-3 gap-2">
          {METHODS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMethod(m.id)}
              className={`flex flex-col items-center gap-1 px-3 py-3 rounded-lg border text-xs font-medium transition-colors
                ${method === m.id
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                  : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
            >
              {m.icon}
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Card element */}
      {method === 'card' && (
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Card details</p>
          <div className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800">
            <CardElement options={CARD_ELEMENT_OPTIONS} />
          </div>
        </div>
      )}

      {method === 'bank_transfer' && (
        <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 text-sm text-blue-700 dark:text-blue-300">
          Bank transfer instructions will be sent to your email after confirmation.
        </div>
      )}

      {method === 'wallet' && (
        <div className="rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 p-4 text-sm text-gray-600 dark:text-gray-400">
          Your browser&apos;s digital wallet (Apple Pay, Google Pay) will be used if available.
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Security note */}
      <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
        <Lock className="h-3.5 w-3.5" />
        Payments are encrypted and secured by Stripe. We never store your card details.
      </div>

      <Button type="submit" loading={loading} disabled={!stripe} className="w-full" size="lg">
        Pay {formattedAmount}
      </Button>
    </form>
  )
}

// ─── Public component ──────────────────────────────────────────────────────────

export interface PaymentFormProps {
  amount: number
  currency?: Currency
  jobId: string
  employerId: string
  workerId: string
  onSuccess?: (paymentId: string) => void
  onError?: (message: string) => void
}

export default function PaymentForm({
  amount,
  currency = 'usd',
  jobId,
  employerId,
  workerId,
  onSuccess,
  onError,
}: PaymentFormProps) {
  if (!stripePromise) {
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Stripe is not configured. Set <code className="font-mono text-xs">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> to enable payments.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Complete Payment</CardTitle>
      </CardHeader>
      <CardContent>
        <Elements stripe={stripePromise}>
          <PaymentFormInner
            amount={amount}
            currency={currency}
            jobId={jobId}
            employerId={employerId}
            workerId={workerId}
            onSuccess={onSuccess ?? (() => {})}
            onError={onError ?? (() => {})}
          />
        </Elements>
      </CardContent>
    </Card>
  )
}
