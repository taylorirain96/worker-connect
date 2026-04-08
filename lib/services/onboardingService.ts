/**
 * Onboarding Service — Stripe Connect, Verification, and Profile Completion helpers.
 * Server-side operations use firebase-admin; client-side uses the firebase SDK.
 */
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import Stripe from 'stripe'
import type {
  OnboardingProgress,
  WorkerVerificationRecord,
  StripeConnectStatus,
  OnboardingChecklistItem,
} from '@/types'

// ─── Collection names ────────────────────────────────────────────────────────

const USERS_COL = 'users'
const VERIFICATIONS_COL = 'workerVerifications'
const ONBOARDING_COL = 'onboardingProgress'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    console.warn('STRIPE_SECRET_KEY not configured')
    return null
  }
  return new Stripe(key)
}

function nowISO(): string {
  return new Date().toISOString()
}

function generateToken(): string {
  return `tok_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

// ─── Stripe Connect ──────────────────────────────────────────────────────────

export async function initializeStripeConnect(
  workerId: string,
  email: string,
  country: string
): Promise<{ accountId: string; link: string }> {
  const stripe = getStripe()

  if (!stripe) {
    // Mock fallback
    const accountId = `acct_mock_${workerId}`
    await updateWorkerStripeAccount(workerId, accountId)
    return { accountId, link: `/workers/onboarding?mock=true&workerId=${workerId}` }
  }

  const account = await stripe.accounts.create({
    type: 'express',
    email,
    country,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  })

  await updateWorkerStripeAccount(workerId, account.id)

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${baseUrl}/workers/onboarding?step=stripe&refresh=true`,
    return_url: `${baseUrl}/workers/onboarding?step=stripe&success=true`,
    type: 'account_onboarding',
  })

  return { accountId: account.id, link: accountLink.url }
}

export async function getStripeConnectStatus(workerId: string): Promise<StripeConnectStatus> {
  const stripe = getStripe()
  const userSnap = await adminDb.collection(USERS_COL).doc(workerId).get()
  const stripeAccountId = userSnap.data()?.stripeAccountId as string | undefined

  if (!stripeAccountId) {
    return {
      accountId: '',
      status: 'incomplete',
      chargesEnabled: false,
      payoutsEnabled: false,
    }
  }

  if (!stripe) {
    // Mock fallback when Stripe not configured
    return {
      accountId: stripeAccountId,
      status: 'pending_review',
      chargesEnabled: false,
      payoutsEnabled: false,
    }
  }

  const account = await stripe.accounts.retrieve(stripeAccountId)
  let status: StripeConnectStatus['status'] = 'incomplete'
  if (account.charges_enabled && account.payouts_enabled) {
    status = 'active'
  } else if (account.details_submitted) {
    status = 'pending_review'
  }

  return {
    accountId: stripeAccountId,
    status,
    chargesEnabled: account.charges_enabled ?? false,
    payoutsEnabled: account.payouts_enabled ?? false,
    requirements: {
      currently_due: (account.requirements?.currently_due ?? []) as string[],
      eventually_due: (account.requirements?.eventually_due ?? []) as string[],
      past_due: (account.requirements?.past_due ?? []) as string[],
    },
  }
}

export async function updateWorkerStripeAccount(
  workerId: string,
  stripeAccountId: string
): Promise<void> {
  await adminDb
    .collection(USERS_COL)
    .doc(workerId)
    .set({ stripeAccountId, updatedAt: FieldValue.serverTimestamp() }, { merge: true })
}

