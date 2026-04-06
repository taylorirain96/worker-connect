import type { UserProfile, Job } from '@/types'

export interface SearchFilters {
  skills?: string[]
  minRating?: number
  maxRating?: number
  location?: string
  radius?: number
  minHourlyRate?: number
  maxHourlyRate?: number
  availability?: 'available' | 'busy' | 'unavailable'
  experienceLevel?: string
  category?: string
  budgetMin?: number
  budgetMax?: number
  timeline?: string
  dateFrom?: string
  dateTo?: string
}

export interface WorkerSearchFilters extends SearchFilters {
  minHourlyRate?: number
  maxHourlyRate?: number
  availability?: 'available' | 'busy' | 'unavailable'
}

export interface JobSearchFilters extends SearchFilters {
  budgetMin?: number
  budgetMax?: number
  category?: string
}

export interface SearchQuery {
  query: string
  filters?: SearchFilters
  type?: 'workers' | 'jobs' | 'reviews' | 'all'
  page?: number
  pageSize?: number
  sortBy?: string
}

export interface SearchResult<T> {
  item: T
  score: number
  highlights: Record<string, string>
}

export interface SearchFacets {
  skills: { value: string; count: number }[]
  locations: { value: string; count: number }[]
  categories: { value: string; count: number }[]
  ratingRanges: { label: string; min: number; max: number; count: number }[]
}

export interface SearchResponse<T> {
  results: SearchResult<T>[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
  query: string
  filters?: SearchFilters
  facets?: SearchFacets
}

export interface SearchSuggestion {
  text: string
  type: 'recent' | 'trending' | 'skill' | 'location'
  count?: number
}

export interface SavedSearch {
  id: string
  userId: string
  name: string
  query: string
  filters?: SearchFilters
  resultsCount?: number
  createdAt: string
  lastUsedAt?: string
}

export interface SearchAlert {
  id: string
  userId: string
  query: string
  filters?: SearchFilters
  notificationFrequency: 'daily' | 'weekly' | 'immediately'
  enabled: boolean
  createdAt: string
}

export interface SearchIndex {
  entityType: string
  entityId: string
  text: string
  keywords: string[]
  type: string
  metadata: Record<string, unknown>
  updatedAt: string
}

export interface SearchAnalytics {
  date: string
  popularSearches: Record<string, number>
  trendingSkills: Record<string, number>
  avgFilterCount: number
  searchCount: number
  topLocations: Record<string, number>
}

export type { UserProfile, Job }
