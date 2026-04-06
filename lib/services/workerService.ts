import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  type DocumentData,
  type Query,
  type CollectionReference,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { UserProfile } from '@/types'

function docToWorker(id: string, data: DocumentData): UserProfile {
  return { ...data, uid: id } as UserProfile
}

export interface WorkerFilters {
  category?: string
  location?: string
  minRating?: number
  availability?: string
  maxResults?: number
}

export async function getWorkers(filters: WorkerFilters = {}): Promise<UserProfile[]> {
  if (!db) return []

  const usersRef = collection(db, 'users') as CollectionReference<DocumentData>
  let q: Query<DocumentData> = query(usersRef, where('role', '==', 'worker'))

  if (filters.availability) {
    q = query(q, where('availability', '==', filters.availability))
  }

  // Order by rating descending so the best workers appear first
  q = query(q, orderBy('rating', 'desc'), limit(filters.maxResults ?? 100))

  const snapshot = await getDocs(q)
  let workers = snapshot.docs.map((d) => docToWorker(d.id, d.data()))

  // Client-side filters that Firestore can't combine with compound ordering
  if (filters.location) {
    const loc = filters.location.toLowerCase()
    workers = workers.filter((w) => w.location?.toLowerCase().includes(loc))
  }

  if (filters.minRating !== undefined) {
    workers = workers.filter((w) => (w.rating ?? 0) >= (filters.minRating as number))
  }

  if (filters.category) {
    const cat = filters.category.toLowerCase()
    workers = workers.filter((w) =>
      w.skills?.some((s) => s.toLowerCase().includes(cat))
    )
  }

  return workers
}

export async function getWorkerById(workerId: string): Promise<UserProfile | null> {
  if (!db) return null
  const userRef = doc(db, 'users', workerId)
  const snapshot = await getDoc(userRef)
  if (!snapshot.exists()) return null
  const data = snapshot.data()
  if (data.role !== 'worker') return null
  return docToWorker(snapshot.id, data)
}
