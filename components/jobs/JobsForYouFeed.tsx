'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Sparkles, MapPin, Clock, DollarSign, Users, Wrench } from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'
import { formatCurrency, formatRelativeDate, JOB_CATEGORIES, STATUS_LABELS, URGENCY_LABELS, CATEGORY_ICONS } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import type { Job } from '@/types'

interface ScoredJob {
  job: Job
  score: number
  reason: string
}

interface JobsForYouFeedProps {
  /** Maximum number of jobs to display (default: unlimited) */
  limit?: number
  /** Pre-fetched jobs to avoid a redundant API call */
  prefetchedJobs?: ScoredJob[]
}

function MatchBadge({ score }: { score: number }) {
  const color =
    score >= 80
      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
      : score >= 60
      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600'

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${color}`}>
      <Sparkles className="h-3 w-3" />
      {score}% match
    </span>
  )
}

function JobSkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-slate-700/50 p-5 animate-pulse">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gray-200 dark:bg-gray-700" />
          <div className="space-y-1.5">
            <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-3 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
        <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
      </div>
      <div className="space-y-1.5 mb-4">
        <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-3 w-4/5 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
        ))}
      </div>
    </div>
  )
}

export default function JobsForYouFeed({ limit, prefetchedJobs }: JobsForYouFeedProps) {
  const { user, profile } = useAuth()
  const [scoredJobs, setScoredJobs] = useState<ScoredJob[]>(prefetchedJobs ?? [])
  const [loading, setLoading] = useState(!prefetchedJobs)
  const [error, setError] = useState<string | null>(null)

  const hasProfile = (profile?.skills?.length ?? 0) > 0 || !!profile?.location

  useEffect(() => {
    if (prefetchedJobs) return
    if (!user?.uid) {
      setLoading(false)
      return
    }
    if (!hasProfile) {
      setLoading(false)
      return
    }

    const controller = new AbortController()

    async function fetchMatches() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/ai/job-match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workerId: user!.uid,
            skills: profile?.skills ?? [],
            location: profile?.location ?? '',
          }),
          signal: controller.signal,
        })

        if (!res.ok) {
          const data = await res.json() as { error?: string }
          throw new Error(data.error ?? 'Failed to fetch matches')
        }

        const data = await res.json() as { jobs: ScoredJob[] }
        setScoredJobs(data.jobs ?? [])
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setError('Could not load personalised jobs. Try again later.')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchMatches()
    return () => controller.abort()
  }, [user, profile, hasProfile, prefetchedJobs])

  if (loading) {
    return (
      <div className="grid gap-4">
        {[...Array(limit ?? 3)].map((_, i) => <JobSkeletonCard key={i} />)}
      </div>
    )
  }

  if (!user) return null

  if (!hasProfile) {
    return (
      <div className="text-center py-12 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800/50">
        <Sparkles className="h-10 w-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">Complete your profile to get personalised job matches</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Add your skills and location so we can find the best jobs for you.</p>
        <Link href="/settings/profile" className="inline-flex items-center px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors">
          Complete Profile →
        </Link>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
        {error}
      </div>
    )
  }

  const displayJobs = limit ? scoredJobs.slice(0, limit) : scoredJobs

  if (displayJobs.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800/50">
        <Sparkles className="h-10 w-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">No matches found yet</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">New jobs are added regularly — check back soon.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {displayJobs.map(({ job, score, reason }) => {
        const category = JOB_CATEGORIES.find((c) => c.id === job.category)
        const status = STATUS_LABELS[job.status]
        const isUrgent = job.urgency === 'high' || job.urgency === 'emergency'
        const urgencyLabel = URGENCY_LABELS[job.urgency]
        const CategoryIcon = (category ? CATEGORY_ICONS[category.id] : null) ?? Wrench

        return (
          <Link key={job.id} href={`/jobs/${job.id}`}>
            <div
              className={`bg-white dark:bg-gray-800 rounded-xl border p-5 hover:shadow-md transition-all cursor-pointer group ${
                isUrgent
                  ? 'border-indigo-500/40 dark:border-indigo-500/40'
                  : 'border-slate-700/50 dark:border-slate-700/50'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-500/20">
                    <CategoryIcon className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors truncate">
                      {job.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{job.employerName}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <Badge variant={job.status === 'open' ? 'success' : job.status === 'in_progress' ? 'info' : 'default'}>
                    {status?.label}
                  </Badge>
                  {isUrgent && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border border-indigo-500/40 text-indigo-300 bg-indigo-500/10">
                      {urgencyLabel?.label}
                    </span>
                  )}
                  <MatchBadge score={score} />
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                {job.description}
              </p>

              {reason && (
                <p className="text-xs text-indigo-400 dark:text-indigo-400 mb-3 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 flex-shrink-0" />
                  {reason}
                </p>
              )}

              <div className="flex flex-wrap gap-1 mb-4">
                {job.skills.slice(0, 3).map((skill) => (
                  <span key={skill} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                    {skill}
                  </span>
                ))}
                {job.skills.length > 3 && (
                  <span className="text-xs text-gray-400">+{job.skills.length - 3} more</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-indigo-400" />
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {formatCurrency(job.budget)}{job.budgetType === 'hourly' ? '/hr' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-indigo-400" />
                  <span className="truncate">{job.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-indigo-400" />
                  <span>{job.applicantsCount} applicant{job.applicantsCount !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-indigo-400" />
                  <span>{formatRelativeDate(job.createdAt)}</span>
                </div>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
