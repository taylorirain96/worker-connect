import { db } from '@/lib/firebase'
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore'
import type { GDPRDataRequest, UserConsent } from '@/types/global'

export async function createExportRequest(userId: string): Promise<GDPRDataRequest> {
  const request: GDPRDataRequest = {
    id: `gdpr-export-${userId}-${Date.now()}`,
    userId,
    type: 'export',
    status: 'pending',
    createdAt: new Date().toISOString(),
  }

  if (!db) return request

  await setDoc(doc(db, 'gdprDataRequests', request.id), request)
  return request
}

export async function createDeleteRequest(
  userId: string,
  reason?: string
): Promise<GDPRDataRequest> {
  const request: GDPRDataRequest = {
    id: `gdpr-delete-${userId}-${Date.now()}`,
    userId,
    type: 'delete',
    status: 'pending',
    createdAt: new Date().toISOString(),
    reason,
  }

  if (!db) return request

  await setDoc(doc(db, 'gdprDataRequests', request.id), request)
  return request
}

export async function getRequestStatus(requestId: string): Promise<GDPRDataRequest | null> {
  if (!db) return null

  const snap = await getDoc(doc(db, 'gdprDataRequests', requestId))
  if (!snap.exists()) return null

  return snap.data() as GDPRDataRequest
}

export async function getUserConsents(userId: string): Promise<UserConsent | null> {
  if (!db) return null

  const snap = await getDoc(doc(db, 'userConsents', userId))
  if (!snap.exists()) return null

  return snap.data() as UserConsent
}

export async function updateUserConsents(
  userId: string,
  consents: Partial<UserConsent>
): Promise<void> {
  if (!db) return

  const ref = doc(db, 'userConsents', userId)
  const existing = await getDoc(ref)
  const current = existing.exists() ? (existing.data() as UserConsent) : { userId, updatedAt: '' }

  await setDoc(ref, {
    ...current,
    ...consents,
    userId,
    updatedAt: new Date().toISOString(),
  })
}

export async function getDataExportForUser(userId: string): Promise<Record<string, unknown>> {
  if (!db) return { userId, exported: true, data: {} }

  const collections = ['workerTaxProfiles', 'userConsents', 'gdprDataRequests']
  const result: Record<string, unknown> = { userId, exportedAt: new Date().toISOString() }

  for (const col of collections) {
    try {
      const q = query(collection(db, col), where('userId', '==', userId))
      const snap = await getDocs(q)
      result[col] = snap.docs.map(d => d.data())
    } catch {
      result[col] = []
    }
  }

  return result
}
