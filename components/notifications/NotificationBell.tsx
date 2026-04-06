'use client'
import { Bell } from 'lucide-react'
import { useNotificationContext } from '@/context/NotificationContext'

interface NotificationBellProps {
  onClick?: () => void
  className?: string
}

/**
 * Header bell icon that shows an unread badge.
 * Designed to be paired with NotificationCenter or used standalone.
 */
export default function NotificationBell({ onClick, className = '' }: NotificationBellProps) {
  const { unreadCount } = useNotificationContext()

  return (
    <button
      onClick={onClick}
      className={`relative p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${className}`}
      aria-label={
        unreadCount > 0
          ? `Notifications — ${unreadCount} unread`
          : 'Notifications'
      }
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span
          className="absolute top-1 right-1 h-4 w-4 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
          aria-hidden="true"
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  )
}
