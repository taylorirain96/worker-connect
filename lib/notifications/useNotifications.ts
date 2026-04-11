'use client'
/**
 * useNotifications hook for the in-app notification system (Lot 6).
 * Provides real-time unread count and lazy-loaded full notification list.
 */
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  onUnreadCountChange,
} from '@/lib/notifications/index'
import type { AppNotification } from '@/types'

interface UseNotificationsReturn {
  notifications: AppNotification[]
  unreadCount: number
  loading: boolean
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  refresh: () => Promise<void>
}

export function useNotifications(): UseNotificationsReturn {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  // Real-time unread count via onSnapshot
  useEffect(() => {
    if (!user) {
      setUnreadCount(0)
      return
    }
    const unsub = onUnreadCountChange(user.uid, setUnreadCount)
    return () => unsub()
  }, [user])

  const refresh = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const items = await getNotifications(user.uid)
      setNotifications(items)
    } finally {
      setLoading(false)
    }
  }, [user])

  const handleMarkAsRead = useCallback(
    async (id: string) => {
      await markAsRead(id)
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    },
    []
  )

  const handleMarkAllAsRead = useCallback(async () => {
    if (!user) return
    await markAllAsRead(user.uid)
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [user])

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    refresh,
  }
}
