/**
 * Notification system TypeScript interfaces.
 * Re-exports from the root types/index.ts for convenience and
 * adds any notification-specific types not already present there.
 */
export type {
  NotificationType,
  NotificationChannel,
  NotificationFrequency,
  NotificationCategory,
  Notification,
  NotificationDeliveryStatus,
  NotificationPreferences,
  NotificationCategoryPreference,
  NotificationTemplate,
  AdminNotificationRequest,
} from '@/types'

/** Payload for creating a new notification */
export interface CreateNotificationPayload {
  userId: string
  type: import('@/types').NotificationType
  title: string
  message: string
  category?: import('@/types').NotificationCategory
  actionUrl?: string
  imageUrl?: string
  jobId?: string
  metadata?: Record<string, string | number | boolean>
}

/** Paginated response from GET /api/notifications */
export interface NotificationsResponse {
  notifications: import('@/types').Notification[]
  total: number
  hasMore: boolean
  cursor?: string
}

/** Analytics data for admin notification dashboard */
export interface NotificationAnalytics {
  totalSent: number
  totalDelivered: number
  totalFailed: number
  totalRead: number
  byChannel: {
    in_app: number
    push: number
    email: number
    sms: number
  }
  byCategory: Record<import('@/types').NotificationCategory, number>
  deliveryRate: number
  readRate: number
  last30Days: { date: string; sent: number; read: number }[]
}

/** Push subscription object for Web Push API */
export interface PushSubscriptionData {
  endpoint: string
  keys: {
    auth: string
    p256dh: string
  }
}
