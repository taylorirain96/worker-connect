'use client'
import { useEffect, useRef, useState } from 'react'

/**
 * Returns the current browser Notification permission and an enable() helper
 * that prompts the user. Safe to call in non-browser / unsupported envs.
 */
export function useNotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default')

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setPermission('unsupported')
      return
    }
    setPermission(Notification.permission)
  }, [])

  const enable = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return
    try {
      const result = await Notification.requestPermission()
      setPermission(result)
    } catch {
      // permission API can throw in some legacy browsers - ignore
    }
  }

  return { permission, enable }
}

interface ReminderItem {
  id: string
  /** Local wall-clock event start (Date). */
  startsAt: Date
  title: string
  body?: string
}

/**
 * Schedules in-page pop-up notifications `minutesBefore` ahead of each event's
 * start time. Only fires while the calendar page is open and only when the
 * user has granted Notification permission. Re-runs when items change.
 */
export function useEventReminders(
  items: ReminderItem[],
  minutesBefore = 30,
  enabled = true,
) {
  const firedRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!enabled) return
    if (typeof window === 'undefined' || !('Notification' in window)) return
    if (Notification.permission !== 'granted') return

    const timers: ReturnType<typeof setTimeout>[] = []
    const leadMs = Math.max(0, minutesBefore) * 60 * 1000
    const now = Date.now()

    for (const item of items) {
      const fireAt = item.startsAt.getTime() - leadMs
      const delay = fireAt - now
      // Skip events whose reminder time is already in the past or already fired.
      if (delay <= 0) continue
      if (firedRef.current.has(item.id)) continue
      // setTimeout max is ~24.8 days; skip anything further out (re-mounted on revisit).
      if (delay > 2_147_000_000) continue

      const t = setTimeout(() => {
        firedRef.current.add(item.id)
        try {
          new Notification(item.title, {
            body: item.body,
            tag: item.id,
          })
        } catch {
          // Some browsers throw if invoked outside a user gesture; ignore.
        }
      }, delay)
      timers.push(t)
    }

    return () => {
      for (const t of timers) clearTimeout(t)
    }
  }, [items, minutesBefore, enabled])
}
