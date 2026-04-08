/**
 * Search client abstraction.
 *
 * This module provides a lightweight search client interface backed by the
 * in-memory search engine (lib/search/service.ts) and Firestore persistence
 * (lib/search/firebase.ts).  If you later migrate to a dedicated search
 * service such as Elasticsearch or Algolia, only this file needs to change.
 */

import type { UserProfile, Job } from '@/types'
import type {
  SearchQuery,
  SearchResponse,
  SearchSuggestion,
  SearchFacets,
  SearchFilters,
  SearchIndex,
} from '@/types/search'
import {
  searchWorkers,
  searchJobs,
  searchAll,
  getSuggestions,
  computeFacets,
} from '@/lib/search/service'
import {
  indexEntity,
  getSearchHistory,
  addSearchHistory,
  logSearchAnalytics,
} from '@/lib/search/firebase'

// ── Search client class ────────────────────────────────────────────────────────

export class SearchClient {
  /**
   * Execute a worker search and return paginated, scored results.
   */
  searchWorkers(query: SearchQuery, workers: UserProfile[] = []): SearchResponse<UserProfile> {
    return searchWorkers(query, workers)
  }

  /**
   * Execute a job search and return paginated, scored results.
   */
  searchJobs(query: SearchQuery, jobs: Job[] = []): SearchResponse<Job> {
    return searchJobs(query, jobs)
  }

  /**
   * Execute a combined search across workers and jobs.
   */
  searchAll(query: SearchQuery): { workers: SearchResponse<UserProfile>; jobs: SearchResponse<Job> } {
    return searchAll(query)
  }

  /**
   * Retrieve autocomplete suggestions for a partial query string.
   */
  getSuggestions(partialQuery: string, userId?: string): SearchSuggestion[] {
    return getSuggestions(partialQuery, userId)
  }

  /**
   * Compute facets (skills, locations, categories, rating buckets) for the
   * given set of workers and jobs – useful for rendering filter counts.
   */
  computeFacets(workers: UserProfile[], jobs: Job[]): SearchFacets {
    return computeFacets(workers, jobs)
  }

  /**
   * Index an entity so it can be retrieved by future searches.
   */
  async indexEntity(
    type: string,
    entityId: string,
    data: Omit<SearchIndex, 'entityType' | 'entityId' | 'updatedAt'>
  ): Promise<void> {
    await indexEntity(type, entityId, data)
  }

  /**
   * Retrieve the recent search history for a user.
   */
  async getSearchHistory(userId: string, limit = 10): Promise<string[]> {
    return getSearchHistory(userId, limit)
  }

  /**
   * Persist a query to the user's search history.
   */
  async addSearchHistory(userId: string, query: string): Promise<void> {
    await addSearchHistory(userId, query)
  }

  /**
   * Log search analytics (query term, active filters) to Firestore.
   */
  async logAnalytics(query: string, filters?: SearchFilters): Promise<void> {
    await logSearchAnalytics(query, filters)
  }
}

/** Singleton search client instance. */
export const searchClient = new SearchClient()

export default searchClient
