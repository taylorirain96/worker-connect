/**
 * Boost Trial Service
 *
 * Manages the worker "Boosts" balance and the "Try It" trial-unlock mechanic.
 * Workers spend Boosts to temporarily unlock Pro/Elite features for a limited
 * window. Trial status is stored as an `activeTrials` array on the worker's
 * Firestore profile document.
 */
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  increment,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { ActiveTrial, TrialType, UserProfile } from '@/types'
import { notify } from '@/lib/notifications/service'

// ─── Trial catalogue ──────────────────────────────────────────────────────────

export interface TrialDefinition {
  type: TrialType
  label: string
  boostCost: number
  durationHours: number
  description: string
}

export interface TrialAvailability {
  definition: TrialDefinition
  available: boolean
  reason?: string
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
  {
    type: 'commission_discount_stack',
    label: 'Extra 2% Commission Discount',
    boostCost: 20,
    durationHours: 24,
    description: '24-hour trial of an extra 2% off your current commission rate',
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

function getWorkerSubscriptionTier(profile: UserProfile | null | undefined): 'free' | 'pro' | 'elite' {
  if (profile?.workerSubscriptionTier === 'elite') return 'elite'
  if (profile?.workerSubscriptionTier === 'pro') return 'pro'
  return 'free'
}

export function getTrialBlockReason(
  profile: UserProfile | null | undefined,
  type: TrialType
): string | null {
  const tier = getWorkerSubscriptionTier(profile)

  if (type === 'featured_profile' && tier === 'elite') {
    return 'Elite Worker already includes Featured Profile placement.'
  }

  if (type === 'commission_8pct') {
    if (tier === 'elite') {
      return 'Elite Worker already includes a better 6% commission rate.'
    }

    if (tier === 'pro') {
      return 'Pro Worker already includes a flat 8% commission rate.'
    }
  }

  return null
}

export function getTrialAvailability(
  profile: UserProfile | null | undefined
): TrialAvailability[] {
  return TRIAL_DEFINITIONS.map((definition) => {
    const reason = getTrialBlockReason(profile, definition.type)

    return {
      definition,
      available: reason === null,
      reason: reason ?? undefined,
    }
  })
}

export function getAvailableTrialDefinitions(
  profile: UserProfile | null | undefined
): TrialDefinition[] {
  return getTrialAvailability(profile)
    .filter((trial) => trial.available)
    .map((trial) => trial.definition)
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
  type: TrialType
): boolean {
  return filterActiveTrials(trials).some((t) => t.type === type)
}

/**
 * Awards the given number of Boosts to a worker's profile.
 */
export async function awardBoosts(userId: string, amount: number): Promise<void> {
  if (!db) return
  const ref = doc(db, 'users', userId)
  await updateDoc(ref, {
    boosts: increment(amount),
    updatedAt: serverTimestamp(),
  })
}

/**
 * Deducts the given number of Boosts from a worker's profile.
 * Throws if the worker has insufficient balance.
 */
export async function spendBoosts(userId: string, amount: number): Promise<void> {
  if (!db) throw new Error('Firebase not configured')
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
  type: TrialType
): Promise<ActiveTrial> {
  const definition = TRIAL_DEFINITIONS.find((d) => d.type === type)
  if (!definition) throw new Error(`Unknown trial type: ${type}`)

  if (!db) throw new Error('Firebase not configured')
  const ref = doc(db, 'users', userId)
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error('Worker profile not found')

  const profile = snap.data() as UserProfile
  const unavailableReason = getTrialBlockReason(profile, type)
  if (unavailableReason) throw new Error(unavailableReason)

  await spendBoosts(userId, definition.boostCost)

  const now = new Date()
  const expiresAt = new Date(now.getTime() + definition.durationHours * MILLISECONDS_PER_HOUR)

  const trial: ActiveTrial = {
    type,
    activatedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  }

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
