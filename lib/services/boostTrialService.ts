/**
 * Boost Trial Service
 *
 * Manages the worker "Boosts" balance and the "Try It" trial-unlock mechanic.
 * Workers spend Boosts to temporarily unlock Pro/Elite features for a limited
 * window. Trial status is stored as an `activeTrials` array on the worker's
 * Firestore profile document.
 */
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  increment,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { ActiveTrial, TrialType } from '@/types'
import { notify } from '@/lib/notifications/service'

// ─── Trial catalogue ──────────────────────────────────────────────────────────

export interface TrialDefinition {
  type: TrialType
  label: string
  boostCost: number
  durationHours: number
  description: string
}

export interface BoostMutationOptions {
  reason?: string
  source?: 'achievement' | 'leaderboard' | 'trial' | 'manual'
  jobId?: string
  badgeId?: string
  achievementId?: string
  transactionId?: string
}

export const TRIAL_DEFINITIONS: TrialDefinition[] = [
  {
    type: 'early_job_alerts',
    label: 'Early Job Alerts',
    boostCost: 20,
    durationHours: 24,
    description: '24-hour trial of Early Job Alerts (30 min head start on new jobs)',
  },
  {
    type: 'featured_profile',
    label: 'Featured Profile',
    boostCost: 30,
    durationHours: 48,
    description: '48-hour trial of Featured Profile placement',
  },
  {
    type: 'commission_8pct',
    label: 'Flat 8% Commission Rate',
    boostCost: 15,
    durationHours: 24,
    description: '24-hour trial of a flat 8% commission rate on completed jobs',
  },
]

const MILLISECONDS_PER_HOUR = 60 * 60 * 1000

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns true if a trial has not yet reached its expiresAt time. */
function isTrialActive(trial: ActiveTrial): boolean {
  return new Date(trial.expiresAt) > new Date()
}

/** Returns the human-readable label for a trial type. */
function getTrialLabel(type: TrialType): string {
  return TRIAL_DEFINITIONS.find((d) => d.type === type)?.label ?? type
}

function buildBoostTransactionData(
  userId: string,
  amount: number,
  type: 'award' | 'spend',
  opts: BoostMutationOptions,
  createdAt: string,
) {
  return {
    userId,
    amount,
    type,
    reason: opts.reason ?? (type === 'award' ? 'Boosts awarded' : 'Boosts spent'),
    createdAt,
    ...(opts.jobId ? { jobId: opts.jobId } : {}),
    ...(opts.badgeId ? { badgeId: opts.badgeId } : {}),
    ...(opts.achievementId ? { achievementId: opts.achievementId } : {}),
    ...(opts.source ? { source: opts.source } : {}),
  }
}

async function getAdminBoostHelpers() {
  if (typeof window !== 'undefined') return null

  const [{ adminDb }, { FieldValue }] = await Promise.all([
    import('@/lib/firebase-admin'),
    import('firebase-admin/firestore'),
  ])

  return { adminDb, FieldValue }
}

