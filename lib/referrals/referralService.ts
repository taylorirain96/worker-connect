/**
 * Client-side Firestore operations for the referral system.
 * Server-side operations (admin SDK) live in the API routes.
 */
import type { Referral } from '@/types'
import { generateReferralCode } from './referralLogic'

/**
 * Ensures the current user has a stable referral code stored in Firestore.
 * Returns the existing code if already set, otherwise generates and saves one.
 */
export async function ensureReferralCode(userId: string): Promise<string> {
  const { doc, getDoc, updateDoc } = await import('firebase/firestore')
  const { db } = await import('@/lib/firebase')
  if (!db) return generateReferralCode(userId)

  const userRef = doc(db, 'users', userId)
  const snap = await getDoc(userRef)
  if (snap.exists()) {
    const data = snap.data()
    if (data.referralCode) return data.referralCode as string
  }

  // Generate a new code and persist it
  const code = generateReferralCode(userId)
  await updateDoc(userRef, { referralCode: code })
  return code
}

/**
 * Fetches all referrals for a given referrer from the API.
 */
export async function fetchReferrals(userId: string): Promise<Referral[]> {
  const res = await fetch(`/api/referrals?userId=${encodeURIComponent(userId)}`)
  if (!res.ok) return []
  const data = await res.json()
  return (data.referrals ?? []) as Referral[]
}

/**
 * Records a new referral after a user signs up via a referral link.
 * Called client-side from the register page.
 * Throws if the API call fails.
 */
export async function recordReferral(params: {
  referralCode: string
  referredUserId: string
  referredEmail: string
  referredName: string
}): Promise<void> {
  const res = await fetch('/api/referrals/record', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error((data as { error?: string }).error ?? 'Failed to record referral')
  }
}
