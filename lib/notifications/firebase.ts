/**
 * Firestore queries for the Advanced Notifications System.
 */
import {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  updateDoc,
  writeBatch,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  serverTimestamp,
  Timestamp,
  startAfter,
  type DocumentData,
  type Unsubscribe,
  type QueryDocumentSnapshot,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type {
  Notification,
  NotificationPreferences,
  NotificationTemplate,
  AdminNotificationRequest,
  NotificationCategory,
} from '@/types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function tsToISO(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString()
  if (typeof value === 'string') return value
  return new Date().toISOString()
}

function docToNotification(id: string, data: DocumentData): Notification {
  return {
    ...data,
    id,
    createdAt: tsToISO(data.createdAt),
    readAt: data.readAt ? tsToISO(data.readAt) : undefined,
  } as Notification
}

// ─── Notification CRUD ────────────────────────────────────────────────────────

export async function createNotification(
  notification: Omit<Notification, 'id' | 'createdAt'>
): Promise<string> {
  if (!db) throw new Error('Firestore not initialized')
  const ref = collection(db, 'notifications')
  const docRef = await addDoc(ref, { ...notification, createdAt: serverTimestamp() })
  return docRef.id
}

export async function getNotifications(
  userId: string,
  pageSize = 20,
  lastDoc?: QueryDocumentSnapshot
): Promise<{ notifications: Notification[]; lastDoc: QueryDocumentSnapshot | null }> {
  if (!db) return { notifications: [], lastDoc: null }
  const ref = collection(db, 'notifications')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const constraints: any[] = [
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(pageSize),
  ]
  if (lastDoc) constraints.push(startAfter(lastDoc))
  const q = query(ref, ...constraints)
  const snapshot = await getDocs(q)
  return {
    notifications: snapshot.docs.map((d) => docToNotification(d.id, d.data())),
    lastDoc: snapshot.docs[snapshot.docs.length - 1] ?? null,
  }
}

export async function getNotificationsByCategory(
  userId: string,
  category: NotificationCategory
): Promise<Notification[]> {
  if (!db) return []
  const ref = collection(db, 'notifications')
  const q = query(
    ref,
    where('userId', '==', userId),
    where('category', '==', category),
    orderBy('createdAt', 'desc'),
    limit(50)
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => docToNotification(d.id, d.data()))
}

export function subscribeToNotifications(
  userId: string,
  onChange: (notifications: Notification[]) => void,
  pageSize = 30
): Unsubscribe {
  if (!db) return () => {}
  const ref = collection(db, 'notifications')
  const q = query(
    ref,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  )
  return onSnapshot(q, (snapshot) => {
    onChange(snapshot.docs.map((d) => docToNotification(d.id, d.data())))
  })
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  if (!db) throw new Error('Firestore not initialized')
  const ref = doc(db, 'notifications', notificationId)
  await updateDoc(ref, { read: true, readAt: serverTimestamp() })
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  if (!db) throw new Error('Firestore not initialized')
  const ref = collection(db, 'notifications')
  const q = query(ref, where('userId', '==', userId), where('read', '==', false))
  const snapshot = await getDocs(q)
  const batch = writeBatch(db)
  snapshot.docs.forEach((d) =>
    batch.update(d.ref, { read: true, readAt: serverTimestamp() })
  )
  await batch.commit()
}

export async function deleteNotification(notificationId: string): Promise<void> {
  if (!db) throw new Error('Firestore not initialized')
  const ref = doc(db, 'notifications', notificationId)
  await updateDoc(ref, { deleted: true })
}

export async function clearAllNotifications(userId: string): Promise<void> {
  if (!db) throw new Error('Firestore not initialized')
  const ref = collection(db, 'notifications')
  const q = query(ref, where('userId', '==', userId))
  const snapshot = await getDocs(q)
  const batch = writeBatch(db)
  snapshot.docs.forEach((d) => batch.delete(d.ref))
  await batch.commit()
}

// ─── Notification Preferences ─────────────────────────────────────────────────

export const DEFAULT_PREFERENCES: Omit<NotificationPreferences, 'userId' | 'updatedAt'> = {
  channels: {
    push: true,
    email: true,
    sms: false,
    in_app: true,
  },
  categories: {
    jobs: { push: true, email: true, sms: false, frequency: 'instant' },
    messages: { push: true, email: true, sms: false, frequency: 'instant' },
    payments: { push: true, email: true, sms: true, frequency: 'instant' },
    reviews: { push: true, email: true, sms: false, frequency: 'instant' },
    verification: { push: true, email: true, sms: false, frequency: 'instant' },
    system: { push: true, email: true, sms: false, frequency: 'instant' },
    gamification: { push: true, email: false, sms: false, frequency: 'instant' },
  },
  quietHours: {
    enabled: false,
    startTime: '22:00',
    endTime: '08:00',
    timezone: 'America/New_York',
  },
}

export async function getNotificationPreferences(
  userId: string
): Promise<NotificationPreferences> {
  if (!db) {
    return { userId, ...DEFAULT_PREFERENCES, updatedAt: new Date().toISOString() }
  }
  const ref = doc(db, 'notificationPreferences', userId)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    return { userId, ...DEFAULT_PREFERENCES, updatedAt: new Date().toISOString() }
  }
  const data = snap.data()
  return {
    ...DEFAULT_PREFERENCES,
    ...data,
    userId,
    updatedAt: tsToISO(data.updatedAt),
  } as NotificationPreferences
}

export async function saveNotificationPreferences(
  prefs: NotificationPreferences
): Promise<void> {
  if (!db) throw new Error('Firestore not initialized')
  const ref = doc(db, 'notificationPreferences', prefs.userId)
  await setDoc(ref, { ...prefs, updatedAt: serverTimestamp() }, { merge: true })
}

// ─── Notification Templates ────────────────────────────────────────────────────

export async function getNotificationTemplates(): Promise<NotificationTemplate[]> {
  if (!db) return []
  const ref = collection(db, 'notificationTemplates')
  const q = query(ref, orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    createdAt: tsToISO(d.data().createdAt),
    updatedAt: tsToISO(d.data().updatedAt),
  })) as NotificationTemplate[]
}

export async function saveNotificationTemplate(
  template: Omit<NotificationTemplate, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  if (!db) throw new Error('Firestore not initialized')
  const ref = collection(db, 'notificationTemplates')
  const docRef = await addDoc(ref, {
    ...template,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return docRef.id
}

// ─── Admin Notification Requests ──────────────────────────────────────────────

export async function getAdminNotifications(): Promise<AdminNotificationRequest[]> {
  if (!db) return []
  const ref = collection(db, 'adminNotifications')
  const q = query(ref, orderBy('createdAt', 'desc'), limit(50))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    createdAt: tsToISO(d.data().createdAt),
    sentAt: d.data().sentAt ? tsToISO(d.data().sentAt) : undefined,
  })) as AdminNotificationRequest[]
}

export async function createAdminNotification(
  request: Omit<AdminNotificationRequest, 'id' | 'createdAt'>
): Promise<string> {
  if (!db) throw new Error('Firestore not initialized')
  const ref = collection(db, 'adminNotifications')
  const docRef = await addDoc(ref, { ...request, createdAt: serverTimestamp() })
  return docRef.id
}

export async function updateAdminNotification(
  id: string,
  updates: Partial<AdminNotificationRequest>
): Promise<void> {
  if (!db) throw new Error('Firestore not initialized')
  const ref = doc(db, 'adminNotifications', id)
  await updateDoc(ref, updates)
}
