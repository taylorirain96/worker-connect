'use client'
import { useEffect, useRef, useState } from 'react'
import { Bell, X, CheckCheck } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthProvider'
import { subscribeToNotifications, markAsRead, clearNotifications } from '@/lib/services/notificationService'
import { formatRelativeDate } from '@/lib/utils'
import type { Notification } from '@/types'

const TYPE_ICONS: Record<Notification['type'], string> = {
  new_job: '💼',
  new_review: '⭐',
  application: '📋',
  message: '💬',
}

export default function NotificationCenter() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter((n) => !n.read).length

  useEffect(() => {
    if (!user) return
    const unsub = subscribeToNotifications(user.uid, setNotifications)
    return () => unsub()
  }, [user])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  if (!user) return null

  const handleMarkRead = async (id: string) => {
    await markAsRead(id)
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const handleClearAll = async () => {
    await clearNotifications(user.uid)
    setNotifications([])
    setOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </h3>
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                >
                  <X className="h-3 w-3" />
                  Clear all
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
              {notifications.length === 0 ? (
                <div className="py-10 text-center text-sm text-gray-400 dark:text-gray-500">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  No notifications yet
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`flex gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                      !n.read ? 'bg-primary-50 dark:bg-primary-900/10' : ''
                    }`}
                  >
                    <span className="text-lg flex-shrink-0 mt-0.5">{TYPE_ICONS[n.type]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 dark:text-gray-200 leading-snug">
                        {n.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatRelativeDate(n.createdAt)}</p>
                      {n.jobId && (
                        <Link
                          href={`/jobs/${n.jobId}`}
                          className="text-xs text-primary-600 hover:underline mt-1 inline-block"
                          onClick={() => { handleMarkRead(n.id); setOpen(false) }}
                        >
                          View job →
                        </Link>
                      )}
                    </div>
                    {!n.read && (
                      <button
                        onClick={() => handleMarkRead(n.id)}
                        className="flex-shrink-0 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        title="Mark as read"
                      >
                        <CheckCheck className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
