/**
 * Dispute service — Firestore helpers for the dispute resolution system.
 * Covers disputes, evidence, messages, resolutions, and rating appeals.
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
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '@/lib/firebase'
import type {
  Dispute,
  DisputeEvidence,
  DisputeMessage,
  DisputeResolution,
  RatingAppeal,
  DisputeResolutionReason,
  DisputeDecision,
  EvidenceType,
} from '@/types'

// ─── Collection names ──────────────────────────────────────────────────────

const DISPUTES_COL = 'disputes'
const EVIDENCE_COL = 'disputeEvidence'
const MESSAGES_COL = 'disputeMessages'
const RESOLUTIONS_COL = 'disputeResolutions'
const APPEALS_COL = 'ratingAppeals'

// ─── Helpers ────────────────────────────────────────────────────────────────

function toIso(ts: Timestamp | string | undefined): string {
  if (!ts) return new Date().toISOString()
  if (ts instanceof Timestamp) return ts.toDate().toISOString()
  return ts
}

function docToDispute(id: string, data: Record<string, unknown>): Dispute {
  return {
    ...(data as Omit<Dispute, 'id' | 'createdAt' | 'updatedAt' | 'resolvedAt' | 'dueDate'>),
    id,
    createdAt: toIso(data.createdAt as Timestamp | string | undefined),
    updatedAt: toIso(data.updatedAt as Timestamp | string | undefined),
    resolvedAt: data.resolvedAt ? toIso(data.resolvedAt as Timestamp | string | undefined) : undefined,
    dueDate: toIso(data.dueDate as Timestamp | string | undefined),
  }
}

function docToEvidence(id: string, data: Record<string, unknown>): DisputeEvidence {
  return {
    ...(data as Omit<DisputeEvidence, 'id' | 'timestamp'>),
    id,
    timestamp: toIso(data.timestamp as Timestamp | string | undefined),
  }
}

function docToMessage(id: string, data: Record<string, unknown>): DisputeMessage {
  return {
    ...(data as Omit<DisputeMessage, 'id' | 'timestamp'>),
    id,
    timestamp: toIso(data.timestamp as Timestamp | string | undefined),
  }
}

function docToResolution(id: string, data: Record<string, unknown>): DisputeResolution {
  return {
    ...(data as Omit<DisputeResolution, 'id' | 'timestamp'>),
    id,
    timestamp: toIso(data.timestamp as Timestamp | string | undefined),
  }
}

function docToAppeal(id: string, data: Record<string, unknown>): RatingAppeal {
  return {
    ...(data as Omit<RatingAppeal, 'id' | 'createdAt' | 'updatedAt' | 'resolvedAt'>),
    id,
    createdAt: toIso(data.createdAt as Timestamp | string | undefined),
    updatedAt: toIso(data.updatedAt as Timestamp | string | undefined),
    resolvedAt: data.resolvedAt ? toIso(data.resolvedAt as Timestamp | string | undefined) : undefined,
  }
}

// ─── Disputes ───────────────────────────────────────────────────────────────

/** File a new dispute. Returns the new dispute id. */
export async function fileDispute(
  payload: Omit<Dispute, 'id' | 'createdAt' | 'updatedAt' | 'resolvedAt'>
): Promise<string> {
  if (!db) throw new Error('Firestore not initialized')
  const now = serverTimestamp()
  const ref = collection(db, DISPUTES_COL)
  const docRef = await addDoc(ref, { ...payload, createdAt: now, updatedAt: now })
  return docRef.id
}

/** Get a single dispute by id. */
export async function getDispute(disputeId: string): Promise<Dispute | null> {
  if (!db) return null
  const snap = await getDoc(doc(db, DISPUTES_COL, disputeId))
  if (!snap.exists()) return null
  return docToDispute(snap.id, snap.data() as Record<string, unknown>)
}

