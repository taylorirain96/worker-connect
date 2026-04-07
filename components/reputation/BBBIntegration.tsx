'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { VerificationItem } from '@/types/reputation'

interface Props {
  bbbRating: VerificationItem
  onSubmitLink?: (link: string) => Promise<void>
  className?: string
}

export default function BBBIntegration({ bbbRating, onSubmitLink, className }: Props) {
  const [link, setLink] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!link) return
    setLoading(true)
    try {
      await onSubmitLink?.(link)
      setLink('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">⭐</span>
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">BBB / Google Rating</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">Link your external business reputation</p>
        </div>
      </div>

      {bbbRating.status === 'verified' ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <span>✓</span>
            <span className="text-sm font-medium">Rating verified</span>
          </div>
          {bbbRating.score && (
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl px-4 py-3 flex items-center gap-3">
              <span className="text-2xl">⭐</span>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{bbbRating.score}/5</p>
                {bbbRating.link && (
                  <a href={bbbRating.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">
                    View profile ↗
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Share your BBB Business Profile or Google Business URL to display your external rating on your profile.
          </p>
          <input
            type="url"
            placeholder="https://www.bbb.org/us/your-business or Google Maps link"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
          />
          <button
            onClick={handleSubmit}
            disabled={loading || !link}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl py-2.5 text-sm font-medium transition-colors"
          >
            {loading ? 'Submitting…' : 'Submit for Verification'}
          </button>
        </>
      )}

      {bbbRating.status === 'pending' && (
        <p className="text-xs text-yellow-600 dark:text-yellow-400">
          ⏳ Your BBB/Google link is under review. This usually takes 1–2 business days.
        </p>
      )}
    </div>
  )
}
