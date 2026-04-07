/**
 * Verification service — Firestore helpers for worker verification records.
 */
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type {
  VerificationType,
  VerificationStatus,
  VerificationRecord,
  VerificationProfile,
} from '@/types/reputation'

// ─── Collection names ────────────────────────────────────────────────────────

const RECORDS_COL = 'verificationRecords'
const PROFILES_COL = 'verificationProfiles'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toIso(ts: Timestamp | string | undefined): string {
  if (!ts) return new Date().toISOString()
  if (ts instanceof Timestamp) return ts.toDate().toISOString()
  return ts
}

function docToRecord(id: string, data: Record<string, unknown>): VerificationRecord {
  return {
    id,
    workerId: data.workerId as string,
    type: data.type as VerificationType,
    status: data.status as VerificationStatus,
    submittedAt: toIso(data.submittedAt as Timestamp | string | undefined),
    verifiedAt: data.verifiedAt ? toIso(data.verifiedAt as Timestamp | string) : undefined,
    expiresAt: data.expiresAt ? toIso(data.expiresAt as Timestamp | string) : undefined,
    documentUrl: data.documentUrl as string | undefined,
    notes: data.notes as string | undefined,
    providerData: data.providerData as Record<string, unknown> | undefined,
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Create a new verification record (status = pending) for the given type.
 * If an existing pending/in_review record for this type already exists, return it.
 */
export async function startVerification(
  workerId: string,
  type: VerificationType
): Promise<VerificationRecord | null> {
  if (!db) return null

  // Check for existing active record
  const q = query(
    collection(db, RECORDS_COL),
    where('workerId', '==', workerId),
    where('type', '==', type)
  )
  const existing = await getDocs(q)
  const active = existing.docs.find((d) => {
    const s = d.data().status as VerificationStatus
    return s === 'pending' || s === 'in_review'
  })
  if (active) return docToRecord(active.id, active.data() as Record<string, unknown>)

  const ref = await addDoc(collection(db, RECORDS_COL), {
    workerId,
    type,
    status: 'pending' as VerificationStatus,
    submittedAt: serverTimestamp(),
  })

  return {
    id: ref.id,
    workerId,
    type,
    status: 'pending',
    submittedAt: new Date().toISOString(),
  }
}

/** Fetch the full verification profile for a worker. */
export async function getVerificationStatus(workerId: string): Promise<VerificationProfile> {
  const empty: VerificationProfile = {
    workerId,
    records: [],
    verificationLevel: 0,
    lastUpdated: new Date().toISOString(),
  }
  if (!db) return empty

  const q = query(collection(db, RECORDS_COL), where('workerId', '==', workerId))
  const snap = await getDocs(q)
  const records = snap.docs.map((d) =>
    docToRecord(d.id, d.data() as Record<string, unknown>)
  )

  const verifiedCount = records.filter((r) => r.status === 'verified').length
  const level = Math.min(5, verifiedCount) as 0 | 1 | 2 | 3 | 4 | 5

  return {
    workerId,
    records,
    verificationLevel: level,
    lastUpdated: new Date().toISOString(),
  }
}

/** Update the status (and optional notes) of an existing verification record. */
export async function updateVerificationStatus(
  recordId: string,
  status: VerificationStatus,
  notes?: string
): Promise<void> {
  if (!db) return

  const ref = doc(db, RECORDS_COL, recordId)
  const updates: Record<string, unknown> = { status }
  if (notes !== undefined) updates.notes = notes
  if (status === 'verified') updates.verifiedAt = serverTimestamp()

  await updateDoc(ref, updates)
}

/** Return the number of verified records (0-5) for a worker. */
export async function getVerificationLevel(workerId: string): Promise<0 | 1 | 2 | 3 | 4 | 5> {
  if (!db) return 0
  const profile = await getVerificationStatus(workerId)
  return profile.verificationLevel
}
