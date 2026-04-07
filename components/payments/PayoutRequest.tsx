'use client'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { DollarSign, AlertCircle, Clock, CheckCircle, Info } from 'lucide-react'
import toast from 'react-hot-toast'
import type { PayoutItem } from '@/types/payment'

interface PayoutRequestProps {
  workerId: string
  stripeConnectAccountId: string
  availableBalance?: number
}

export default function PayoutRequest({
  workerId,
  stripeConnectAccountId,
  availableBalance = 0,
}: PayoutRequestProps) {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [lastPayout, setLastPayout] = useState<PayoutItem | null>(null)
  const MIN_PAYOUT = 25

  const numAmount = parseFloat(amount) || 0
  const isValid = numAmount >= MIN_PAYOUT && numAmount <= availableBalance
  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return
    setLoading(true)
    try {
      const res = await fetch('/api/payouts/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workerId, amount: numAmount, currency: 'usd', stripeConnectAccountId }),
      })
      const data = await res.json() as { payout?: PayoutItem; error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Payout request failed')
      setLastPayout(data.payout ?? null)
      setAmount('')
      toast.success('Payout requested successfully!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Payout request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Payout</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Balance */}
        <div className="rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 p-5 text-white">
          <p className="text-sm font-medium opacity-80">Available Balance</p>
          <p className="text-4xl font-bold mt-1">{fmt(availableBalance)}</p>
          <p className="text-xs opacity-70 mt-1">Minimum payout: {fmt(MIN_PAYOUT)}</p>
        </div>

        {/* Last payout status */}
        {lastPayout && (
          <div className="flex items-start gap-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-4 py-3">
            <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                Payout of {fmt(lastPayout.amount)} requested
              </p>
              {lastPayout.estimatedArrival && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                  <Clock className="h-3 w-3" />
                  Est. arrival: {new Date(lastPayout.estimatedArrival).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={(e) => void handleRequest(e)} className="space-y-4">
          <Input
            label="Payout Amount"
            type="number"
            min={MIN_PAYOUT}
            max={availableBalance}
            step="0.01"
            placeholder={`Min ${fmt(MIN_PAYOUT)}`}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            leftIcon={<DollarSign className="h-4 w-4" />}
            error={
              numAmount > 0 && numAmount < MIN_PAYOUT
                ? `Minimum payout is ${fmt(MIN_PAYOUT)}`
                : numAmount > availableBalance && availableBalance > 0
                ? 'Amount exceeds available balance'
                : undefined
            }
          />

          {/* Quick amounts */}
          <div className="flex gap-2 flex-wrap">
            {[25, 50, 100, 200].filter((v) => v <= availableBalance).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setAmount(String(v))}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-primary-300 dark:hover:border-primary-700 hover:text-primary-700 dark:hover:text-primary-400 transition-colors"
              >
                {fmt(v)}
              </button>
            ))}
            {availableBalance > 0 && (
              <button
                type="button"
                onClick={() => setAmount(String(availableBalance))}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-primary-300 dark:hover:border-primary-700 hover:text-primary-700 dark:hover:text-primary-400 transition-colors"
              >
                Max ({fmt(availableBalance)})
              </button>
            )}
          </div>

          {availableBalance < MIN_PAYOUT && (
            <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              Your balance is below the minimum payout threshold of {fmt(MIN_PAYOUT)}.
            </div>
          )}

          <div className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
            Payouts are sent to your connected bank account and typically arrive within 2–3 business days.
          </div>

          <Button type="submit" loading={loading} disabled={!isValid} className="w-full">
            Request Payout
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
