/**
 * Escrow service — Firestore helpers for escrow payments and job posting fees.
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
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type {
  EscrowPayment,
  EscrowStatus,
  JobPostingPayment,
  WorkerEarningsSummary,
  EarningsTransaction,
  CommissionTier,
} from '@/types'
import { COMMISSION_TIERS as TIERS, JOB_POSTING_FEES } from '@/types'

const ESCROW_COL = 'escrowPayments'
const JOB_POSTING_COL = 'jobPostingPayments'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toISO(ts: Timestamp | string | undefined): string {
  if (!ts) return new Date().toISOString()
  if (ts instanceof Timestamp) return ts.toDate().toISOString()
  return ts
}

function toEscrow(id: string, data: Record<string, unknown>): EscrowPayment {
  return {
    ...data,
    id,
    createdAt: toISO(data.createdAt as Timestamp | string | undefined),
    updatedAt: toISO(data.updatedAt as Timestamp | string | undefined),
    releasedAt: data.releasedAt ? toISO(data.releasedAt as Timestamp | string | undefined) : undefined,
    disputedAt: data.disputedAt ? toISO(data.disputedAt as Timestamp | string | undefined) : undefined,
    refundedAt: data.refundedAt ? toISO(data.refundedAt as Timestamp | string | undefined) : undefined,
  } as EscrowPayment
}

function toJobPosting(id: string, data: Record<string, unknown>): JobPostingPayment {
  return {
    ...data,
    id,
    createdAt: toISO(data.createdAt as Timestamp | string | undefined),
    updatedAt: toISO(data.updatedAt as Timestamp | string | undefined),
    completedAt: data.completedAt ? toISO(data.completedAt as Timestamp | string | undefined) : undefined,
  } as JobPostingPayment
}

// ─── Commission Calculation ──────────────────────────────────────────────────

/** Get the commission tier config for a given completed jobs count. */
export function getCommissionTierForJobs(completedJobs: number): typeof TIERS[number] {
  for (const tier of TIERS) {
    if (completedJobs >= tier.minJobs && (tier.maxJobs === null || completedJobs <= tier.maxJobs)) {
      return tier
    }
  }
  return TIERS[TIERS.length - 1]
}

/** Calculate commission breakdown for a given amount and completed jobs count. */
export function calculateCommission(amount: number, completedJobs: number): {
  commissionRate: number
  commissionAmount: number
  workerAmount: number
  tier: CommissionTier
} {
  const tierConfig = getCommissionTierForJobs(completedJobs)
  const commissionAmount = Math.round(amount * tierConfig.rate * 100) / 100
  const workerAmount = Math.round((amount - commissionAmount) * 100) / 100
  return {
    commissionRate: tierConfig.rate,
    commissionAmount,
    workerAmount,
    tier: tierConfig.tier,
  }
}

/** Get the job posting fee for a given estimated job value. */
export function getJobPostingFee(estimatedValue: number): typeof JOB_POSTING_FEES[number] {
  for (const fee of JOB_POSTING_FEES) {
    if (
      estimatedValue >= fee.minValue &&
      (fee.maxValue === null || estimatedValue <= fee.maxValue)
    ) {
      return fee
    }
  }
  return JOB_POSTING_FEES[JOB_POSTING_FEES.length - 1]
}

// ─── Escrow CRUD ─────────────────────────────────────────────────────────────

