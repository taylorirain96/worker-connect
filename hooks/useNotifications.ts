'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  getNotificationsByCategory,
} from '@/lib/notifications/firebase'
import { subscribeToUserNotifications, filterByCategory, getUnreadCount } from '@/lib/notifications/realtime'
import type { Notification, NotificationCategory } from '@/types'
import type { QueryDocumentSnapshot } from 'firebase/firestore'

interface UseNotificationsOptions {
  /** Automatically subscribe to real-time updates */
  realtime?: boolean
  /** Initial category filter */
  category?: 'all' | NotificationCategory
  /** Page size for paginated loads */
  pageSize?: number
}

interface UseNotificationsReturn {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  loadingMore: boolean
  hasMore: boolean
  category: 'all' | NotificationCategory
  setCategory: (cat: 'all' | NotificationCategory) => void
  markRead: (id: string) => Promise<void>
  markAllRead: () => Promise<void>
  remove: (id: string) => Promise<void>
  loadMore: () => Promise<void>
  refresh: () => Promise<void>
}

export function useNotifications(
  userId: string | null | undefined,
  options: UseNotificationsOptions = {}
): UseNotificationsReturn {
  const { realtime = true, category: initialCategory = 'all', pageSize = 20 } = options

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [category, setCategory] = useState<'all' | NotificationCategory>(initialCategory)
  const lastDocRef = useRef<QueryDocumentSnapshot | null>(null)

  const fetchNotifications = useCallback(
    async (reset = true) => {
      if (!userId) return
      try {
        if (reset) setLoading(true)
        else setLoadingMore(true)

        let result: Notification[]
        let nextDoc: QueryDocumentSnapshot | null = null

        if (category === 'all') {
          const res = await getNotifications(userId, pageSize, reset ? undefined : lastDocRef.current ?? undefined)
          result = res.notifications
          nextDoc = res.lastDoc
        } else {
          result = await getNotificationsByCategory(userId, category)
        }

        if (reset) {
          setNotifications(result)
        } else {
          setNotifications((prev) => [...prev, ...result])
        }
        lastDocRef.current = nextDoc
        setHasMore(nextDoc !== null && result.length === pageSize)
      } catch (err) {
        console.error('useNotifications fetch error', err)
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [userId, category, pageSize]
  )

  // Re-fetch when category or userId changes
  useEffect(() => {
    if (!realtime) {
      fetchNotifications(true)
    }
  }, [fetchNotifications, realtime])

  // Real-time subscription
  useEffect(() => {
    if (!realtime || !userId) return
    setLoading(true)
    const unsub = subscribeToUserNotifications(
      userId,
      (all) => {
        setNotifications(filterByCategory(all, category))
        setLoading(false)
      },
      { pageSize }
    )
    return () => unsub()
  }, [userId, realtime, category, pageSize])

  const markRead = useCallback(
    async (id: string) => {
      await markNotificationRead(id)
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    },
    []
  )

  const markAllRead = useCallback(async () => {
    if (!userId) return
    await markAllNotificationsRead(userId)
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [userId])

  const remove = useCallback(async (id: string) => {
    await deleteNotification(id)
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const loadMore = useCallback(() => fetchNotifications(false), [fetchNotifications])
  const refresh = useCallback(() => fetchNotifications(true), [fetchNotifications])

  return {
    notifications,
    unreadCount: getUnreadCount(notifications),
    loading,
    loadingMore,
    hasMore,
    category,
    setCategory,
    markRead,
    markAllRead,
    remove,
    loadMore,
    refresh,
  }
}
