'use client'
import { useState } from 'react'
import { Tag, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface PromoCodeInputProps {
  userId: string
  amount: number
  onApply: (discount: number, code: string) => void
  onRemove: () => void
}

interface ValidateResponse {
  valid: boolean
  error?: string
  discountType?: 'percent' | 'fixed'
  discountAmount?: number
  discountedAmount?: number
  code?: string
}

export default function PromoCodeInput({ userId, amount, onApply, onRemove }: PromoCodeInputProps) {
  const [code, setCode] = useState('')
  const [applied, setApplied] = useState<string | null>(null)
  const [discount, setDiscount] = useState<number>(0)
  const [loading, setLoading] = useState(false)

  const formatNZD = (n: number) =>
    new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD', minimumFractionDigits: 0 }).format(n)

  const handleApply = async () => {
    const normalisedCode = code.trim().toUpperCase()
    if (!normalisedCode) return
    setLoading(true)
    try {
      const res = await fetch('/api/promos/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: normalisedCode, userId, amount }),
      })
      const data: ValidateResponse = await res.json()
      if (!data.valid) {
        toast.error(data.error ?? 'Invalid promo code')
        return
      }
      const discountValue = data.discountAmount ?? 0
      setApplied(data.code ?? normalisedCode)
      setDiscount(discountValue)
      onApply(discountValue, data.code ?? normalisedCode)
      toast.success(`Promo code applied — you save ${formatNZD(discountValue)}!`)
    } catch {
      toast.error('Could not validate promo code')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = () => {
    setApplied(null)
    setDiscount(0)
    setCode('')
    onRemove()
  }

  if (applied) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700">
        <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
        <span className="flex-1 text-sm text-emerald-800 dark:text-emerald-300 font-mono font-medium">
          {applied}
        </span>
        <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
          -{formatNZD(discount)}
        </span>
        <button
          onClick={handleRemove}
          className="text-emerald-500 hover:text-red-500 transition-colors ml-1"
          title="Remove promo code"
        >
          <XCircle className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleApply()}
          placeholder="Promo code"
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
      <button
        onClick={handleApply}
        disabled={loading || !code.trim()}
        className="px-4 py-2 text-sm font-medium bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
      >
        {loading ? '…' : 'Apply'}
      </button>
    </div>
  )
}
