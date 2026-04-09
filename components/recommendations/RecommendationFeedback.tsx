'use client'
import { ThumbsUp, ThumbsDown, CheckCircle, X } from 'lucide-react'

interface Props {
  onAction: (action: 'like' | 'dislike' | 'applied' | 'dismissed') => void
  disabled?: boolean
}

export default function RecommendationFeedback({ onAction, disabled }: Props) {
  const btn = 'p-2 rounded-lg transition-colors disabled:opacity-50'
  return (
    <div className="flex gap-2">
      <button onClick={() => onAction('applied')} disabled={disabled} className={`${btn} bg-primary-600 hover:bg-primary-700 text-white`}><CheckCircle className="h-4 w-4" /></button>
      <button onClick={() => onAction('like')} disabled={disabled} className={`${btn} text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20`}><ThumbsUp className="h-4 w-4" /></button>
      <button onClick={() => onAction('dislike')} disabled={disabled} className={`${btn} text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20`}><ThumbsDown className="h-4 w-4" /></button>
      <button onClick={() => onAction('dismissed')} disabled={disabled} className={`${btn} text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700`}><X className="h-4 w-4" /></button>
    </div>
  )
}
