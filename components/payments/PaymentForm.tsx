'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '@/components/ui/Button'
import { CreditCard, Lock, AlertCircle, Wallet, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

type PaymentMethod = 'card' | 'wallet' | 'bank_transfer'

const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: React.ReactNode; description: string }[] = [
  {
    id: 'card',
    label: 'Credit / Debit card',
    icon: <CreditCard className="h-4 w-4" />,
    description: 'Visa, Mastercard, Amex',
  },
  {
    id: 'wallet',
    label: 'Digital wallet',
    icon: <Wallet className="h-4 w-4" />,
    description: 'Apple Pay, Google Pay',
  },
  {
    id: 'bank_transfer',
    label: 'Bank transfer',
    icon: <Building2 className="h-4 w-4" />,
    description: 'ACH / direct debit',
  },
]

const schema = z.object({
  cardholderName: z.string().min(2, 'Cardholder name is required'),
  email: z.string().email('Valid email required'),
})

type FormData = z.infer<typeof schema>

interface PaymentFormProps {
  amount: number
  currency?: string
  jobId: string
  employerId: string
  workerId: string
  description?: string
  onSuccess?: (paymentIntentId: string) => void
  onError?: (error: string) => void
}

export default function PaymentForm({
  amount,
  currency = 'usd',
  jobId,
  employerId,
  workerId,
  description,
  onSuccess,
  onError,
}: PaymentFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setError(null)

    try {
      // Step 1: Create a Stripe PaymentIntent via /api/payments/create-intent
      const intentRes = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          currency,
          jobId,
          employerId,
          workerId,
          description,
          paymentMethod,
        }),
      })

      if (!intentRes.ok) {
        const err = (await intentRes.json()) as { error?: string }
        throw new Error(err.error ?? 'Failed to create payment intent')
      }

      const { paymentIntentId, clientSecret } = (await intentRes.json()) as {
        paymentIntentId: string
        clientSecret: string
      }

      // Step 2: Confirm via /api/payments/confirm
      // TODO: In production, use Stripe.js to confirm with real credentials:
      //   - card: await stripe.confirmCardPayment(clientSecret, { payment_method: { card: cardElement, billing_details: { name: data.cardholderName, email: data.email } } })
      //   - wallet: await stripe.confirmPaymentIntent(clientSecret, { payment_method: 'apple_pay' / 'google_pay' })
      //   - bank_transfer: await stripe.confirmUsBankAccountPayment(clientSecret, ...)
      // The server-side confirm route handles cases where Stripe keys are absent (returns mock success).
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _clientSecret = clientSecret
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _formData = data

      const confirmRes = await fetch('/api/payments/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentIntentId,
          // TODO: replace with the real Stripe payment method ID obtained via Stripe.js
          paymentMethodId: `pm_mock_${paymentMethod}_${Date.now()}`,
        }),
      })

      if (!confirmRes.ok) {
        const err = (await confirmRes.json()) as { error?: string }
        throw new Error(err.error ?? 'Payment confirmation failed')
      }

      toast.success('Payment successful!')
      onSuccess?.(paymentIntentId)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Payment failed'
      setError(message)
      onError?.(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {/* Amount summary */}
      <div className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-800 px-4 py-3">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {description ?? 'Payment'}
        </span>
        <span className="font-semibold text-gray-900 dark:text-white">
          {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)}
        </span>
      </div>

      {/* Payment method selector */}
      <fieldset>
        <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Payment method
        </legend>
        <div className="grid grid-cols-3 gap-2">
          {PAYMENT_METHODS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setPaymentMethod(m.id)}
              aria-pressed={paymentMethod === m.id}
              className={cn(
                'flex flex-col items-center gap-1 rounded-lg border px-2 py-3 text-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                paymentMethod === m.id
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
              )}
            >
              <span aria-hidden="true">{m.icon}</span>
              <span className="font-medium leading-tight text-center">{m.label}</span>
              <span className="text-[10px] opacity-70 leading-tight text-center">{m.description}</span>
            </button>
          ))}
        </div>
      </fieldset>

      {paymentMethod === 'card' && (
        <>
          {/* Cardholder name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cardholder name
            </label>
            <input
              {...register('cardholderName')}
              type="text"
              autoComplete="cc-name"
              placeholder="Jane Smith"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {errors.cardholderName && (
              <p className="mt-1 text-xs text-red-600">{errors.cardholderName.message}</p>
            )}
          </div>

          {/* Stripe card element placeholder */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Card details
            </label>
            <div className="flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2.5">
              <CreditCard className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-400">
                Card number powered by Stripe Elements
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-400">
              Integrate{' '}
              <code className="font-mono">@stripe/react-stripe-js</code>{' '}
              CardElement here for live use.
            </p>
          </div>
        </>
      )}

      {paymentMethod === 'wallet' && (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-4 text-sm text-gray-500 dark:text-gray-400 text-center">
          <Wallet className="h-6 w-6 mx-auto mb-1 opacity-60" aria-hidden="true" />
          Apple Pay / Google Pay will be prompted after you click Pay.
        </div>
      )}

      {paymentMethod === 'bank_transfer' && (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-4 text-sm text-gray-500 dark:text-gray-400 text-center">
          <Building2 className="h-6 w-6 mx-auto mb-1 opacity-60" aria-hidden="true" />
          ACH bank details will be collected via Stripe&apos;s secure bank linking flow.
        </div>
      )}

      {/* Email for receipt */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Email for receipt
        </label>
        <input
          {...register('email')}
          type="email"
          autoComplete="email"
          placeholder="jane@example.com"
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
        )}
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm text-red-700 dark:text-red-400"
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
          {error}
        </div>
      )}

      {/* Submit */}
      <Button type="submit" loading={loading} className="w-full gap-2">
        <Lock className="h-4 w-4" aria-hidden="true" />
        Pay {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)}
      </Button>

      <p className="text-center text-xs text-gray-400">
        Secured by Stripe · PCI DSS Level 1 compliant
      </p>
    </form>
  )
}
