'use client'
import { ChevronLeft, ChevronRight, Star, MapPin, Clock, Briefcase } from 'lucide-react'
import type { SearchResult } from '@/types/search'
import type { UserProfile, Job } from '@/types'

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="animate-pulse p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="flex-1 space-y-1.5">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/5" />
      </div>
    </div>
  )
}

// ── Worker card ───────────────────────────────────────────────────────────────

function WorkerCard({ result }: { result: SearchResult<UserProfile> }) {
  const w = result.item
  const initials = (w.displayName ?? 'W').slice(0, 2).toUpperCase()

  const availabilityColor = {
    available: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    busy: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    unavailable: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }[w.availability ?? 'unavailable']

  return (
    <article className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg
      bg-white dark:bg-gray-800 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center
          text-white text-sm font-bold flex-shrink-0" aria-hidden>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
              {w.displayName ?? 'Worker'}
            </h3>
            {w.availability && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${availabilityColor}`}>
                {w.availability}
              </span>
            )}
          </div>

          {/* Rating */}
          {w.rating !== undefined && (
            <div className="flex items-center gap-1 mt-0.5" aria-label={`Rating: ${w.rating.toFixed(1)} stars`}>
              <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" aria-hidden />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {w.rating.toFixed(1)} ({w.reviewCount ?? 0})
              </span>
            </div>
          )}

          {/* Hourly rate */}
          {w.hourlyRate !== undefined && (
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mt-0.5">
              ${w.hourlyRate}/hr
            </p>
          )}

          {/* Location */}
          {w.location && (
            <p className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              <MapPin className="h-3 w-3" aria-hidden />
              {w.location}
            </p>
          )}

          {/* Skills */}
          {(w.skills?.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-1 mt-2" aria-label="Skills">
              {(w.skills ?? []).slice(0, 5).map((s) => (
                <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700
                  text-gray-600 dark:text-gray-300 capitalize">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

// ── Job card ──────────────────────────────────────────────────────────────────

function JobCard({ result }: { result: SearchResult<Job> }) {
  const j = result.item

  const statusColor = {
    open: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    completed: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }[j.status]

  return (
    <article className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg
      bg-white dark:bg-gray-800 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{j.title}</h3>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusColor}`}>
          {j.status.replace('_', ' ')}
        </span>
      </div>

      <div className="flex items-center gap-3 mt-1 flex-wrap">
        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30
          text-purple-700 dark:text-purple-300 capitalize">
          {j.category}
        </span>
        <span className="text-sm font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1">
          <Briefcase className="h-3.5 w-3.5" aria-hidden />
          ${j.budget} {j.budgetType === 'hourly' ? '/hr' : 'fixed'}
        </span>
        {j.location && (
          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <MapPin className="h-3 w-3" aria-hidden />
            {j.location}
          </span>
        )}
      </div>

      {j.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">{j.description}</p>
      )}

      {(j.skills?.length ?? 0) > 0 && (
        <div className="flex flex-wrap gap-1 mt-2" aria-label="Required skills">
          {(j.skills ?? []).slice(0, 5).map((s) => (
            <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700
              text-gray-600 dark:text-gray-300 capitalize">
              {s}
            </span>
          ))}
        </div>
      )}
    </article>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface SearchResultsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  results: SearchResult<any>[]
  type: 'workers' | 'jobs' | 'all'
  loading: boolean
  total: number
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onSortChange: (sort: string) => void
}

export default function SearchResults({
  results,
  type,
  loading,
  total,
  page,
  pageSize,
  onPageChange,
  onSortChange,
}: SearchResultsProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  if (loading) {
    return (
      <div className="space-y-3" aria-busy="true" aria-label="Loading results">
        {[0, 1, 2].map((i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <p className="text-sm text-gray-600 dark:text-gray-400" aria-live="polite">
          {total === 0 ? 'No results found' : `${total} result${total !== 1 ? 's' : ''} found`}
        </p>
        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          Sort by
          <select
            onChange={(e) => onSortChange(e.target.value)}
            aria-label="Sort results by"
            className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600
              bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="relevance">Relevance</option>
            <option value="rating_desc">Highest Rating</option>
            <option value="rate_asc">Rate: Low → High</option>
            <option value="rate_desc">Rate: High → Low</option>
          </select>
        </label>
      </div>

      {/* Empty state */}
      {results.length === 0 && (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400" role="status">
          <Clock className="h-12 w-12 mx-auto mb-3 opacity-30" aria-hidden />
          <p className="font-medium">No results found</p>
          <p className="text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Result cards */}
      <ul className="space-y-3" aria-label="Search results">
        {results.map((result, i) => (
          <li key={'id' in result.item ? (result.item as { id: string }).id : i}>
            {'hourlyRate' in result.item || 'bio' in result.item
              ? <WorkerCard result={result as SearchResult<UserProfile>} />
              : <JobCard result={result as SearchResult<Job>} />
            }
          </li>
        ))}
      </ul>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-2 mt-6" aria-label="Pagination">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label="Previous page"
            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-40
              hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            aria-label="Next page"
            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-40
              hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </nav>
      )}
    </div>
  )
}
