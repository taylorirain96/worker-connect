/**
 * Core notification service — creates in-app notifications and dispatches to
 * email/push/SMS channels based on user preferences.
 */
import {
  createNotification,
  getNotificationPreferences,
} from '@/lib/notifications/firebase'
import type { Notification, NotificationCategory, NotificationType } from '@/types'

// Map notification types to categories
const TYPE_CATEGORY_MAP: Record<NotificationType, NotificationCategory> = {
  new_job: 'jobs',
  application_received: 'jobs',
  job_status_change: 'jobs',
  job_completed: 'jobs',
  application: 'jobs',
  new_message: 'messages',
  message_reply: 'messages',
  conversation_started: 'messages',
  message: 'messages',
  payment_received: 'payments',
  invoice_created: 'payments',
  payout_processed: 'payments',
  payment_failed: 'payments',
  review_received: 'reviews',
  review_response_needed: 'reviews',
  rating_changed: 'reviews',
  new_review: 'reviews',
  document_uploaded: 'verification',
  verification_approved: 'verification',
  verification_rejected: 'verification',
  badge_earned: 'verification',
  account_update: 'system',
  security_alert: 'system',
  maintenance: 'system',
  points_earned: 'gamification',
  badge_unlocked: 'gamification',
  milestone_reached: 'gamification',
  leaderboard_change: 'gamification',
}

function isQuietHours(prefs: Awaited<ReturnType<typeof getNotificationPreferences>>): boolean {
  const { quietHours } = prefs
  if (!quietHours.enabled) return false
  try {
    const now = new Date()
    const [startH, startM] = quietHours.startTime.split(':').map(Number)
    const [endH, endM] = quietHours.endTime.split(':').map(Number)
    const currentMinutes = now.getHours() * 60 + now.getMinutes()
    const startMinutes = startH * 60 + startM
    const endMinutes = endH * 60 + endM
    // Handle overnight ranges (e.g. 22:00–08:00)
    if (startMinutes > endMinutes) {
      return currentMinutes >= startMinutes || currentMinutes < endMinutes
    }
    return currentMinutes >= startMinutes && currentMinutes < endMinutes
  } catch {
    return false
  }
}

export interface SendNotificationOptions {
  userId: string
  type: NotificationType
  title: string
  message: string
  jobId?: string
  actionUrl?: string
  imageUrl?: string
  metadata?: Record<string, string | number | boolean>
}

/**
 * Creates an in-app notification and (if configured) triggers push/email/SMS.
 */
export async function sendNotification(opts: SendNotificationOptions): Promise<string | null> {
  try {
    const category = TYPE_CATEGORY_MAP[opts.type] ?? 'system'
    const prefs = await getNotificationPreferences(opts.userId)
    const categoryPrefs = prefs.categories[category]

    // Always create in-app notification
    const notification: Omit<Notification, 'id' | 'createdAt'> = {
      userId: opts.userId,
      type: opts.type,
      category,
      title: opts.title,
      message: opts.message,
      read: false,
      channel: 'in_app',
      actionUrl: opts.actionUrl,
      imageUrl: opts.imageUrl,
      metadata: opts.metadata,
      jobId: opts.jobId,
      deliveryStatus: { in_app: 'delivered' },
    }
    const id = await createNotification(notification)

    // Skip push/email/SMS during quiet hours for non-critical categories
    const isCritical = category === 'payments' || category === 'system'
    if (isQuietHours(prefs) && !isCritical) {
      return id
    }

    // Dispatch via API route (keeps secrets server-side)
    if (categoryPrefs.email && prefs.channels.email) {
      fetch('/api/notifications/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: opts.userId, notificationId: id, type: opts.type, title: opts.title, message: opts.message }),
      }).catch(() => {})
    }

    if (categoryPrefs.push && prefs.channels.push) {
      fetch('/api/notifications/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: opts.userId, notificationId: id, title: opts.title, message: opts.message, actionUrl: opts.actionUrl }),
      }).catch(() => {})
    }

    if (categoryPrefs.sms && prefs.channels.sms) {
      fetch('/api/notifications/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: opts.userId, notificationId: id, message: opts.message }),
      }).catch(() => {})
    }

    return id
  } catch (err) {
    console.error('sendNotification error', err)
    return null
  }
}

