'use client'
import { useState, useEffect, useCallback } from 'react'
import {
  getNotificationPreferences,
  saveNotificationPreferences,
} from '@/lib/notifications/firebase'
import type { NotificationPreferences } from '@/types'

interface UseNotificationPreferencesReturn {
  preferences: NotificationPreferences | null
  loading: boolean
  saving: boolean
  error: string | null
  save: (updated: NotificationPreferences) => Promise<boolean>
  refresh: () => Promise<void>
}

export function useNotificationPreferences(
  userId: string | null | undefined
): UseNotificationPreferencesReturn {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!userId) return
    try {
      setLoading(true)
      setError(null)
      const prefs = await getNotificationPreferences(userId)
      setPreferences(prefs)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load preferences')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const save = useCallback(
    async (updated: NotificationPreferences): Promise<boolean> => {
      try {
        setSaving(true)
        setError(null)
        await saveNotificationPreferences({ ...updated, userId: userId ?? updated.userId })
        setPreferences(updated)
        return true
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save preferences')
        return false
      } finally {
        setSaving(false)
      }
    },
    [userId]
  )

  return { preferences, loading, saving, error, save, refresh }
}