/** Fetch all disputes filed by or against a user, newest first. */
export async function getUserDisputes(userId: string): Promise<Dispute[]> {
  if (!db) return []
  const [asWorker, asClient] = await Promise.all([
    getDocs(query(collection(db, DISPUTES_COL), where('workerId', '==', userId), orderBy('createdAt', 'desc'), limit(50))),
    getDocs(query(collection(db, DISPUTES_COL), where('clientId', '==', userId), orderBy('createdAt', 'desc'), limit(50))),
  ])
  const map = new Map<string, Dispute>()
  ;[...asWorker.docs, ...asClient.docs].forEach((d) =>
    map.set(d.id, docToDispute(d.id, d.data() as Record<string, unknown>))
  )
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

/** Fetch all open / under-review disputes (mediator queue). */
export async function getPendingDisputes(): Promise<Dispute[]> {
  if (!db) return []
  const snap = await getDocs(
    query(
      collection(db, DISPUTES_COL),
      where('status', 'in', ['open', 'under_review', 'awaiting_evidence', 'escalated']),
      orderBy('createdAt', 'asc'),
      limit(100)
    )
  )
  return snap.docs.map((d) => docToDispute(d.id, d.data() as Record<string, unknown>))
}

/** Update dispute fields (status, mediatorId, refundAmount, etc.). */
export async function updateDispute(
  disputeId: string,
  updates: Partial<Omit<Dispute, 'id' | 'createdAt'>>
): Promise<void> {
  if (!db) throw new Error('Firestore not initialized')
  await updateDoc(doc(db, DISPUTES_COL, disputeId), {
    ...updates,
    updatedAt: serverTimestamp(),
  })
}

/** Real-time listener for a single dispute. */
export function subscribeToDispute(
  disputeId: string,
  onChange: (dispute: Dispute | null) => void
): Unsubscribe {
  if (!db) return () => {}
  return onSnapshot(doc(db, DISPUTES_COL, disputeId), (snap) => {
    onChange(snap.exists() ? docToDispute(snap.id, snap.data() as Record<string, unknown>) : null)
  })
}

// ─── Evidence ───────────────────────────────────────────────────────────────

/** Upload an evidence file to Firebase Storage and create the evidence record. */
export async function uploadEvidence(
  disputeId: string,
  file: File,
  type: EvidenceType,
  description: string,
  uploadedBy: string,
  uploaderName: string
): Promise<DisputeEvidence> {
  if (!db) throw new Error('Firestore not initialized')

  let fileUrl: string | undefined
  let storagePath: string | undefined

  if (storage && file.size > 0) {
    storagePath = `disputeEvidence/${disputeId}/${Date.now()}_${file.name}`
    const storageRef = ref(storage, storagePath)
    await uploadBytes(storageRef, file)
    fileUrl = await getDownloadURL(storageRef)
  }

  const payload: Omit<DisputeEvidence, 'id'> = {
    disputeId,
    type,
    fileUrl,
    storagePath,
    fileName: file.name,
    fileSize: file.size,
    description,
    uploadedBy,
    uploaderName,
    timestamp: new Date().toISOString(),
  }

  const docRef = await addDoc(collection(db, EVIDENCE_COL), {
    ...payload,
    timestamp: serverTimestamp(),
  })
  return { ...payload, id: docRef.id }
}

/** Fetch all evidence for a dispute. */
export async function getDisputeEvidence(disputeId: string): Promise<DisputeEvidence[]> {
  if (!db) return []
  const snap = await getDocs(
    query(collection(db, EVIDENCE_COL), where('disputeId', '==', disputeId), orderBy('timestamp', 'asc'))
  )
  return snap.docs.map((d) => docToEvidence(d.id, d.data() as Record<string, unknown>))
}

// ─── Messages ───────────────────────────────────────────────────────────────

/** Send a message in a dispute thread. */
export async function sendDisputeMessage(
  payload: Omit<DisputeMessage, 'id' | 'timestamp' | 'read'>
): Promise<string> {
  if (!db) throw new Error('Firestore not initialized')
  const docRef = await addDoc(collection(db, MESSAGES_COL), {
    ...payload,
    read: false,
    timestamp: serverTimestamp(),
  })
  return docRef.id
}

/** Fetch all messages for a dispute thread. */
export async function getDisputeMessages(disputeId: string): Promise<DisputeMessage[]> {
  if (!db) return []
  const snap = await getDocs(
    query(
      collection(db, MESSAGES_COL),
      where('disputeId', '==', disputeId),
      orderBy('timestamp', 'asc')
    )
  )
  return snap.docs.map((d) => docToMessage(d.id, d.data() as Record<string, unknown>))
}

/** Real-time listener for dispute messages. */
export function subscribeToDisputeMessages(
  disputeId: string,
  onChange: (messages: DisputeMessage[]) => void
): Unsubscribe {
  if (!db) return () => {}
  const q = query(
    collection(db, MESSAGES_COL),
    where('disputeId', '==', disputeId),
    orderBy('timestamp', 'asc')
  )
  return onSnapshot(q, (snap) =>
    onChange(snap.docs.map((d) => docToMessage(d.id, d.data() as Record<string, unknown>)))
  )
}

/** Mark all unread messages in a dispute as read for a given user. */
export async function markDisputeMessagesRead(
  disputeId: string,
  userId: string
): Promise<void> {
  if (!db) return
  const snap = await getDocs(
    query(
      collection(db, MESSAGES_COL),
      where('disputeId', '==', disputeId),
      where('read', '==', false)
    )
  )
  const toUpdate = snap.docs.filter((d) => d.data().senderId !== userId)
  await Promise.all(toUpdate.map((d) => updateDoc(d.ref, { read: true })))
}

// ─── Resolutions ─────────────────────────────────────────────────────────────

/** Submit a mediator resolution decision. */
export async function submitResolution(
  disputeId: string,
  decision: DisputeDecision,
  refundAmount: number,
  mediatorId: string,
  mediatorName: string,
  reasoning: string
): Promise<void> {
  if (!db) throw new Error('Firestore not initialized')

  const resolutionPayload: Omit<DisputeResolution, 'id'> = {
    disputeId,
    decision,
    refundAmount,
    mediatorId,
    mediatorName,
    reasoning,
    timestamp: new Date().toISOString(),
  }

  await addDoc(collection(db, RESOLUTIONS_COL), {
    ...resolutionPayload,
    timestamp: serverTimestamp(),
  })

  const newStatus =
    decision === 'approved' || decision === 'partial_refund' ? 'resolved' :
    decision === 'escalated' ? 'escalated' :
    'closed'

  await updateDispute(disputeId, {
    status: newStatus,
    mediatorId,
    mediatorName,
    refundAmount,
    refundStatus: decision === 'approved' || decision === 'partial_refund' ? 'pending' : 'none',
    resolvedAt: new Date().toISOString(),
  })
}

/** Get the resolution record for a dispute (if exists). */
export async function getDisputeResolution(disputeId: string): Promise<DisputeResolution | null> {
  if (!db) return null
  const snap = await getDocs(
    query(collection(db, RESOLUTIONS_COL), where('disputeId', '==', disputeId), limit(1))
  )
  if (snap.empty) return null
  const d = snap.docs[0]
  return docToResolution(d.id, d.data() as Record<string, unknown>)
}

// ─── Rating Appeals ──────────────────────────────────────────────────────────

/** File a rating appeal. Returns the new appeal id. */
export async function fileRatingAppeal(
  payload: Omit<RatingAppeal, 'id' | 'createdAt' | 'updatedAt' | 'resolvedAt'>
): Promise<string> {
  if (!db) throw new Error('Firestore not initialized')
  const now = serverTimestamp()
  const docRef = await addDoc(collection(db, APPEALS_COL), {
    ...payload,
    createdAt: now,
    updatedAt: now,
  })
  return docRef.id
}

/** Fetch all rating appeals for a worker. */
export async function getWorkerRatingAppeals(workerId: string): Promise<RatingAppeal[]> {
  if (!db) return []
  const snap = await getDocs(
    query(collection(db, APPEALS_COL), where('workerId', '==', workerId), orderBy('createdAt', 'desc'))
  )
  return snap.docs.map((d) => docToAppeal(d.id, d.data() as Record<string, unknown>))
}

/** Fetch pending rating appeals (mediator queue). */
export async function getPendingRatingAppeals(): Promise<RatingAppeal[]> {
  if (!db) return []
  const snap = await getDocs(
    query(
      collection(db, APPEALS_COL),
      where('status', 'in', ['pending', 'under_review']),
      orderBy('createdAt', 'asc'),
      limit(100)
    )
  )
  return snap.docs.map((d) => docToAppeal(d.id, d.data() as Record<string, unknown>))
}

/** Resolve a rating appeal. */
export async function resolveRatingAppeal(
  appealId: string,
  mediatorId: string,
  decision: RatingAppeal['decision'],
  mediatorNote: string,
  adjustedRating?: number
): Promise<void> {
  if (!db) throw new Error('Firestore not initialized')
  await updateDoc(doc(db, APPEALS_COL, appealId), {
    status: 'approved' as const,
    mediatorId,
    mediatorNote,
    decision,
    adjustedRating,
    resolvedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

// ─── Reason helpers ──────────────────────────────────────────────────────────

export const DISPUTE_REASON_LABELS: Record<DisputeResolutionReason, string> = {
  quality_issues: 'Quality Issues',
  non_payment: 'Non-Payment',
  non_delivery: 'Non-Delivery / No-Show',
  misrepresentation: 'Misrepresentation',
  safety_concern: 'Safety Concern',
  overcharge: 'Overcharge',
  incomplete_work: 'Incomplete Work',
  other: 'Other',
}

export const DISPUTE_DECISION_LABELS: Record<DisputeDecision, string> = {
  approved: 'Full Refund Approved',
  denied: 'Dispute Denied',
  partial_refund: 'Partial Refund',
  escalated: 'Escalated to Management',
}
