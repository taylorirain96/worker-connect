'use client'
import { useState } from 'react'
import { Sparkles, Star, MapPin, DollarSign } from 'lucide-react'

interface Worker {
  id: string
  name: string
  location: string
  hourlyRate: number
  rating: number
  reviewCount: number
}

interface Match {
  workerId: string
  score: number
  reason: string
  worker: Worker
}

interface Props {
  jobId: string
  jobTitle: string
  jobDescription: string
  jobCategory?: string
  jobLocation?: string
  userRole: string
}

export default function AIWorkerMatches({ jobId, jobTitle, jobDescription, jobCategory, jobLocation, userRole }: Props) {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)

  // Only show for employers
  if (userRole !== 'employer') return null

  const loadMatches = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/ai/match-workers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, jobTitle, jobDescription, jobCategory, jobLocation }),
      })
      const data = await res.json()
      setMatches(data.matches ?? [])
      setLoaded(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/5 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-400" />
          <h3 className="font-semibold text-white">AI Suggested Workers</h3>
        </div>
        {!loaded && (
          <button
            onClick={loadMatches}
            disabled={loading}
            className="text-sm bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {loading ? 'Finding matches...' : 'Find Best Matches'}
          </button>
        )}
      </div>

      {loaded && matches.length === 0 && (
        <p className="text-gray-400 text-sm">No matches found. Make sure workers have completed profiles.</p>
      )}

      {matches.length > 0 && (
        <div className="space-y-3">
          {matches.map((match, i) => (
            <div key={match.workerId} className="flex items-start gap-4 bg-gray-900/60 rounded-xl p-4 border border-gray-800">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold text-sm">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="font-semibold text-white truncate">{match.worker.name}</p>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full flex-shrink-0">
                    {match.score}% match
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-2">{match.reason}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  {match.worker.location && (
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{match.worker.location}</span>
                  )}
                  {match.worker.hourlyRate > 0 && (
                    <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />${match.worker.hourlyRate}/hr</span>
                  )}
                  {match.worker.rating > 0 && (
                    <span className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-400" />{match.worker.rating} ({match.worker.reviewCount})</span>
                  )}
                </div>
              </div>
              <a
                href={`/profile/${match.workerId}`}
                className="flex-shrink-0 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
              >
                View →
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
