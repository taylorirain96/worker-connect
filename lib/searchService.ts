// Facade – re-export everything from the search sub-modules for easy importing.

export {
  searchWorkers,
  searchJobs,
  searchAll,
  getSuggestions,
  computeFacets,
} from '@/lib/search/service'

export {
  saveSearch,
  getSavedSearches,
  deleteSavedSearch,
  createSearchAlert,
  getSearchAlerts,
  deleteSearchAlert,
  logSearchAnalytics,
  getSearchAnalytics,
  indexEntity,
  getSearchHistory,
  addSearchHistory,
} from '@/lib/search/firebase'
