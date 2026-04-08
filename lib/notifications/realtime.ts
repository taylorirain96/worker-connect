/**
 * Real-time notification listeners using Firebase Realtime Database (via
 * Firestore onSnapshot). Provides helpers used by hooks and context.
 */
import { subscribeToNotifications } from '@/lib/notifications/firebase'
import type { Notification, NotificationCategory } from '@/types'
import type { Unsubscribe } from 'firebase/firestore'

export type NotificationListener = (notifications: Notification[]) => void

/**
 * Subscribe to real-time notification updates for a user.
 * Returns an unsubscribe function to clean up the listener.
 */
export function subscribeToUserNotifications(
  userId: string,
  onUpdate: NotificationListener,
  options?: { pageSize?: number; category?: NotificationCategory }
): Unsubscribe {
  const pageSize = options?.pageSize ?? 30
  return subscribeToNotifications(userId, onUpdate, pageSize)
}

/**
 * Derive unread count from a notification list.
 */
export function getUnreadCount(notifications: Notification[]): number {
  return notifications.filter((n) => !n.read).length
}

/**
 * Group notifications by date label (Today / Yesterday / Older).
 */
export function groupNotificationsByDate(
  notifications: Notification[]
): { label: string; items: Notification[] }[] {
  const groups: Record<string, Notification[]> = {}

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const yesterdayStart = todayStart - 86400_000

  for (const n of notifications) {
    const ts = new Date(n.createdAt).getTime()
    let label: string
    if (ts >= todayStart) {
      label = 'Today'
    } else if (ts >= yesterdayStart) {
      label = 'Yesterday'
    } else {
      label = 'Older'
    }
    if (!groups[label]) groups[label] = []
    groups[label].push(n)
  }

  const order = ['Today', 'Yesterday', 'Older']
  return order
    .filter((l) => groups[l]?.length)
    .map((label) => ({ label, items: groups[label] }))
}

/**
 * Filter notifications by category.
 */
export function filterByCategory(
  notifications: Notification[],
  category: 'all' | NotificationCategory
): Notification[] {
  if (category === 'all') return notifications
  return notifications.filter((n) => n.category === category)
}
