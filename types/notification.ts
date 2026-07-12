export type NotificationType =
  // Job alerts
  | 'new_job'
  | 'application_received'
  | 'job_status_change'
  | 'job_completed'
  // Message alerts
  | 'new_message'
  | 'message_reply'
  | 'conversation_started'
  // Legacy compatibility
  | 'application'
  | 'new_review'
  | 'message'
  // Payment alerts
  | 'payment_received'
  | 'invoice_created'
  | 'payout_processed'
  | 'payment_failed'
  | 'dispute_opened'
  | 'dispute_resolved'
  // Review alerts
  | 'review_received'
  | 'review_response_needed'
  | 'rating_changed'
  // Verification alerts
  | 'document_uploaded'
  | 'verification_approved'
  | 'verification_rejected'
  | 'badge_earned'
  // System alerts
  | 'account_update'
  | 'security_alert'
  | 'maintenance'
  // Application alerts
  | 'application_accepted'
  | 'application_rejected'
  | 'job_posted'
  | 'general'
  // Gamification alerts
  | 'points_earned'
  | 'badge_unlocked'
  | 'milestone_reached'
  | 'leaderboard_change'
  // Placement / employment check-in alerts
  | 'placement_checkin_worker'
  | 'placement_checkin_employer'
  | 'placement_ended_worker'
  | 'placement_ended_employer'
  // Boost trial alerts
  | 'trial_expired'

export type NotificationChannel = 'push' | 'email' | 'sms' | 'in_app'

export type NotificationFrequency = 'instant' | 'daily_digest' | 'weekly_digest' | 'off'

export type NotificationCategory =
  | 'jobs'
  | 'messages'
  | 'payments'
  | 'reviews'
  | 'verification'
  | 'system'
  | 'gamification'

export interface Notification {
  id: string
  userId: string
  jobId?: string
  message: string
  title?: string
  type: NotificationType
  category?: NotificationCategory
  channel?: NotificationChannel
  read: boolean
  actionUrl?: string
  imageUrl?: string
  metadata?: Record<string, string | number | boolean>
  deliveryStatus?: NotificationDeliveryStatus
  createdAt: string
  readAt?: string
}

/** Simplified notification type for the in-app notification system (Lot 6). */
export interface AppNotification {
  id: string
  userId: string
  type: 'application_received' | 'application_accepted' | 'application_rejected' | 'job_posted' | 'general'
  title: string
  message: string
  read: boolean
  link?: string
  createdAt: string
  relatedJobId?: string
  relatedApplicationId?: string
}

export interface NotificationDeliveryStatus {
  push?: 'pending' | 'sent' | 'delivered' | 'failed'
  email?: 'pending' | 'sent' | 'delivered' | 'bounced' | 'failed'
  sms?: 'pending' | 'sent' | 'delivered' | 'failed'
  in_app?: 'delivered' | 'read'
}

export interface NotificationPreferences {
  userId: string
  channels: {
    push: boolean
    email: boolean
    sms: boolean
    in_app: boolean
  }
  categories: {
    jobs: NotificationCategoryPreference
    messages: NotificationCategoryPreference
    payments: NotificationCategoryPreference
    reviews: NotificationCategoryPreference
    verification: NotificationCategoryPreference
    system: NotificationCategoryPreference
    gamification: NotificationCategoryPreference
  }
  quietHours: {
    enabled: boolean
    startTime: string  // "HH:MM" 24h format
    endTime: string    // "HH:MM" 24h format
    timezone: string
  }
  updatedAt: string
}

export interface NotificationCategoryPreference {
  push: boolean
  email: boolean
  sms: boolean
  frequency: NotificationFrequency
}

export interface NotificationTemplate {
  id: string
  name: string
  type: NotificationType
  channel: NotificationChannel
  subject?: string
  body: string
  htmlBody?: string
  variables: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface AdminNotificationRequest {
  id?: string
  title: string
  message: string
  type: NotificationType
  targetSegment: 'all' | 'workers' | 'employers' | 'specific'
  targetUserIds?: string[]
  channels: NotificationChannel[]
  scheduledAt?: string
  sentAt?: string
  status: 'draft' | 'scheduled' | 'sent' | 'cancelled'
  sentCount?: number
  deliveredCount?: number
  failedCount?: number
  createdBy: string
  createdAt: string
}

/** Payload for creating a new notification */
export interface CreateNotificationPayload {
  userId: string
  type: NotificationType
  title: string
  message: string
  category?: NotificationCategory
  actionUrl?: string
  imageUrl?: string
  jobId?: string
  metadata?: Record<string, string | number | boolean>
}

/** Paginated response from GET /api/notifications */
export interface NotificationsResponse {
  notifications: Notification[]
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
  byCategory: Record<NotificationCategory, number>
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
