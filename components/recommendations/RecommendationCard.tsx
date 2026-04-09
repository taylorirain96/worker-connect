'use client'
import { MapPin, Briefcase, ThumbsUp, ThumbsDown, CheckCircle, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import type { JobRecommendation } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface Props {
  data: JobRecommendation
  onFeedback?: (action: 'like' | 'dislike' | 'applied' | 'dismissed') => void
}

export default function RecommendationCard({ data, onFeedback }: Props) {
  const scoreColor = data.score >= 85 ? 'text-emerald-500' : data.score >= 70 ? 'text-amber-500' : 'text-gray-500'
  const scoreBg = data.score >= 85 ? 'bg-emerald-50 dark:bg-emerald-900/20' : data.score >= 70 ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-gray-50 dark:bg-gray-700'

  return (
    <Card>
      <CardContent>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">{data.title}</h3>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${scoreBg} ${scoreColor}`}>{data.score}% match</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{data.employer}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(data.budget)}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{data.location}</span>
          <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{data.category}</span>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {data.skills.map((s) => (
            <span key={s} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-300">{s}</span>
          ))}
        </div>
        {onFeedback && (
          <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
            <button onClick={() => onFeedback('applied')} className="flex items-center gap-1 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs rounded-lg transition-colors">
              <CheckCircle className="h-3.5 w-3.5" /> Apply
            </button>
            <button onClick={() => onFeedback('like')} className="p-1.5 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors">
              <ThumbsUp className="h-4 w-4" />
            </button>
            <button onClick={() => onFeedback('dislike')} className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors">
              <ThumbsDown className="h-4 w-4" />
            </button>
            <button onClick={() => onFeedback('dismissed')} className="ml-auto p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
