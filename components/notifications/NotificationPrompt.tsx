'use client'
/**
 * NotificationPrompt
 *
 * Banner shown after login asking users to enable browser push notifications.
 * "Enable" triggers the FCM permission request.
 * "Maybe later" dismisses the banner for 7 days (stored in localStorage).
 *
 * Gracefully handles:
 * - Browsers that do not support the Notifications API
 * - SSR / non-browser environments
 * - Users who have already granted or permanently denied permission
 */
import { useState, useEffect } from 'react'
import { Bell, X } from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'
import { requestPermission } from '@/lib/fcm/requestPermission'

const STORAGE_KEY = 'wc_notif_prompt_snoozed'
const SNOOZE_DAYS = 7
const MS_PER_DAY = 24 * 60 * 60 * 1000

export default function NotificationPrompt() {
  const { user } = useAuth()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!user) return
    if (typeof window === 'undefined') return
    // Gracefully handle browsers that don't support the Notifications API
    if (!('Notification' in window)) return
    // Already granted or permanently denied — no need to prompt
    if (Notification.permission !== 'default') return

    // Check if the user snoozed the prompt and the snooze hasn't expired yet
    const snoozedUntil = localStorage.getItem(STORAGE_KEY)
    if (snoozedUntil && Date.now() < parseInt(snoozedUntil, 10)) return

    // Show prompt 2 seconds after page load to avoid jarring the user
    const timer = setTimeout(() => setVisible(true), 2000)
    return () => clearTimeout(timer)
  }, [user])

  /** Dismiss and snooze for SNOOZE_DAYS days. */
  const dismiss = () => {
    setVisible(false)
    const snoozedUntil = Date.now() + SNOOZE_DAYS * MS_PER_DAY
    localStorage.setItem(STORAGE_KEY, String(snoozedUntil))
  }

  /** Request FCM permission and hide the prompt. */
  const enable = async () => {
    setVisible(false)
    if (!user) return
    await requestPermission(user.uid)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-live="polite"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm mx-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-4 flex items-start gap-3"
    >
      <div className="flex-shrink-0 bg-indigo-100 dark:bg-indigo-900/40 rounded-full p-2">
        <Bell className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          Enable notifications
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          Get instant job alerts for new jobs, quotes, messages, and booking updates.
        </p>
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={enable}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
          >
            Enable
          </button>
          <button
            onClick={dismiss}
            className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 px-2 py-1.5 transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>

      <button
        onClick={dismiss}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors -mt-1 -mr-1"
        aria-label="Dismiss notification prompt"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
