import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type {
  VerificationProfile,
  VerificationType,
  VerificationStatus,
  CertificationItem,
} from '@/types/reputation'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function defaultVerificationItem() {
  return { status: 'unverified' as VerificationStatus, verified: false }
}

function countVerified(profile: VerificationProfile): number {
  let count = 0
  if (profile.governmentId.verified) count++
  if (profile.backgroundCheck.verified) count++
  if (profile.insurance.verified) count++
  if (profile.certifications.length > 0) count++
  if (profile.bbbRating.verified) count++
  return count
}

// ─── Firestore Accessors ──────────────────────────────────────────────────────

export async function getVerificationProfile(
  userId: string
): Promise<VerificationProfile | null> {
  if (!db) return null
  const ref = doc(db, 'verifications', userId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  const data = snap.data()
  const profile: VerificationProfile = {
    userId,
    governmentId: data.governmentId ?? defaultVerificationItem(),
    backgroundCheck: data.backgroundCheck ?? defaultVerificationItem(),
    insurance: data.insurance ?? defaultVerificationItem(),
    certifications: (data.certifications as CertificationItem[]) ?? [],
    bbbRating: data.bbbRating ?? defaultVerificationItem(),
    verificationLevel: 0,
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
  }
  profile.verificationLevel = countVerified(profile)
  return profile
}

export async function startVerification(
  userId: string,
  type: VerificationType
): Promise<void> {
  if (!db) return
  const ref = doc(db, 'verifications', userId)
  const snap = await getDoc(ref)

  const pending = { status: 'pending' as VerificationStatus, verified: false }

  if (snap.exists()) {
    await updateDoc(ref, {
      [type]: pending,
      updatedAt: serverTimestamp(),
    })
  } else {
    await setDoc(ref, {
      governmentId: defaultVerificationItem(),
      backgroundCheck: defaultVerificationItem(),
      insurance: defaultVerificationItem(),
      certifications: [],
      bbbRating: defaultVerificationItem(),
      [type]: pending,
      updatedAt: serverTimestamp(),
    })
  }
}

export async function confirmVerification(
  userId: string,
  type: VerificationType,
  extra: Record<string, unknown> = {}
): Promise<void> {
  if (!db) return
  const ref = doc(db, 'verifications', userId)
  const verified = {
    status: 'verified' as VerificationStatus,
    verified: true,
    verifiedAt: new Date().toISOString(),
    ...extra,
  }
  await updateDoc(ref, {
    [type]: verified,
    updatedAt: serverTimestamp(),
  })
}

export async function addCertification(
  userId: string,
  certification: Omit<CertificationItem, 'verifiedAt'>
): Promise<void> {
  if (!db) return
  const ref = doc(db, 'verifications', userId)
  const snap = await getDoc(ref)
  const newCert: CertificationItem = {
    ...certification,
    verifiedAt: new Date().toISOString(),
  }
  if (snap.exists()) {
    const existing: CertificationItem[] = snap.data().certifications ?? []
    await updateDoc(ref, {
      certifications: [...existing, newCert],
      updatedAt: serverTimestamp(),
    })
  } else {
    await setDoc(ref, {
      governmentId: defaultVerificationItem(),
      backgroundCheck: defaultVerificationItem(),
      insurance: defaultVerificationItem(),
      certifications: [newCert],
      bbbRating: defaultVerificationItem(),
      updatedAt: serverTimestamp(),
    })
  }
}
