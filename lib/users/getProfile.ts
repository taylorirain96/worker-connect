import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { UserProfile } from '@/types'

/**
 * Reads the `users/{uid}` document from Firestore.
 * Returns the UserProfile or null if not found.
 * Returns null if Firebase is not configured.
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!db) return null
  try {
    const snap = await getDoc(doc(db, 'users', uid))
    if (!snap.exists()) return null
    return snap.data() as UserProfile
  } catch {
    return null
  }
}
