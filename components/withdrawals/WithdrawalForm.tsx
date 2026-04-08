'use client'
import { useState } from 'react'
import type { BankAccount } from '@/types'
import { calculateNetWithdrawal, MIN_WITHDRAWAL } from '@/lib/earnings/calculateEarnings'
import { formatCurrency } from '@/lib/utils'
import Button from '@/components/ui/Button'
import { AlertCircle, CheckCircle, Zap, Clock } from 'lucide-react'

interface WithdrawalFormProps {
  availableBalance: number
  bankAccounts: BankAccount[]
  onSuccess?: (amount: number) => void
}

export default function WithdrawalForm({ availableBalance, bankAccounts, onSuccess }: WithdrawalFormProps) {
  const [amount, setAmount] = useState('')
  const [transferType, setTransferType] = useState<'standard' | 'instant'>('standard')
  const [selectedAccount, setSelectedAccount] = useState(bankAccounts[0]?.id ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const parsed = parseFloat(amount) || 0
  const { fee, instantFee, netAmount } = calculateNetWithdrawal(parsed, transferType)

  const isValid =
    parsed >= MIN_WITHDRAWAL &&
    parsed <= availableBalance &&
    selectedAccount !== ''

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!isValid) return
    setLoading(true)
    try {
      const res = await fetch('/api/earnings/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parsed,
          transferType,
          bankAccountId: selectedAccount,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as { error?: string }).error ?? 'Withdrawal failed')
      }
      setSuccess(true)
      onSuccess?.(parsed)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <CheckCircle className="h-12 w-12 text-emerald-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Withdrawal Submitted!</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {formatCurrency(parsed)} is on its way to your bank account.
        </p>
        <Button variant="outline" size="sm" onClick={() => { setSuccess(false); setAmount('') }}>
          Make Another Withdrawal
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Amount input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Amount (min {formatCurrency(MIN_WITHDRAWAL)})
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
          <input
            type="number"
            min={MIN_WITHDRAWAL}
            max={availableBalance}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full pl-8 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-400">
          <span>Available: {formatCurrency(availableBalance)}</span>
          <button
            type="button"
            onClick={() => setAmount(availableBalance.toFixed(2))}
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400"
          >
            Max
          </button>
        </div>
      </div>

      {/* Bank account */}
      {bankAccounts.length > 0 ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Bank Account
          </label>
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {bankAccounts.map((acct) => (
              <option key={acct.id} value={acct.id}>
                {acct.bankName} ···· {acct.last4} ({acct.accountType})
                {acct.isDefault ? ' ★ Default' : ''}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-center gap-3 text-sm text-yellow-800 dark:text-yellow-300">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          No bank account connected. Please add one first.
        </div>
      )}

      {/* Transfer type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Transfer Speed
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setTransferType('standard')}
            className={`p-3 rounded-lg border text-left transition-colors ${
              transferType === 'standard'
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Standard</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">1–3 business days</p>
            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-1">Free</p>
          </button>
          <button
            type="button"
            onClick={() => setTransferType('instant')}
            className={`p-3 rounded-lg border text-left transition-colors ${
              transferType === 'instant'
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Instant</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">1–2 hours</p>
            <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mt-1">$0.25 fee</p>
          </button>
        </div>
      </div>

      {/* Fee breakdown */}
      {parsed > 0 && (
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 space-y-1.5 text-sm">
          <div className="flex justify-between text-gray-600 dark:text-gray-300">
            <span>Withdrawal Amount</span>
            <span>{formatCurrency(parsed)}</span>
          </div>
          <div className="flex justify-between text-gray-500 dark:text-gray-400">
            <span>Processing Fee (2%)</span>
            <span>− {formatCurrency(fee)}</span>
          </div>
          {instantFee > 0 && (
            <div className="flex justify-between text-gray-500 dark:text-gray-400">
              <span>Instant Transfer Fee</span>
              <span>− {formatCurrency(instantFee)}</span>
            </div>
          )}
          <div className="border-t border-gray-200 dark:border-gray-600 pt-1.5 flex justify-between font-semibold text-gray-900 dark:text-white">
            <span>You Receive</span>
            <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(netAmount)}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={!isValid || bankAccounts.length === 0}
        loading={loading}
        className="w-full"
      >
        Withdraw {parsed > 0 ? formatCurrency(parsed) : ''}
      </Button>
    </form>
  )
}
