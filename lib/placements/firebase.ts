/**
 * Firestore CRUD helpers for the `placements` collection.
 * A "placement" is created when a worker is hired through QuickTrade's
 * recruitment track and tracks their ongoing employment status.
 */
import {
  collection,
  doc,
  addDoc,
  getDoc,
  updateDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp,
  type DocumentData,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Placement {
  id: string
  workerId: string
  workerName: string
  workerEmail: string
  employerId: string
  employerName: string
  employerEmail: string
  jobId: string
  jobTitle: string
  jobType: 'casual' | 'part_time' | 'full_time' | 'contract'
  status: 'active' | 'ended'
  hiredAt: string
  endedAt?: string
  /** Last time the worker tapped "Still employed" */
  workerConfirmedAt?: string
  /** Last time the employer confirmed the worker is still employed */
  employerConfirmedAt?: string
  checkInDay30Sent: boolean
  checkInDay60Sent: boolean
  checkInDay90Sent: boolean
  reEngagementSent: boolean
  createdAt: string
  updatedAt: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function tsToISO(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString()
  if (typeof value === 'string') return value
  return new Date().toISOString()
}

function docToPlacement(id: string, data: DocumentData): Placement {
  return {
    ...data,
    id,
    hiredAt: tsToISO(data.hiredAt),
    endedAt: data.endedAt ? tsToISO(data.endedAt) : undefined,
    workerConfirmedAt: data.workerConfirmedAt ? tsToISO(data.workerConfirmedAt) : undefined,
    employerConfirmedAt: data.employerConfirmedAt ? tsToISO(data.employerConfirmedAt) : undefined,
    createdAt: tsToISO(data.createdAt),
    updatedAt: tsToISO(data.updatedAt),
  } as Placement
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

/**
 * Creates a new placement record when a hire is confirmed.
 */
export async function createPlacement(
  data: Omit<Placement, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  if (!db) throw new Error('Firestore not initialised')
  const ref = await addDoc(collection(db, 'placements'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

/**
 * Returns the single active placement for a given worker, or null if none.
 */
export async function getWorkerActivePlacement(workerId: string): Promise<Placement | null> {
  if (!db) return null
  const q = query(
    collection(db, 'placements'),
    where('workerId', '==', workerId),
    where('status', '==', 'active')
  )
  const snapshot = await getDocs(q)
  if (snapshot.empty) return null
  const first = snapshot.docs[0]
  return docToPlacement(first.id, first.data())
}

/**
 * Updates the status of a placement (e.g. mark as 'ended').
 */
export async function updatePlacementStatus(
  placementId: string,
  status: 'active' | 'ended'
): Promise<void> {
  if (!db) throw new Error('Firestore not initialised')
  const ref = doc(db, 'placements', placementId)
  const updates: Record<string, unknown> = {
    status,
    updatedAt: serverTimestamp(),
  }
  if (status === 'ended') {
    updates.endedAt = serverTimestamp()
  }
  await updateDoc(ref, updates)
}

/**
 * Records a confirmation that the worker is still employed.
 * `confirmedBy` determines which timestamp field is updated.
 */
export async function confirmStillEmployed(
  placementId: string,
  confirmedBy: 'worker' | 'employer'
): Promise<void> {
  if (!db) throw new Error('Firestore not initialised')
  const ref = doc(db, 'placements', placementId)
  const field = confirmedBy === 'worker' ? 'workerConfirmedAt' : 'employerConfirmedAt'
  await updateDoc(ref, {
    [field]: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

// Shared mapping from day-mark to the corresponding Firestore field name
const CHECK_IN_FIELD_MAP: Record<30 | 60 | 90, keyof Placement> = {
  30: 'checkInDay30Sent',
  60: 'checkInDay60Sent',
  90: 'checkInDay90Sent',
}

/**
 * Returns all active placements where the specified day-mark check-in has not
 * yet been sent and the required number of days have elapsed since hiring.
 */
export async function getPlacementsNeedingCheckIn(
  dayMark: 30 | 60 | 90
): Promise<Placement[]> {
  if (!db) return []

  const sentField = CHECK_IN_FIELD_MAP[dayMark]

  const q = query(
    collection(db, 'placements'),
    where('status', '==', 'active'),
    where(sentField, '==', false)
  )
  const snapshot = await getDocs(q)

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - dayMark)

  return snapshot.docs
    .map((d) => docToPlacement(d.id, d.data()))
    .filter((p) => new Date(p.hiredAt) <= cutoff)
}

/**
 * Marks a specific day-mark check-in as sent for a placement.
 */
export async function markCheckInSent(
  placementId: string,
  dayMark: 30 | 60 | 90
): Promise<void> {
  if (!db) throw new Error('Firestore not initialised')
  const ref = doc(db, 'placements', placementId)
  await updateDoc(ref, {
    [CHECK_IN_FIELD_MAP[dayMark]]: true,
    updatedAt: serverTimestamp(),
  })
}

/**
 * Fetches a single placement by its ID.
 */
export async function getPlacement(placementId: string): Promise<Placement | null> {
  if (!db) return null
  const ref = doc(db, 'placements', placementId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return docToPlacement(snap.id, snap.data())
}

/**
 * Marks the re-engagement emails as sent for a placement.
 */
export async function markReEngagementSent(placementId: string): Promise<void> {
  if (!db) throw new Error('Firestore not initialised')
  const ref = doc(db, 'placements', placementId)
  await updateDoc(ref, {
    reEngagementSent: true,
    updatedAt: serverTimestamp(),
  })
}