export async function refreshStripeConnectStatus(workerId: string): Promise<StripeConnectStatus> {
  const status = await getStripeConnectStatus(workerId)
  // Persist synced status back to Firestore
  await adminDb
    .collection(USERS_COL)
    .doc(workerId)
    .set(
      {
        stripeStatus: status.status,
        stripeChargesEnabled: status.chargesEnabled,
        stripePayoutsEnabled: status.payoutsEnabled,
        stripeStatusSyncedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    )
  return status
}

// ─── Verification ────────────────────────────────────────────────────────────

export async function createVerification(
  workerId: string,
  type: WorkerVerificationRecord['type']
): Promise<string> {
  const now = nowISO()
  const record: Omit<WorkerVerificationRecord, 'id'> = {
    workerId,
    type,
    status: 'pending',
    token: generateToken(),
    createdAt: now,
    updatedAt: now,
  }

  const ref = await adminDb.collection(VERIFICATIONS_COL).add({
    ...record,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })

  console.info(`[onboarding] verification created: ${ref.id} type=${type} worker=${workerId}`)
  return ref.id
}

export async function submitVerificationDocument(
  verificationId: string,
  documentUrl: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  const now = nowISO()
  await adminDb.collection(VERIFICATIONS_COL).doc(verificationId).update({
    documentUrl,
    metadata: metadata ?? {},
    status: 'submitted',
    submittedAt: now,
    updatedAt: FieldValue.serverTimestamp(),
  })
  console.info(`[onboarding] verification submitted: ${verificationId}`)
}

export async function getWorkerVerifications(
  workerId: string
): Promise<WorkerVerificationRecord[]> {
  const snap = await adminDb
    .collection(VERIFICATIONS_COL)
    .where('workerId', '==', workerId)
    .orderBy('createdAt', 'desc')
    .get()

  return snap.docs.map((d) => {
    const data = d.data()
    return {
      ...data,
      id: d.id,
      createdAt: data.createdAt?.toDate?.()?.toISOString() ?? data.createdAt ?? nowISO(),
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? data.updatedAt ?? nowISO(),
    } as WorkerVerificationRecord
  })
}

export async function approveVerification(
  verificationId: string,
  notes: string
): Promise<void> {
  const now = nowISO()
  const snap = await adminDb.collection(VERIFICATIONS_COL).doc(verificationId).get()
  if (!snap.exists) throw new Error('Verification not found')

  await adminDb.collection(VERIFICATIONS_COL).doc(verificationId).update({
    status: 'approved',
    notes,
    reviewedAt: now,
    approvedAt: now,
    updatedAt: FieldValue.serverTimestamp(),
  })

  const workerId = snap.data()?.workerId as string | undefined
  if (workerId) {
    // Recalculate approval count on worker profile
    const approvedSnap = await adminDb
      .collection(VERIFICATIONS_COL)
      .where('workerId', '==', workerId)
      .where('status', '==', 'approved')
      .get()
    await adminDb
      .collection(USERS_COL)
      .doc(workerId)
      .set({ verificationsApproved: approvedSnap.size, updatedAt: FieldValue.serverTimestamp() }, { merge: true })
  }

  console.info(`[onboarding] verification approved: ${verificationId}`)
}

export async function rejectVerification(
  verificationId: string,
  reason: string
): Promise<void> {
  const now = nowISO()
  await adminDb.collection(VERIFICATIONS_COL).doc(verificationId).update({
    status: 'rejected',
    rejectionReason: reason,
    reviewedAt: now,
    updatedAt: FieldValue.serverTimestamp(),
  })
  console.info(`[onboarding] verification rejected: ${verificationId}`)
}

// ─── Onboarding Progress ─────────────────────────────────────────────────────

const REQUIRED_FIELDS: Array<keyof OnboardingProgress['requiredFields']> = [
  'name',
  'email',
  'phone',
  'location',
  'skills',
  'hourlyRate',
  'bio',
  'profilePhoto',
]

function calculateCompletion(requiredFields: OnboardingProgress['requiredFields']): number {
  const completed = REQUIRED_FIELDS.filter((f) => requiredFields[f]).length
  return Math.round((completed / REQUIRED_FIELDS.length) * 100)
}

export async function getOnboardingProgress(
  workerId: string
): Promise<{ completion: number; items: OnboardingProgress }> {
  // Check Firestore onboardingProgress first
  const progressSnap = await adminDb.collection(ONBOARDING_COL).doc(workerId).get()
  let savedProgress: Partial<OnboardingProgress['requiredFields']> = {}
  if (progressSnap.exists) {
    savedProgress = (progressSnap.data()?.requiredFields as Partial<OnboardingProgress['requiredFields']>) ?? {}
  }

  // Also check user profile to sync
  const userSnap = await adminDb.collection(USERS_COL).doc(workerId).get()
  const user = userSnap.data() ?? {}

  const requiredFields: OnboardingProgress['requiredFields'] = {
    name: !!(savedProgress.name || user.displayName),
    email: !!(savedProgress.email || user.email),
    phone: !!(savedProgress.phone || user.phone),
    location: !!(savedProgress.location || user.location),
    skills: !!(savedProgress.skills || (Array.isArray(user.skills) && user.skills.length > 0)),
    hourlyRate: !!(savedProgress.hourlyRate || (typeof user.hourlyRate === 'number' && user.hourlyRate > 0)),
    bio: !!(savedProgress.bio || user.bio),
    profilePhoto: !!(savedProgress.profilePhoto || user.photoURL),
  }

  const completion = calculateCompletion(requiredFields)
  const progress: OnboardingProgress = {
    workerId,
    completion,
    requiredFields,
    completedAt: progressSnap.data()?.completedAt,
  }

  return { completion, items: progress }
}

export async function completeOnboardingStep(
  workerId: string,
  step: string,
  data: Record<string, unknown>
): Promise<number> {
  const now = nowISO()

  // Update user profile with provided data
  const profileUpdate: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() }
  if (data.name) profileUpdate.displayName = data.name
  if (data.email) profileUpdate.email = data.email
  if (data.phone) profileUpdate.phone = data.phone
  if (data.location) profileUpdate.location = data.location
  if (data.skills) profileUpdate.skills = data.skills
  if (data.hourlyRate) profileUpdate.hourlyRate = data.hourlyRate
  if (data.bio) profileUpdate.bio = data.bio
  if (data.profilePhoto) profileUpdate.photoURL = data.profilePhoto

  if (Object.keys(profileUpdate).length > 1) {
    await adminDb.collection(USERS_COL).doc(workerId).set(profileUpdate, { merge: true })
  }

  // Persist step completion to onboardingProgress
  const stepFieldMap: Record<string, keyof OnboardingProgress['requiredFields']> = {
    profile_info: 'name',
    contact: 'phone',
    location: 'location',
    skills: 'skills',
    hourly_rate: 'hourlyRate',
    bio: 'bio',
    profile_photo: 'profilePhoto',
  }

  const fieldKey = stepFieldMap[step]
  const progressUpdate: Record<string, unknown> = {
    workerId,
    [`requiredFields.${fieldKey ?? step}`]: true,
    lastStepCompleted: step,
    lastStepCompletedAt: now,
    updatedAt: FieldValue.serverTimestamp(),
  }

  await adminDb.collection(ONBOARDING_COL).doc(workerId).set(progressUpdate, { merge: true })

  // Recalculate and persist completion
  const { completion } = await getOnboardingProgress(workerId)

  if (completion === 100) {
    await markOnboardingComplete(workerId)
  }

  console.info(`[onboarding] step completed: ${step} worker=${workerId} completion=${completion}%`)
  return completion
}

