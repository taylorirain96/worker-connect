'use client'
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { subscribeToUserNotifications, getUnreadCount } from '@/lib/notifications/realtime'
import {
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from '@/lib/notifications/firebase'
import { useAuth } from '@/components/providers/AuthProvider'
import type { Notification } from '@/types'

interface NotificationContextValue {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  markRead: (id: string) => Promise<void>
  markAllRead: () => Promise<void>
  remove: (id: string) => Promise<void>
}

const NotificationContext = createContext<NotificationContextValue>({
  notifications: [],
  unreadCount: 0,
  loading: false,
  markRead: async () => {},
  markAllRead: async () => {},
  remove: async () => {},
})

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) {
      setNotifications([])
      return
    }
    setLoading(true)
    const unsub = subscribeToUserNotifications(user.uid, (items) => {
      setNotifications(items)
      setLoading(false)
    })
    return () => unsub()
  }, [user])

  const markRead = useCallback(async (id: string) => {
    await markNotificationRead(id)
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }, [])

  const markAllRead = useCallback(async () => {
    if (!user) return
    await markAllNotificationsRead(user.uid)
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [user])

  const remove = useCallback(async (id: string) => {
    await deleteNotification(id)
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount: getUnreadCount(notifications),
        loading,
        markRead,
        markAllRead,
        remove,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotificationContext(): NotificationContextValue {
  return useContext(NotificationContext)
}
