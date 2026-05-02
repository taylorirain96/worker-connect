/**
 * /dashboard/notifications — Notification Centre
 *
 * Full notification centre available at /dashboard/notifications.
 * Re-renders the full-featured notification list from /notifications.
 */
import { redirect } from 'next/navigation'

export default function DashboardNotificationsPage() {
  redirect('/notifications')
}