export async function getOnboardingChecklist(
  workerId: string
): Promise<OnboardingChecklistItem[]> {
  const { items } = await getOnboardingProgress(workerId)

  // Check Stripe Connect
  let stripeConnected = false
  try {
    const stripeStatus = await getStripeConnectStatus(workerId)
    stripeConnected = stripeStatus.accountId !== '' && stripeStatus.status !== 'incomplete'
  } catch {
    stripeConnected = false
  }

  // Check verifications
  let hasVerification = false
  try {
    const verifications = await getWorkerVerifications(workerId)
    hasVerification = verifications.some(
      (v) => v.status === 'approved' || v.status === 'submitted'
    )
  } catch {
    hasVerification = false
  }

  const checklist: OnboardingChecklistItem[] = [
    {
      id: 'stripe_connect',
      label: 'Connect Payment Account',
      description: 'Link your Stripe account to receive payments',
      completed: stripeConnected,
      required: true,
      order: 1,
    },
    {
      id: 'id_verification',
      label: 'ID Verification',
      description: 'Verify your government-issued ID',
      completed: hasVerification,
      required: true,
      order: 2,
    },
    {
      id: 'profile_photo',
      label: 'Profile Photo',
      description: 'Upload a professional profile photo',
      completed: items.requiredFields.profilePhoto,
      required: true,
      order: 3,
    },
    {
      id: 'skills',
      label: 'Skills',
      description: 'Add your professional skills',
      completed: items.requiredFields.skills,
      required: true,
      order: 4,
    },
    {
      id: 'hourly_rate',
      label: 'Hourly Rate',
      description: 'Set your hourly rate',
      completed: items.requiredFields.hourlyRate,
      required: true,
      order: 5,
    },
    {
      id: 'bio',
      label: 'Bio',
      description: 'Write a short professional bio',
      completed: items.requiredFields.bio,
      required: true,
      order: 6,
    },
    {
      id: 'location',
      label: 'Location',
      description: 'Add your service area',
      completed: items.requiredFields.location,
      required: true,
      order: 7,
    },
  ]

  return checklist
}

export async function markOnboardingComplete(workerId: string): Promise<void> {
  const now = nowISO()
  await adminDb.collection(ONBOARDING_COL).doc(workerId).set(
    {
      completedAt: now,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  )
  await adminDb.collection(USERS_COL).doc(workerId).set(
    {
      onboardingCompletedAt: now,
      profileComplete: true,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  )
  console.info(`[onboarding] onboarding complete: worker=${workerId}`)
}
