/**
 * Quote service — Firestore helpers for quotes & estimates.
 */
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  type DocumentData,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Quote } from '@/types'

// ─── Collection ───────────────────────────────────────────────────────────────

const QUOTES_COL = 'quotes'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toStr(ts: Timestamp | string | undefined): string {
  if (!ts) return new Date().toISOString()
  if (ts instanceof Timestamp) return ts.toDate().toISOString()
  return ts
}

function docToQuote(id: string, data: DocumentData): Quote {
  return {
    ...data,
    id,
    createdAt: toStr(data.createdAt),
    updatedAt: toStr(data.updatedAt),
    expiresAt: toStr(data.expiresAt),
    acceptedAt: data.acceptedAt ? toStr(data.acceptedAt) : undefined,
  } as Quote
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

/** Submit a new quote. Returns the new document id. */
export async function createQuote(
  data: Omit<Quote, 'id' | 'createdAt' | 'updatedAt' | 'expiresAt' | 'status'>
): Promise<string> {
  if (!db) throw new Error('Firestore not available')
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const ref = await addDoc(collection(db, QUOTES_COL), {
    ...data,
    status: 'pending',
    expiresAt: Timestamp.fromDate(expiresAt),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

/** Fetch a single quote by id. */
export async function getQuote(quoteId: string): Promise<Quote | null> {
  if (!db) return null
  const snap = await getDoc(doc(db, QUOTES_COL, quoteId))
  if (!snap.exists()) return null
  return docToQuote(snap.id, snap.data())
}

/** Get all quotes for a job (employer view). */
export async function getJobQuotes(jobId: string): Promise<Quote[]> {
  if (!db) return []
  const q = query(
    collection(db, QUOTES_COL),
    where('jobId', '==', jobId),
    orderBy('createdAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => docToQuote(d.id, d.data()))
}

/** Get all quotes submitted by a worker, optionally filtered by status. */
export async function getWorkerQuotes(
  workerId: string,
  status?: Quote['status']
): Promise<Quote[]> {
  if (!db) return []
  const constraints = [
    where('workerId', '==', workerId),
    orderBy('createdAt', 'desc'),
  ]
  if (status) {
    constraints.splice(1, 0, where('status', '==', status))
  }
  const q = query(collection(db, QUOTES_COL), ...constraints)
  const snap = await getDocs(q)
  return snap.docs.map((d) => docToQuote(d.id, d.data()))
}

/** Update a quote's status. */
export async function updateQuoteStatus(
  quoteId: string,
  status: Quote['status']
): Promise<void> {
  if (!db) return
  const updates: Record<string, unknown> = { status, updatedAt: serverTimestamp() }
  if (status === 'accepted') updates.acceptedAt = serverTimestamp()
  await updateDoc(doc(db, QUOTES_COL, quoteId), updates)
}

/** Delete a quote (only expired/rejected allowed). */
export async function deleteQuote(quoteId: string): Promise<void> {
  if (!db) return
  const snap = await getDoc(doc(db, QUOTES_COL, quoteId))
  if (!snap.exists()) throw new Error(`Quote ${quoteId} not found`)
  const s = snap.data()?.status as string
  if (s !== 'expired' && s !== 'rejected') {
    throw new Error('Only expired or rejected quotes can be deleted')
  }
  await deleteDoc(doc(db, QUOTES_COL, quoteId))
}

/** Search quotes with flexible filters. */
export async function searchQuotes(filters: {
  status?: Quote['status']
  workerId?: string
  jobId?: string
  dateFrom?: string
  dateTo?: string
}): Promise<Quote[]> {
  if (!db) return []
  const constraints: Parameters<typeof query>[1][] = [orderBy('createdAt', 'desc')]
  if (filters.status) constraints.push(where('status', '==', filters.status))
  if (filters.workerId) constraints.push(where('workerId', '==', filters.workerId))
  if (filters.jobId) constraints.push(where('jobId', '==', filters.jobId))

  const q = query(collection(db, QUOTES_COL), ...constraints)
  const snap = await getDocs(q)

  let results = snap.docs.map((d) => docToQuote(d.id, d.data()))

  // Client-side date filter (Firestore compound index limitation)
  if (filters.dateFrom) {
    const from = new Date(filters.dateFrom).getTime()
    results = results.filter((r) => new Date(r.createdAt).getTime() >= from)
  }
  if (filters.dateTo) {
    const to = new Date(filters.dateTo).getTime()
    results = results.filter((r) => new Date(r.createdAt).getTime() <= to)
  }

  return results
}