async function recordClientBoostTransaction(
  userId: string,
  amount: number,
  type: 'award' | 'spend',
  opts: BoostMutationOptions,
  createdAt: string,
) {
  if (!db) return

  const transactionData = buildBoostTransactionData(userId, amount, type, opts, createdAt)
  const items = collection(doc(db, 'boostTransactions', userId), 'items')

  if (opts.transactionId) {
    await setDoc(doc(items, opts.transactionId), transactionData, { merge: true })
    return
  }

  await addDoc(items, transactionData)
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns all non-expired trials currently stored on the worker's profile.
 * This is a pure in-memory filter; it does NOT write anything to Firestore.
 */
export function filterActiveTrials(trials: ActiveTrial[] | undefined): ActiveTrial[] {
  if (!trials) return []
  return trials.filter(isTrialActive)
}

/**
 * Checks whether the worker has a specific trial that is currently active.
 */
export function hasActiveTrial(
  trials: ActiveTrial[] | undefined,
  type: TrialType,
): boolean {
  return filterActiveTrials(trials).some((t) => t.type === type)
}

/**
 * Awards the given number of Boosts to a worker's profile.
 * Returns true when the award was applied, false when an idempotency guard skipped it.
 */
export async function awardBoosts(
  userId: string,
  amount: number,
  opts: BoostMutationOptions = {},
): Promise<boolean> {
  if (amount <= 0) {
    throw new Error(`Boost awards must be greater than zero. Received: ${amount}`)
  }

  const createdAt = new Date().toISOString()

  if (db) {
    const ref = doc(db, 'users', userId)
    const payload: Record<string, unknown> = {
      boosts: increment(amount),
      updatedAt: serverTimestamp(),
    }

    if (opts.achievementId) {
      payload.awardedAchievements = arrayUnion(opts.achievementId)
    }

    await updateDoc(ref, payload)
    await recordClientBoostTransaction(userId, amount, 'award', opts, createdAt)
    return true
  }

  const adminHelpers = await getAdminBoostHelpers()
  if (!adminHelpers?.adminDb) return false

  const { adminDb, FieldValue } = adminHelpers
  const userRef = adminDb.collection('users').doc(userId)
  const txRef = opts.transactionId
    ? adminDb.collection('boostTransactions').doc(userId).collection('items').doc(opts.transactionId)
    : adminDb.collection('boostTransactions').doc(userId).collection('items').doc()

  return adminDb.runTransaction(async (tx) => {
    const userSnap = await tx.get(userRef)
    const currentAchievements = Array.isArray(userSnap.data()?.awardedAchievements)
      ? userSnap.data()?.awardedAchievements as string[]
      : []

    if (opts.achievementId && currentAchievements.includes(opts.achievementId)) {
      return false
    }

    tx.set(userRef, {
      boosts: FieldValue.increment(amount),
      updatedAt: createdAt,
      ...(opts.achievementId
        ? { awardedAchievements: [...currentAchievements, opts.achievementId] }
        : {}),
    }, { merge: true })

    tx.set(txRef, buildBoostTransactionData(userId, amount, 'award', opts, createdAt))
    return true
  })
}

/**
 * Deducts the given number of Boosts from a worker's profile.
 * Throws if the worker has insufficient balance.
 */
export async function spendBoosts(
  userId: string,
  amount: number,
  opts: BoostMutationOptions = {},
): Promise<void> {
  if (amount <= 0) return

  const createdAt = new Date().toISOString()
  const spendOptions: BoostMutationOptions = {
    reason: opts.reason ?? 'Boosts spent on a feature trial',
    source: opts.source ?? 'trial',
    ...opts,
  }

  if (db) {
    const ref = doc(db, 'users', userId)
    const snap = await getDoc(ref)
    if (!snap.exists()) throw new Error('Worker profile not found')

    const currentBoosts: number = snap.data().boosts ?? 0
    if (currentBoosts < amount) {
      throw new Error(`Insufficient Boosts: have ${currentBoosts}, need ${amount}`)
    }

    await updateDoc(ref, {
      boosts: increment(-amount),
      updatedAt: serverTimestamp(),
    })
    await recordClientBoostTransaction(userId, -amount, 'spend', spendOptions, createdAt)
    return
  }

  const adminHelpers = await getAdminBoostHelpers()
  if (!adminHelpers?.adminDb) throw new Error('Firebase not configured')

  const { adminDb, FieldValue } = adminHelpers
  const userRef = adminDb.collection('users').doc(userId)
  const txRef = spendOptions.transactionId
    ? adminDb.collection('boostTransactions').doc(userId).collection('items').doc(spendOptions.transactionId)
    : adminDb.collection('boostTransactions').doc(userId).collection('items').doc()

  await adminDb.runTransaction(async (tx) => {
    const userSnap = await tx.get(userRef)
    if (!userSnap.exists) throw new Error('Worker profile not found')

    const currentBoosts: number = userSnap.data()?.boosts ?? 0
    if (currentBoosts < amount) {
      throw new Error(`Insufficient Boosts: have ${currentBoosts}, need ${amount}`)
    }

    tx.set(userRef, {
      boosts: FieldValue.increment(-amount),
      updatedAt: createdAt,
    }, { merge: true })
    tx.set(txRef, buildBoostTransactionData(userId, -amount, 'spend', spendOptions, createdAt))
  })
}

/**
 * Activates a trial for the worker by:
 * 1. Deducting the required Boosts.
 * 2. Appending the trial (with expiresAt) to the worker's `activeTrials` array.
 *
 * Returns the activated `ActiveTrial` record.
 */
export async function activateTrial(
  userId: string,
  type: TrialType,
): Promise<ActiveTrial> {
  const definition = TRIAL_DEFINITIONS.find((d) => d.type === type)
  if (!definition) throw new Error(`Unknown trial type: ${type}`)

  await spendBoosts(userId, definition.boostCost, {
    reason: `${definition.label} trial activated`,
    source: 'trial',
    transactionId: `trial-${type}-${Date.now()}`,
  })

  const now = new Date()
  const expiresAt = new Date(now.getTime() + definition.durationHours * MILLISECONDS_PER_HOUR)

  const trial: ActiveTrial = {
    type,
    activatedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  }

  if (!db) throw new Error('Firebase not configured')
  const ref = doc(db, 'users', userId)
  await updateDoc(ref, {
    activeTrials: arrayUnion(trial),
    updatedAt: serverTimestamp(),
  })

  return trial
}

/**
 * Sends a `trial_expired` in-app notification prompting the worker to subscribe.
 * Call this from a scheduled job (e.g. a Cloud Function) once a trial's
 * expiresAt timestamp has lapsed. Expired trials are excluded from benefit
 * checks automatically via `filterActiveTrials` — no Firestore cleanup needed.
 */
export async function notifyTrialExpired(userId: string, type: TrialType): Promise<void> {
  await notify.trialExpired(userId, getTrialLabel(type))
}
