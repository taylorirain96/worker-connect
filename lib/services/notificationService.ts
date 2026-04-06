import {
  collection,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  writeBatch,
  getDocs,
  addDoc,
  serverTimestamp,
  Timestamp,
  type DocumentData,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Notification } from '@/types'

function docToNotification(id: string, data: DocumentData): Notification {
  return {
    ...data,
    id,
    createdAt:
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : data.createdAt ?? new Date().toISOString(),
  } as Notification
}

export function subscribeToNearbyJobs(
  workerId: string,
  // location and radius are reserved for future geo-query implementation
  location: string,
  radius: number = 10,
  onNewJob: (notification: Notification) => void
): Unsubscribe {
  void location
  void radius
  if (!db) return () => {}

  const notificationsRef = collection(db, 'notifications')
  const q = query(
    notificationsRef,
    where('userId', '==', workerId),
    where('type', '==', 'new_job'),
    where('read', '==', false),
    orderBy('createdAt', 'desc')
  )

  return onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        onNewJob(docToNotification(change.doc.id, change.doc.data()))
      }
    })
  })
}

export async function getNotifications(userId: string): Promise<Notification[]> {
  if (!db) return []
  const notificationsRef = collection(db, 'notifications')
  const q = query(
    notificationsRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => docToNotification(d.id, d.data()))
}

export function subscribeToNotifications(
  userId: string,
  onChange: (notifications: Notification[]) => void
): Unsubscribe {
  if (!db) return () => {}
  const notificationsRef = collection(db, 'notifications')
  const q = query(
    notificationsRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  )
  return onSnapshot(q, (snapshot) => {
    onChange(snapshot.docs.map((d) => docToNotification(d.id, d.data())))
  })
}

export async function markAsRead(notificationId: string): Promise<void> {
  if (!db) throw new Error('Firestore is not initialized')
  const ref = doc(db, 'notifications', notificationId)
  await updateDoc(ref, { read: true })
}

export async function clearNotifications(userId: string): Promise<void> {
  if (!db) throw new Error('Firestore is not initialized')
  const notificationsRef = collection(db, 'notifications')
  const q = query(notificationsRef, where('userId', '==', userId))
  const snapshot = await getDocs(q)
  const batch = writeBatch(db)
  snapshot.docs.forEach((d) => batch.delete(d.ref))
  await batch.commit()
}

export async function createNotification(
  notification: Omit<Notification, 'id' | 'createdAt'>
): Promise<string> {
  if (!db) throw new Error('Firestore is not initialized')
  const ref = collection(db, 'notifications')
  const docRef = await addDoc(ref, { ...notification, createdAt: serverTimestamp() })
  return docRef.id
}