/** Create an escrow payment record. */
export async function createEscrowRecord(
  data: Omit<EscrowPayment, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  if (!db) throw new Error('Firestore not available')
  const ref = await addDoc(collection(db, ESCROW_COL), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

/** Fetch a single escrow record by ID. */
export async function getEscrowById(id: string): Promise<EscrowPayment | null> {
  if (!db) return null
  const snap = await getDoc(doc(db, ESCROW_COL, id))
  if (!snap.exists()) return null
  return toEscrow(snap.id, snap.data() as Record<string, unknown>)
}

/** Fetch escrow record by Stripe PaymentIntent ID. */
export async function getEscrowByPaymentIntent(paymentIntentId: string): Promise<EscrowPayment | null> {
  if (!db) return null
  const snap = await getDocs(
    query(
      collection(db, ESCROW_COL),
      where('stripePaymentIntentId', '==', paymentIntentId),
      limit(1)
    )
  )
  if (snap.empty) return null
  return toEscrow(snap.docs[0].id, snap.docs[0].data() as Record<string, unknown>)
}

/** Fetch escrow records for a job. */
export async function getJobEscrow(jobId: string): Promise<EscrowPayment | null> {
  if (!db) return null
  const snap = await getDocs(
    query(
      collection(db, ESCROW_COL),
      where('jobId', '==', jobId),
      orderBy('createdAt', 'desc'),
      limit(1)
    )
  )
  if (snap.empty) return null
  return toEscrow(snap.docs[0].id, snap.docs[0].data() as Record<string, unknown>)
}

/** Fetch all escrow records for a worker, newest first. */
export async function getWorkerEscrows(workerId: string, pageSize = 50): Promise<EscrowPayment[]> {
  if (!db) return []
  const snap = await getDocs(
    query(
      collection(db, ESCROW_COL),
      where('workerId', '==', workerId),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    )
  )
  return snap.docs.map((d) => toEscrow(d.id, d.data() as Record<string, unknown>))
}

/** Fetch all escrow records for an employer, newest first. */
export async function getEmployerEscrows(employerId: string, pageSize = 50): Promise<EscrowPayment[]> {
  if (!db) return []
  const snap = await getDocs(
    query(
      collection(db, ESCROW_COL),
      where('employerId', '==', employerId),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    )
  )
  return snap.docs.map((d) => toEscrow(d.id, d.data() as Record<string, unknown>))
}

/** Update escrow status and optional extra fields. */
export async function updateEscrowStatus(
  escrowId: string,
  status: EscrowStatus,
  extra?: Partial<EscrowPayment>
): Promise<void> {
  if (!db) return
  await updateDoc(doc(db, ESCROW_COL, escrowId), {
    status,
    ...extra,
    updatedAt: serverTimestamp(),
  })
}

// ─── Job Posting Payment CRUD ─────────────────────────────────────────────────

/** Create a job posting payment record. */
export async function createJobPostingPaymentRecord(
  data: Omit<JobPostingPayment, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  if (!db) throw new Error('Firestore not available')
  const ref = await addDoc(collection(db, JOB_POSTING_COL), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

/** Fetch a job posting payment by Stripe checkout session ID. */
export async function getJobPostingPaymentBySession(
  sessionId: string
): Promise<JobPostingPayment | null> {
  if (!db) return null
  const snap = await getDocs(
    query(
      collection(db, JOB_POSTING_COL),
      where('stripeCheckoutSessionId', '==', sessionId),
      limit(1)
    )
  )
  if (snap.empty) return null
  return toJobPosting(snap.docs[0].id, snap.docs[0].data() as Record<string, unknown>)
}

/** Fetch job posting payments for an employer. */
export async function getEmployerJobPostingPayments(
  employerId: string,
  pageSize = 50
): Promise<JobPostingPayment[]> {
  if (!db) return []
  const snap = await getDocs(
    query(
      collection(db, JOB_POSTING_COL),
      where('employerId', '==', employerId),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    )
  )
  return snap.docs.map((d) => toJobPosting(d.id, d.data() as Record<string, unknown>))
}

/** Update a job posting payment record. */
export async function updateJobPostingPayment(
  id: string,
  updates: Partial<JobPostingPayment>
): Promise<void> {
  if (!db) return
  await updateDoc(doc(db, JOB_POSTING_COL, id), {
    ...updates,
    updatedAt: serverTimestamp(),
  })
}

// ─── Worker Earnings Summary ──────────────────────────────────────────────────

/** Calculate the earnings summary for a worker from escrow records. */
export async function getWorkerEarningsSummary(
  workerId: string,
  completedJobs: number
): Promise<WorkerEarningsSummary> {
  const escrows = await getWorkerEscrows(workerId, 200)

  const totalEarned = escrows
    .filter((e) => e.status === 'released')
    .reduce((sum, e) => sum + e.workerAmount, 0)

  const pendingEscrow = escrows
    .filter((e) => e.status === 'held' || e.status === 'pending')
    .reduce((sum, e) => sum + e.amount, 0)

  const tierConfig = getCommissionTierForJobs(completedJobs)
  const nextTierConfig = TIERS.find((t) => t.tier === tierConfig.nextTier) ?? null

  const jobsToNextTier =
    nextTierConfig !== null ? nextTierConfig.minJobs - completedJobs : null

  return {
    workerId,
    totalEarned: Math.round(totalEarned * 100) / 100,
    pendingEscrow: Math.round(pendingEscrow * 100) / 100,
    commissionTier: tierConfig.tier,
    commissionRate: tierConfig.rate,
    completedJobs,
    jobsToNextTier,
    nextTierRate: nextTierConfig ? nextTierConfig.rate : null,
    currency: 'nzd',
  }
}

/** Build the earnings transaction history for a worker. */
export async function getWorkerEarningsTransactions(workerId: string): Promise<EarningsTransaction[]> {
  const escrows = await getWorkerEscrows(workerId, 100)
  return escrows.map((e) => ({
    id: e.id,
    jobId: e.jobId,
    jobTitle: '',   // caller can enrich this from the job document
    employerName: '',
    grossAmount: e.amount,
    commissionAmount: e.commissionAmount,
    commissionRate: e.commissionRate,
    netAmount: e.workerAmount,
    status: e.status,
    createdAt: e.createdAt,
    releasedAt: e.releasedAt,
  }))
}
