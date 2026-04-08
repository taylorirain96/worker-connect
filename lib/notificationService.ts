/**
 * notificationService.ts — Public facade for the notifications system.
 * Re-exports the core sendNotification helpers and convenience notify
 * functions so that other services only need a single import.
 */
export {
  sendNotification,
  notify,
  type SendNotificationOptions,
} from '@/lib/notifications/service'

export {
  createNotification,
  getNotifications,
  getNotificationsByCategory,
  subscribeToNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  clearAllNotifications,
  getNotificationPreferences,
  saveNotificationPreferences,
  DEFAULT_PREFERENCES,
} from '@/lib/notifications/firebase'
