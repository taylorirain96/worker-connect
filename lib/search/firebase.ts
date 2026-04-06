import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  addDoc,
  query,
  orderBy,
  limit,
  increment,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { SavedSearch, SearchAlert, SearchAnalytics, SearchFilters, SearchIndex } from '@/types/search'

// ── Saved Searches ────────────────────────────────────────────────────────────

export async function saveSearch(
  userId: string,
  data: { name: string; query: string; filters?: SearchFilters; resultsCount?: number }
): Promise<SavedSearch | null> {
  if (!db) return null
  try {
    const ref = collection(db, 'savedSearches', userId, 'searches')
    const docRef = await addDoc(ref, {
      ...data,
      userId,
      createdAt: new Date().toISOString(),
      lastUsedAt: new Date().toISOString(),
    })
    return {
      id: docRef.id,
      userId,
      name: data.name,
      query: data.query,
      filters: data.filters,
      resultsCount: data.resultsCount,
      createdAt: new Date().toISOString(),
      lastUsedAt: new Date().toISOString(),
    }
  } catch (err) {
    console.error('saveSearch error:', err)
    return null
  }
}

export async function getSavedSearches(userId: string): Promise<SavedSearch[]> {
  if (!db) return []
  try {
    const ref = collection(db, 'savedSearches', userId, 'searches')
    const snap = await getDocs(query(ref, orderBy('createdAt', 'desc')))
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as SavedSearch))
  } catch (err) {
    console.error('getSavedSearches error:', err)
    return []
  }
}

export async function deleteSavedSearch(userId: string, searchId: string): Promise<void> {
  if (!db) return
  try {
    await deleteDoc(doc(db, 'savedSearches', userId, 'searches', searchId))
  } catch (err) {
    console.error('deleteSavedSearch error:', err)
  }
}

// ── Search Alerts ─────────────────────────────────────────────────────────────

export async function createSearchAlert(
  userId: string,
  data: { query: string; filters?: SearchFilters; notificationFrequency: 'daily' | 'weekly' | 'immediately' }
): Promise<SearchAlert | null> {
  if (!db) return null
  try {
    const ref = collection(db, 'searchAlerts', userId, 'alerts')
    const docRef = await addDoc(ref, {
      ...data,
      userId,
      enabled: true,
      createdAt: new Date().toISOString(),
    })
    return {
      id: docRef.id,
      userId,
      query: data.query,
      filters: data.filters,
      notificationFrequency: data.notificationFrequency,
      enabled: true,
      createdAt: new Date().toISOString(),
    }
  } catch (err) {
    console.error('createSearchAlert error:', err)
    return null
  }
}

export async function getSearchAlerts(userId: string): Promise<SearchAlert[]> {
  if (!db) return []
  try {
    const ref = collection(db, 'searchAlerts', userId, 'alerts')
    const snap = await getDocs(query(ref, orderBy('createdAt', 'desc')))
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as SearchAlert))
  } catch (err) {
    console.error('getSearchAlerts error:', err)
    return []
  }
}

export async function deleteSearchAlert(userId: string, alertId: string): Promise<void> {
  if (!db) return
  try {
    await deleteDoc(doc(db, 'searchAlerts', userId, 'alerts', alertId))
  } catch (err) {
    console.error('deleteSearchAlert error:', err)
  }
}

// ── Analytics ─────────────────────────────────────────────────────────────────

export async function logSearchAnalytics(
  searchQuery: string,
  filters?: SearchFilters
): Promise<void> {
  if (!db) return
  try {
    const date = new Date().toISOString().split('T')[0]
    const ref = doc(db, 'searchAnalytics', date)
    const updates: Record<string, unknown> = {
      searchCount: increment(1),
    }
    if (searchQuery.trim()) {
      updates[`popularSearches.${searchQuery.trim().toLowerCase()}`] = increment(1)
    }
    if (filters?.skills?.length) {
      for (const skill of filters.skills) {
        updates[`trendingSkills.${skill}`] = increment(1)
      }
    }
    if (filters?.location) {
      updates[`topLocations.${filters.location}`] = increment(1)
    }
    const filterCount = filters ? Object.keys(filters).filter((k) => {
      const v = (filters as Record<string, unknown>)[k]
      return v !== undefined && v !== null && (Array.isArray(v) ? v.length > 0 : true)
    }).length : 0
    updates['totalFilterCount'] = increment(filterCount)
    await setDoc(ref, updates, { merge: true })
  } catch (err) {
    console.error('logSearchAnalytics error:', err)
  }
}

export async function getSearchAnalytics(days = 30): Promise<SearchAnalytics[]> {
  if (!db) return []
  try {
    const results: SearchAnalytics[] = []
    const now = new Date()
    for (let i = 0; i < days; i++) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const date = d.toISOString().split('T')[0]
      const ref = doc(db, 'searchAnalytics', date)
      const snap = await getDoc(ref)
      if (snap.exists()) {
        const data = snap.data()
        results.push({
          date,
          popularSearches: data.popularSearches ?? {},
          trendingSkills: data.trendingSkills ?? {},
          avgFilterCount: data.searchCount ? (data.totalFilterCount ?? 0) / data.searchCount : 0,
          searchCount: data.searchCount ?? 0,
          topLocations: data.topLocations ?? {},
        })
      }
    }
    return results
  } catch (err) {
    console.error('getSearchAnalytics error:', err)
    return []
  }
}

// ── Search Index ──────────────────────────────────────────────────────────────

export async function indexEntity(
  type: string,
  entityId: string,
  data: Omit<SearchIndex, 'entityType' | 'entityId' | 'updatedAt'>
): Promise<void> {
  if (!db) return
  try {
    await setDoc(doc(db, 'searchIndices', type, entityId, 'index'), {
      ...data,
      entityType: type,
      entityId,
      updatedAt: new Date().toISOString(),
    })
  } catch (err) {
    console.error('indexEntity error:', err)
  }
}

// ── Search History ────────────────────────────────────────────────────────────

export async function getSearchHistory(
  userId: string,
  historyLimit = 10
): Promise<string[]> {
  if (!db) return []
  try {
    const ref = collection(db, 'searchHistory', userId, 'queries')
    const snap = await getDocs(query(ref, orderBy('timestamp', 'desc'), limit(historyLimit)))
    return snap.docs.map((d) => d.data().query as string)
  } catch (err) {
    console.error('getSearchHistory error:', err)
    return []
  }
}

export async function addSearchHistory(userId: string, searchQuery: string): Promise<void> {
  if (!db) return
  try {
    const ref = collection(db, 'searchHistory', userId, 'queries')
    await addDoc(ref, {
      query: searchQuery,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error('addSearchHistory error:', err)
  }
}
