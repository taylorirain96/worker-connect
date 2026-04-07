'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '@/components/ui/Button'
import { CreditCard, Lock, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const schema = z.object({
  cardholderName: z.string().min(2, 'Cardholder name is required'),
  email: z.string().email('Valid email required'),
})

type FormData = z.infer<typeof schema>

interface PaymentFormProps {
  amount: number
  currency?: string
  jobId: string
  description?: string
  onSuccess?: (paymentIntentId: string) => void
  onError?: (error: string) => void
}

export default function PaymentForm({
  amount,
  currency = 'usd',
  jobId,
  description,
  onSuccess,
  onError,
}: PaymentFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setError(null)

    try {
      // Step 1: Create payment intent
      const intentRes = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          currency,
          jobId,
          description,
          cardholderName: data.cardholderName,
          email: data.email,
        }),
      })

      if (!intentRes.ok) {
        const err = (await intentRes.json()) as { error?: string }
        throw new Error(err.error ?? 'Failed to create payment intent')
      }

      const { paymentIntentId } = (await intentRes.json()) as { paymentIntentId: string }

      // Step 2: Confirm payment (in production this would use Stripe Elements)
      const confirmRes = await fetch(`/api/payments/${paymentIntentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'confirm' }),
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

      {/* Email */}
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

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {/* Submit */}
      <Button type="submit" loading={loading} className="w-full gap-2">
        <Lock className="h-4 w-4" />
        Pay {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)}
      </Button>

      <p className="text-center text-xs text-gray-400">
        Secured by Stripe · PCI DSS Level 1 compliant
      </p>
    </form>
  )
}
