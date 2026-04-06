'use client'
import { CheckCheck, Trash2, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { formatRelativeDate } from '@/lib/utils'
import type { Notification, NotificationType } from '@/types'

const TYPE_ICONS: Partial<Record<NotificationType, string>> = {
  new_job: '💼',
  application_received: '📋',
  job_status_change: '🔄',
  job_completed: '✅',
  application: '📋',
  new_message: '💬',
  message_reply: '💬',
  conversation_started: '💬',
  message: '💬',
  payment_received: '💰',
  invoice_created: '🧾',
  payout_processed: '💳',
  payment_failed: '⚠️',
  review_received: '⭐',
  new_review: '⭐',
  review_response_needed: '⭐',
  rating_changed: '⭐',
  document_uploaded: '📄',
  verification_approved: '✅',
  verification_rejected: '❌',
  badge_earned: '🏅',
  account_update: '👤',
  security_alert: '🔐',
  maintenance: '🔧',
  points_earned: '⭐',
  badge_unlocked: '🏆',
  milestone_reached: '🎉',
  leaderboard_change: '📊',
}

const CATEGORY_COLORS: Record<string, string> = {
  jobs: 'bg-blue-50 dark:bg-blue-900/10',
  messages: 'bg-purple-50 dark:bg-purple-900/10',
  payments: 'bg-green-50 dark:bg-green-900/10',
  reviews: 'bg-yellow-50 dark:bg-yellow-900/10',
  verification: 'bg-indigo-50 dark:bg-indigo-900/10',
  system: 'bg-gray-50 dark:bg-gray-700/30',
  gamification: 'bg-orange-50 dark:bg-orange-900/10',
}

interface NotificationItemProps {
  notification: Notification
  onMarkRead?: (id: string) => void
  onDelete?: (id: string) => void
  compact?: boolean
}

export default function NotificationItem({
  notification: n,
  onMarkRead,
  onDelete,
  compact = false,
}: NotificationItemProps) {
  const icon = TYPE_ICONS[n.type] ?? '🔔'
  const bgColor = !n.read
    ? (CATEGORY_COLORS[n.category ?? 'system'] ?? 'bg-primary-50 dark:bg-primary-900/10')
    : ''

  return (
    <div
      className={`flex gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors group ${bgColor}`}
    >
      <span className="text-xl flex-shrink-0 mt-0.5">{icon}</span>

      <div className="flex-1 min-w-0">
        {n.title && !compact && (
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">
            {n.title}
          </p>
        )}
        <p
          className={`text-sm text-gray-800 dark:text-gray-200 leading-snug ${
            !n.read ? 'font-medium' : ''
          }`}
        >
          {n.message}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{formatRelativeDate(n.createdAt)}</p>

        {n.actionUrl && !compact && (
          <Link
            href={n.actionUrl}
            className="inline-flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:underline mt-1"
            onClick={() => onMarkRead?.(n.id)}
          >
            View details <ExternalLink className="h-3 w-3" />
          </Link>
        )}

        {n.jobId && !n.actionUrl && (
          <Link
            href={`/jobs/${n.jobId}`}
            className="text-xs text-primary-600 dark:text-primary-400 hover:underline mt-1 inline-block"
            onClick={() => onMarkRead?.(n.id)}
          >
            View job →
          </Link>
        )}
      </div>

      <div className="flex-shrink-0 flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {!n.read && onMarkRead && (
          <button
            onClick={() => onMarkRead(n.id)}
            className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            title="Mark as read"
            aria-label="Mark notification as read"
          >
            <CheckCheck className="h-4 w-4" />
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(n.id)}
            className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
            title="Delete notification"
            aria-label="Delete notification"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {!n.read && (
        <span className="flex-shrink-0 h-2 w-2 rounded-full bg-primary-500 mt-2 self-start" />
      )}
    </div>
  )
}
