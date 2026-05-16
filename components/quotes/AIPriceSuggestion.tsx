'use client'
import { useState, useEffect } from 'react'
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface AIPriceSuggestionProps {
  jobTitle: string
  jobDescription?: string
  category?: string
  location?: string
  workerId: string
  onUsePrice: (price: number) => void
}

interface Suggestion {
  suggestedMin: number
  suggestedMax: number
  averageAccepted: number
  confidence: 'low' | 'medium' | 'high'
  tip: string
}

export default function AIPriceSuggestion({
  jobTitle,
  jobDescription,
  category,
  location,
  workerId,
  onUsePrice,
}: AIPriceSuggestionProps) {
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null)
  const [loading, setLoading] = useState(true)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    if (!jobTitle) return
    setLoading(true)
    fetch('/api/quotes/ai-price-suggestion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobTitle, jobDescription, category, location, workerId }),
    })
      .then((r) => r.json())
      .then((data) => setSuggestion(data))
      .catch(() => null)
      .finally(() => setLoading(false))
  }, [jobTitle, category, workerId, jobDescription, location])

  if (loading) {
    return (
      <div className="rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 p-3 animate-pulse">
        <div className="h-4 w-48 bg-amber-200 dark:bg-amber-800 rounded" />
      </div>
    )
  }

  if (!suggestion) return null

  const confidenceBadge = {
    low: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
    medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    high: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  }[suggestion.confidence]

  return (
    <div className="rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 overflow-hidden">
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-500 flex-shrink-0" />
          <span className="text-sm font-semibold text-amber-800 dark:text-amber-300">
            AI Price Suggestion
          </span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${confidenceBadge}`}>
            {suggestion.confidence} confidence
          </span>
        </div>
        {collapsed ? (
          <ChevronDown className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
        ) : (
          <ChevronUp className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
        )}
      </button>

      {!collapsed && (
        <div className="px-4 pb-4 space-y-3">
          {/* Range */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-lg font-bold text-amber-900 dark:text-amber-200">
              {formatCurrency(suggestion.suggestedMin)} – {formatCurrency(suggestion.suggestedMax)}
            </span>
            <span className="text-sm text-amber-700 dark:text-amber-400">
              avg {formatCurrency(suggestion.averageAccepted)} on QuickTrade
            </span>
          </div>

          {/* Use button */}
          <button
            type="button"
            onClick={() => onUsePrice(suggestion.averageAccepted)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Use {formatCurrency(suggestion.averageAccepted)}
          </button>

          {/* Tip */}
          <p className="text-xs text-amber-700 dark:text-amber-400">{suggestion.tip}</p>
        </div>
      )}
    </div>
  )
}
