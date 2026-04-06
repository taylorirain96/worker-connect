import type { UserProfile, Job } from '@/types'
import type {
  SearchQuery,
  SearchResult,
  SearchResponse,
  SearchSuggestion,
  SearchFacets,
  SearchFilters,
} from '@/types/search'

// ── Scoring helpers ───────────────────────────────────────────────────────────

function tokenize(text: string): string[] {
  return text.toLowerCase().split(/\s+/).filter(Boolean)
}

function scoreText(query: string, text: string, boost = 1): number {
  if (!query.trim() || !text) return 0
  const q = query.toLowerCase()
  const t = text.toLowerCase()
  if (t === q) return 3 * boost
  if (t.startsWith(q)) return 2 * boost
  if (t.includes(q)) return 1.5 * boost
  const tokens = tokenize(q)
  const matches = tokens.filter((tok) => t.includes(tok))
  return (matches.length / tokens.length) * boost
}

function highlight(query: string, text: string): string {
  if (!query.trim() || !text) return text
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return text.replace(new RegExp(`(${escaped})`, 'gi'), '**$1**')
}

// ── Worker search ─────────────────────────────────────────────────────────────

export function searchWorkers(
  searchQuery: SearchQuery,
  allWorkers: UserProfile[] = []
): SearchResponse<UserProfile> {
  const { query: q = '', filters = {}, page = 1, pageSize = 20, sortBy = 'relevance' } = searchQuery

  let scored: SearchResult<UserProfile>[] = allWorkers.map((worker) => {
    let score = 0
    const highlights: Record<string, string> = {}

    if (q.trim()) {
      const nameScore = scoreText(q, worker.displayName ?? '', 2)
      const bioScore = scoreText(q, worker.bio ?? '', 1)
      const skillsText = (worker.skills ?? []).join(' ')
      const skillScore = scoreText(q, skillsText, 1.5)
      score = nameScore + bioScore + skillScore

      if (nameScore > 0) highlights.name = highlight(q, worker.displayName ?? '')
      if (bioScore > 0) highlights.bio = highlight(q, worker.bio ?? '')
      if (skillScore > 0) highlights.skills = highlight(q, skillsText)
    } else {
      score = 1
    }

    return { item: worker, score, highlights }
  })

  // Apply filters
  scored = scored.filter(({ item: w }) => {
    if (filters.skills?.length) {
      const wSkills = (w.skills ?? []).map((s) => s.toLowerCase())
      const match = filters.skills.some((s) => wSkills.includes(s.toLowerCase()))
      if (!match) return false
    }
    if (filters.minRating !== undefined && (w.rating ?? 0) < filters.minRating) return false
    if (filters.maxRating !== undefined && (w.rating ?? 5) > filters.maxRating) return false
    if (filters.minHourlyRate !== undefined && (w.hourlyRate ?? 0) < filters.minHourlyRate) return false
    if (filters.maxHourlyRate !== undefined && (w.hourlyRate ?? Infinity) > filters.maxHourlyRate) return false
    if (filters.availability && w.availability !== filters.availability) return false
    if (filters.location) {
      const loc = (w.location ?? '').toLowerCase()
      if (!loc.includes(filters.location.toLowerCase())) return false
    }
    return true
  })

  // Remove zero-score items when there is a query
  if (q.trim()) {
    scored = scored.filter(({ score }) => score > 0)
  }

  // Sort
  scored = sortResults(scored, sortBy)

  const total = scored.length
  const start = (page - 1) * pageSize
  const results = scored.slice(start, start + pageSize)

  return {
    results,
    total,
    page,
    pageSize,
    hasMore: start + pageSize < total,
    query: q,
    filters,
  }
}

// ── Job search ────────────────────────────────────────────────────────────────

export function searchJobs(
  searchQuery: SearchQuery,
  allJobs: Job[] = []
): SearchResponse<Job> {
  const { query: q = '', filters = {}, page = 1, pageSize = 20, sortBy = 'relevance' } = searchQuery

  let scored: SearchResult<Job>[] = allJobs.map((job) => {
    let score = 0
    const highlights: Record<string, string> = {}

    if (q.trim()) {
      const titleScore = scoreText(q, job.title, 2)
      const descScore = scoreText(q, job.description, 1)
      const skillsText = (job.skills ?? []).join(' ')
      const skillScore = scoreText(q, skillsText, 1.5)
      score = titleScore + descScore + skillScore

      if (titleScore > 0) highlights.title = highlight(q, job.title)
      if (descScore > 0) highlights.description = highlight(q, job.description)
      if (skillScore > 0) highlights.skills = highlight(q, skillsText)
    } else {
      score = 1
    }

    return { item: job, score, highlights }
  })

  // Apply filters
  scored = scored.filter(({ item: j }) => {
    if (filters.category && j.category !== filters.category) return false
    if (filters.budgetMin !== undefined && j.budget < filters.budgetMin) return false
    if (filters.budgetMax !== undefined && j.budget > filters.budgetMax) return false
    if (filters.skills?.length) {
      const jSkills = (j.skills ?? []).map((s) => s.toLowerCase())
      const match = filters.skills.some((s) => jSkills.includes(s.toLowerCase()))
      if (!match) return false
    }
    if (filters.location) {
      const loc = (j.location ?? '').toLowerCase()
      if (!loc.includes(filters.location.toLowerCase())) return false
    }
    return true
  })

  if (q.trim()) {
    scored = scored.filter(({ score }) => score > 0)
  }

  scored = sortResults(scored, sortBy)

  const total = scored.length
  const start = (page - 1) * pageSize
  const results = scored.slice(start, start + pageSize)

  return {
    results,
    total,
    page,
    pageSize,
    hasMore: start + pageSize < total,
    query: q,
    filters,
  }
}

