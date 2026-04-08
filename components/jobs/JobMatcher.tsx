'use client'

import { useState, useCallback } from 'react'
import {
  MapPin,
  DollarSign,
  Clock,
  Briefcase,
  Target,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import type { MatchedJob } from '@/types'
import MatchScore from './MatchScore'
import { formatCurrency, formatRelativeDate, JOB_CATEGORIES, URGENCY_LABELS } from '@/lib/utils'
import Badge from '@/components/ui/Badge'

interface JobMatcherProps {
  workerId: string
  initialJobs?: MatchedJob[]
}

interface ApplyState {
  jobId: string
  status: 'idle' | 'loading' | 'success' | 'error'
  message?: string
}

export default function JobMatcher({ workerId, initialJobs = [] }: JobMatcherProps) {
  const [jobs, setJobs] = useState<MatchedJob[]>(initialJobs)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null)
  const [applyState, setApplyState] = useState<ApplyState>({ jobId: '', status: 'idle' })
  const [coverLetter, setCoverLetter] = useState('')
  const [applyingTo, setApplyingTo] = useState<string | null>(null)

  // Sorting & filtering
  const [sortBy, setSortBy] = useState<'score' | 'date' | 'budget'>('score')
  const [filterUrgency, setFilterUrgency] = useState<string>('all')
  const [filterRemote, setFilterRemote] = useState<boolean>(false)

  const fetchJobs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/jobs/match?workerId=${encodeURIComponent(workerId)}&limit=20`)
      if (!res.ok) throw new Error('Failed to fetch matched jobs')
      const data = await res.json()
      setJobs(data.jobs ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }, [workerId])

  const handleApply = async (jobId: string) => {
    setApplyState({ jobId, status: 'loading' })
    try {
      const res = await fetch('/api/jobs/match/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workerId, jobId, coverLetter }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to apply')
      setApplyState({ jobId, status: 'success', message: 'Application submitted!' })
      setCoverLetter('')
      setApplyingTo(null)
    } catch (err) {
      setApplyState({
        jobId,
        status: 'error',
        message: err instanceof Error ? err.message : 'Application failed',
      })
    }
  }

  // Apply sorting
  const sortedJobs = [...jobs].sort((a, b) => {
    if (sortBy === 'score') return b.matchScore - a.matchScore
    if (sortBy === 'date') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    if (sortBy === 'budget') return b.budget - a.budget
    return 0
  })

  // Apply filters
  const filteredJobs = sortedJobs.filter((j) => {
    if (filterUrgency !== 'all' && j.urgency !== filterUrgency) return false
    if (filterRemote && !j.isRemote) return false
    return true
  })

  const category = (job: MatchedJob) =>
    JOB_CATEGORIES.find((c) => c.id === job.category)

  const isMoverOpportunity = (job: MatchedJob) =>
    job.matchReasons?.some((r) => r.toLowerCase().includes('mover mode'))

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={fetchJobs}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Briefcase className="h-4 w-4" />}
          {loading ? 'Finding matches…' : 'Refresh Matches'}
        </button>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'score' | 'date' | 'budget')}
          className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
        >
          <option value="score">Sort: Best Match</option>
          <option value="date">Sort: Newest</option>
          <option value="budget">Sort: Highest Budget</option>
        </select>

        {/* Urgency filter */}
        <select
          value={filterUrgency}
          onChange={(e) => setFilterUrgency(e.target.value)}
          className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
        >
          <option value="all">All Urgency</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="emergency">Emergency</option>
        </select>

        {/* Remote toggle */}
        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={filterRemote}
            onChange={(e) => setFilterRemote(e.target.checked)}
            className="rounded"
          />
          Remote only
        </label>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredJobs.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No matching jobs found</p>
          <p className="text-sm mt-1">Try adjusting your filters or click &quot;Refresh Matches&quot;</p>
        </div>
      )}

      {/* Job Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredJobs.map((job) => {
          const cat = category(job)
          const urgency = URGENCY_LABELS[job.urgency]
          const isExpanded = expandedJobId === job.id
          const isApplying = applyingTo === job.id
          const thisApplyState = applyState.jobId === job.id ? applyState : null

          return (
            <div
              key={job.id}
              className={`bg-white dark:bg-gray-800 rounded-xl border transition-all ${
                isMoverOpportunity(job)
                  ? 'border-purple-300 dark:border-purple-700 shadow-sm shadow-purple-100 dark:shadow-purple-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
              }`}
            >
              <div className="p-5">
                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl flex-shrink-0">{cat?.icon ?? '🛠️'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {job.title}
                      </h3>
                      {isMoverOpportunity(job) && (
                        <Target className="h-4 w-4 text-purple-500 flex-shrink-0" aria-label="Mover Mode Opportunity" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{job.employerName}</p>
                  </div>
                </div>

                {/* Match Score */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <MatchScore score={job.matchScore} size="sm" />
                  <div className="flex flex-wrap gap-1 justify-end">
                    <Badge
                      variant={
                        job.urgency === 'emergency'
                          ? 'danger'
                          : job.urgency === 'high'
                          ? 'warning'
                          : 'default'
                      }
                    >
                      {urgency?.label}
                    </Badge>
                    {job.isRemote && <Badge variant="info">Remote</Badge>}
                  </div>
                </div>

                {/* Details row */}
                <div className="flex flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-400 mb-3">
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-3.5 w-3.5" />
                    {formatCurrency(job.budget)}{job.budgetType === 'hourly' ? '/hr' : ''}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {job.distanceKm !== undefined
                      ? `${job.distanceKm.toFixed(1)} km`
                      : job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {formatRelativeDate(job.createdAt)}
                  </span>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                  {job.description}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {thisApplyState?.status === 'success' ? (
                    <span className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400">
                      <CheckCircle className="h-4 w-4" /> Applied!
                    </span>
                  ) : (
                    <button
                      onClick={() => setApplyingTo(isApplying ? null : job.id)}
                      className="flex-1 px-3 py-1.5 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      {isApplying ? 'Cancel' : 'Quick Apply'}
                    </button>
                  )}
                  <button
                    onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    aria-label={isExpanded ? 'Collapse' : 'Expand'}
                  >
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>

                {/* Quick Apply form */}
                {isApplying && thisApplyState?.status !== 'success' && (
                  <div className="mt-3 space-y-2">
                    <textarea
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      placeholder="Optional cover letter…"
                      rows={3}
                      className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApply(job.id)}
                        disabled={thisApplyState?.status === 'loading'}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                      >
                        {thisApplyState?.status === 'loading' ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <CheckCircle className="h-3.5 w-3.5" />
                        )}
                        Submit Application
                      </button>
                      {thisApplyState?.status === 'error' && (
                        <span className="text-xs text-red-600 dark:text-red-400">
                          {thisApplyState.message}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Expanded match reasons */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                      Match Breakdown
                    </p>
                    <MatchScore
                      score={job.matchScore}
                      reasons={job.matchReasons}
                      showReasons
                      size="sm"
                    />

                    {job.skills?.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5">
                          Required Skills
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {job.skills.map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
