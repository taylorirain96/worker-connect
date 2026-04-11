/**
 * Simplified in-app notification helpers for Lot 6.
 * These wrap the lower-level firebase.ts functions with AppNotification semantics.
 */
import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  writeBatch,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { AppNotification } from '@/types'

function tsToISO(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString()
  if (typeof value === 'string') return value
  return new Date().toISOString()
}

function docToAppNotification(id: string, data: Record<string, unknown>): AppNotification {
  return {
    id,
    userId: (data.userId as string) ?? '',
    type: (data.type as AppNotification['type']) ?? 'general',
    title: (data.title as string) ?? '',
    message: (data.message as string) ?? '',
    read: (data.read as boolean) ?? false,
    link: data.link as string | undefined,
    createdAt: tsToISO(data.createdAt),
    relatedJobId: data.relatedJobId as string | undefined,
    relatedApplicationId: data.relatedApplicationId as string | undefined,
  }
}

/**
 * Create a notification for a user.
 */
export async function createNotification(
  userId: string,
  notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>
): Promise<void> {
  if (!db) return
  await addDoc(collection(db, 'notifications'), {
    ...notification,
    userId,
    read: false,
    createdAt: serverTimestamp(),
  })
}

/**
 * Get all notifications for a user (ordered by createdAt desc, limit 20).
 */
export async function getNotifications(userId: string): Promise<AppNotification[]> {
  if (!db) return []
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(20)
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map((d) => docToAppNotification(d.id, d.data()))
  } catch {
    return []
  }
}

/**
 * Mark a single notification as read.
 */
export async function markAsRead(notificationId: string): Promise<void> {
  if (!db) return
  await updateDoc(doc(db, 'notifications', notificationId), { read: true })
}

/**
 * Mark all notifications as read for a user.
 */
export async function markAllAsRead(userId: string): Promise<void> {
  if (!db) return
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    where('read', '==', false)
  )
  const snapshot = await getDocs(q)
  const batch = writeBatch(db)
  snapshot.docs.forEach((d) => batch.update(d.ref, { read: true }))
  await batch.commit()
}

/**
 * Get unread count for a user.
 */
export async function getUnreadCount(userId: string): Promise<number> {
  if (!db) return 0
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false)
    )
    const snapshot = await getDocs(q)
    return snapshot.size
  } catch {
    return 0
  }
}

/**
 * Real-time listener for unread count.
 * Returns an unsubscribe function.
 */
export function onUnreadCountChange(
  userId: string,
  callback: (count: number) => void
): () => void {
  if (!db) return () => {}
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    where('read', '==', false)
  )
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.size)
  })
}