// ─── Convenience helpers ──────────────────────────────────────────────────────

export const notify = {
  newJob: (userId: string, jobTitle: string, jobId: string) =>
    sendNotification({ userId, type: 'new_job', title: 'New Job Available', message: `A new job matching your skills was posted: "${jobTitle}"`, jobId, actionUrl: `/jobs/${jobId}` }),

  applicationReceived: (userId: string, workerName: string, jobTitle: string, jobId: string) =>
    sendNotification({ userId, type: 'application_received', title: 'New Application', message: `${workerName} applied for "${jobTitle}"`, jobId, actionUrl: `/jobs/${jobId}` }),

  jobStatusChange: (userId: string, jobTitle: string, status: string, jobId: string) =>
    sendNotification({ userId, type: 'job_status_change', title: 'Job Status Updated', message: `Your job "${jobTitle}" status changed to ${status}`, jobId, actionUrl: `/jobs/${jobId}` }),

  jobCompleted: (userId: string, jobTitle: string, jobId: string) =>
    sendNotification({ userId, type: 'job_completed', title: 'Job Completed', message: `"${jobTitle}" has been marked as completed`, jobId, actionUrl: `/jobs/${jobId}` }),

  newMessage: (userId: string, senderName: string, preview: string) =>
    sendNotification({ userId, type: 'new_message', title: 'New Message', message: `${senderName}: ${preview}`, actionUrl: '/messages' }),

  paymentReceived: (userId: string, amount: number, jobTitle: string) =>
    sendNotification({ userId, type: 'payment_received', title: 'Payment Received', message: `You received $${amount.toFixed(2)} for "${jobTitle}"`, actionUrl: '/payments' }),

  paymentFailed: (userId: string, amount: number, jobTitle: string) =>
    sendNotification({ userId, type: 'payment_failed', title: 'Payment Failed', message: `Payment of $${amount.toFixed(2)} for "${jobTitle}" failed`, actionUrl: '/payments' }),

  reviewReceived: (userId: string, reviewerName: string, rating: number) =>
    sendNotification({ userId, type: 'review_received', title: 'New Review', message: `${reviewerName} left you a ${rating}-star review`, actionUrl: '/profile' }),

  verificationApproved: (userId: string, docType: string) =>
    sendNotification({ userId, type: 'verification_approved', title: 'Verification Approved', message: `Your ${docType} verification has been approved`, actionUrl: '/profile' }),

  verificationRejected: (userId: string, docType: string, reason?: string) =>
    sendNotification({ userId, type: 'verification_rejected', title: 'Verification Rejected', message: `Your ${docType} verification was rejected${reason ? `: ${reason}` : ''}`, actionUrl: '/profile' }),

  badgeUnlocked: (userId: string, badgeName: string) =>
    sendNotification({ userId, type: 'badge_unlocked', title: 'Badge Unlocked! 🏆', message: `You unlocked the "${badgeName}" badge!`, actionUrl: '/profile' }),

  milestoneReached: (userId: string, milestone: string) =>
    sendNotification({ userId, type: 'milestone_reached', title: 'Milestone Reached! 🎉', message: `You reached a new milestone: ${milestone}`, actionUrl: '/earnings' }),

  pointsEarned: (userId: string, points: number, reason: string) =>
    sendNotification({ userId, type: 'points_earned', title: 'Points Earned! ⭐', message: `You earned ${points} points for ${reason}`, actionUrl: '/leaderboard' }),

  securityAlert: (userId: string, detail: string) =>
    sendNotification({ userId, type: 'security_alert', title: 'Security Alert', message: detail, actionUrl: '/settings' }),
}