// ── Combined search ───────────────────────────────────────────────────────────

export function searchAll(searchQuery: SearchQuery): {
  workers: SearchResponse<UserProfile>
  jobs: SearchResponse<Job>
} {
  return {
    workers: searchWorkers(searchQuery, []),
    jobs: searchJobs(searchQuery, []),
  }
}

// ── Suggestions ───────────────────────────────────────────────────────────────

const TRENDING_SKILLS = [
  'plumbing', 'electrical', 'carpentry', 'hvac', 'roofing',
  'landscaping', 'painting', 'flooring', 'cleaning', 'moving',
  'welding', 'masonry', 'drywall', 'tiling', 'insulation',
]

const JOB_CATEGORIES = [
  'plumbing', 'electrical', 'carpentry', 'hvac', 'roofing',
  'landscaping', 'painting', 'flooring', 'cleaning', 'moving', 'general',
]

export function getSuggestions(
  partialQuery: string,
  _userId?: string
): SearchSuggestion[] {
  const q = partialQuery.toLowerCase().trim()
  const suggestions: SearchSuggestion[] = []

  const skillMatches = TRENDING_SKILLS.filter((s) => s.includes(q) || q === '')
    .slice(0, 4)
    .map((s) => ({ text: s, type: 'skill' as const }))

  const categoryMatches = JOB_CATEGORIES.filter((c) => c.includes(q) || q === '')
    .slice(0, 4)
    .map((c) => ({ text: c, type: 'trending' as const }))

  suggestions.push(...skillMatches, ...categoryMatches)

  return suggestions.slice(0, 8)
}

// ── Facets ────────────────────────────────────────────────────────────────────

export function computeFacets(workers: UserProfile[], jobs: Job[]): SearchFacets {
  const skillCounts: Record<string, number> = {}
  const locationCounts: Record<string, number> = {}
  const categoryCounts: Record<string, number> = {}

  for (const w of workers) {
    for (const s of w.skills ?? []) skillCounts[s] = (skillCounts[s] ?? 0) + 1
    if (w.location) locationCounts[w.location] = (locationCounts[w.location] ?? 0) + 1
  }

  for (const j of jobs) {
    for (const s of j.skills ?? []) skillCounts[s] = (skillCounts[s] ?? 0) + 1
    if (j.location) locationCounts[j.location] = (locationCounts[j.location] ?? 0) + 1
    categoryCounts[j.category] = (categoryCounts[j.category] ?? 0) + 1
  }

  const ratingRanges = [
    { label: '4★ & up', min: 4, max: 5 },
    { label: '3★ & up', min: 3, max: 5 },
    { label: '2★ & up', min: 2, max: 5 },
  ].map((r) => ({
    ...r,
    count: workers.filter((w) => (w.rating ?? 0) >= r.min).length,
  }))

  return {
    skills: Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([value, count]) => ({ value, count })),
    locations: Object.entries(locationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([value, count]) => ({ value, count })),
    categories: Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([value, count]) => ({ value, count })),
    ratingRanges,
  }
}

// ── Sorting helper ────────────────────────────────────────────────────────────

function sortResults<T extends UserProfile | Job>(
  results: SearchResult<T>[],
  sortBy: string
): SearchResult<T>[] {
  return [...results].sort((a, b) => {
    switch (sortBy) {
      case 'rating_desc': {
        const ra = 'rating' in a.item ? (a.item.rating ?? 0) : 0
        const rb = 'rating' in b.item ? (b.item.rating ?? 0) : 0
        return rb - ra
      }
      case 'rate_asc': {
        const ra = 'hourlyRate' in a.item ? (a.item.hourlyRate ?? 0) : ('budget' in a.item ? a.item.budget : 0)
        const rb = 'hourlyRate' in b.item ? (b.item.hourlyRate ?? 0) : ('budget' in b.item ? b.item.budget : 0)
        return ra - rb
      }
      case 'rate_desc': {
        const ra = 'hourlyRate' in a.item ? (a.item.hourlyRate ?? 0) : ('budget' in a.item ? a.item.budget : 0)
        const rb = 'hourlyRate' in b.item ? (b.item.hourlyRate ?? 0) : ('budget' in b.item ? b.item.budget : 0)
        return rb - ra
      }
      default:
        return b.score - a.score
    }
  })
}
