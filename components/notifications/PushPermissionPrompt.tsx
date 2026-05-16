'use client'
/**
 * PushPermissionPrompt
 *
 * Shown once after a user logs in. Asks them to enable browser push notifications.
 * Stored in localStorage so it only appears once per device.
 */
import { useState, useEffect } from 'react'
import { Bell, X } from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'
import { requestFCMPermission } from '@/lib/fcm'

const STORAGE_KEY = 'wc_push_prompt_dismissed'
const SNOOZE_DAYS = 7

export default function PushPermissionPrompt() {
  const { user } = useAuth()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!user) return
    if (typeof window === 'undefined') return
    if (!('Notification' in window)) return
    if (Notification.permission !== 'default') return
    // Check if snooze is still active
    const snoozedUntil = localStorage.getItem(STORAGE_KEY)
    if (snoozedUntil && Date.now() < parseInt(snoozedUntil, 10)) return

    // Show the prompt 2 seconds after login
    const timer = setTimeout(() => setVisible(true), 2000)
    return () => clearTimeout(timer)
  }, [user])

  const dismiss = () => {
    setVisible(false)
    const snoozedUntil = Date.now() + SNOOZE_DAYS * 24 * 60 * 60 * 1000
    localStorage.setItem(STORAGE_KEY, String(snoozedUntil))
  }

  const enable = async () => {
    dismiss()
    if (!user) return
    await requestFCMPermission(user.uid)
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
          Get alerted instantly when new jobs match your skills, quotes arrive, or bookings are confirmed.
        </p>
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={enable}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
          >
            Enable notifications
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
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
