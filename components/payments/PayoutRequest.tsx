'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '@/components/ui/Button'
import { STRIPE_CONNECT_CONFIG } from '@/lib/stripe/stripeConnect'
import { TrendingUp, AlertCircle, Building2 } from 'lucide-react'
import toast from 'react-hot-toast'

const schema = z.object({
  amount: z
    .number({ invalid_type_error: 'Amount must be a number' })
    .min(STRIPE_CONNECT_CONFIG.minPayoutAmount, `Minimum payout is $${STRIPE_CONNECT_CONFIG.minPayoutAmount}`)
    .max(10000, 'Maximum single payout is $10,000'),
  stripeConnectAccountId: z.string().min(1, 'Stripe Connect account is required'),
  currency: z.string(),
})

type FormData = z.infer<typeof schema>

interface PayoutRequestProps {
  workerId: string
  availableBalance: number
  stripeConnectAccountId?: string
  onSuccess?: (payoutId: string) => void
}

export default function PayoutRequest({
  workerId,
  availableBalance,
  stripeConnectAccountId,
  onSuccess,
}: PayoutRequestProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: Math.min(availableBalance, 500),
      stripeConnectAccountId: stripeConnectAccountId ?? '',
      currency: 'usd',
    },
  })

  const handleMaxAmount = () => {
    setValue('amount', Math.floor(availableBalance))
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, workerId }),
      })

      if (!res.ok) {
        const err = (await res.json()) as { error?: string }
        throw new Error(err.error ?? 'Payout request failed')
      }

      const result = (await res.json()) as { payoutId: string }
      toast.success('Payout requested! Funds arrive in 2-3 business days.')
      onSuccess?.(result.payoutId)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Payout request failed'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const hasStripeAccount = Boolean(stripeConnectAccountId)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {/* Balance summary */}
      <div className="rounded-xl bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 px-5 py-4">
        <p className="text-xs text-primary-600 dark:text-primary-400 font-medium mb-1">Available balance</p>
        <p className="text-3xl font-bold text-primary-700 dark:text-primary-300">
          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'usd' }).format(availableBalance)}
        </p>
      </div>

      {/* No Stripe Connect account warning */}
      {!hasStripeAccount && (
        <div className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>
            You need to connect a bank account via Stripe Connect before requesting payouts.
          </span>
        </div>
      )}

      {/* Stripe Connect Account ID (hidden field when pre-filled) */}
      {!stripeConnectAccountId && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            <Building2 className="inline h-4 w-4 mr-1" />
            Stripe Connect Account ID
          </label>
          <input
            {...register('stripeConnectAccountId')}
            type="text"
            placeholder="acct_1234…"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {errors.stripeConnectAccountId && (
            <p className="mt-1 text-xs text-red-600">{errors.stripeConnectAccountId.message}</p>
          )}
        </div>
      )}

      {/* Amount */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Payout amount
          </label>
          <button
            type="button"
            onClick={handleMaxAmount}
            className="text-xs text-primary-600 hover:underline"
          >
            Use max
          </button>
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
          <input
            {...register('amount', { valueAsNumber: true })}
            type="number"
            min={STRIPE_CONNECT_CONFIG.minPayoutAmount}
            max={availableBalance}
            step="0.01"
            className="w-full pl-7 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        {errors.amount && (
          <p className="mt-1 text-xs text-red-600">{errors.amount.message}</p>
        )}
        <p className="mt-1 text-xs text-gray-400">
          Minimum: ${STRIPE_CONNECT_CONFIG.minPayoutAmount} · Arrives in 2–3 business days
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <Button
        type="submit"
        loading={loading}
        disabled={!hasStripeAccount && !register('stripeConnectAccountId')}
        className="w-full gap-2"
      >
        <TrendingUp className="h-4 w-4" />
        Request Payout
      </Button>
    </form>
  )
}
