'use client'

import { useState } from 'react'
import { ExternalLink, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import Button from '@/components/ui/Button'

interface StripeConnectButtonProps {
  workerId: string
  email: string
  country?: string
  onSuccess?: (accountId: string, link: string) => void
  className?: string
}

export default function StripeConnectButton({
  workerId,
  email,
  country = 'US',
  onSuccess,
  className,
}: StripeConnectButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function handleClick() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/workers/stripe-connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'initialize', workerId, email, country }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to initialize Stripe Connect')
      setDone(true)
      onSuccess?.(data.accountId, data.link)
      window.location.href = data.link
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className={cn('flex items-center gap-2 text-green-600 dark:text-green-400', className)}>
        <CheckCircle className="h-5 w-5" aria-hidden="true" />
        <span className="text-sm font-medium">Redirecting to Stripe…</span>
      </div>
    )
  }

  return (
    <div className={className}>
      <Button
        variant="primary"
        size="lg"
        loading={loading}
        onClick={handleClick}
        aria-label="Connect your Stripe account"
        className="w-full sm:w-auto"
      >
        {!loading && <ExternalLink className="h-4 w-4" aria-hidden="true" />}
        Connect Payment Account
      </Button>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}
