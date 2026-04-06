'use client'
import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences'
import {
  Bell, Mail, MessageSquare, Smartphone, Moon, Save,
  Briefcase, CreditCard, Star, Shield, Trophy, Settings,
} from 'lucide-react'
import type { NotificationCategory, NotificationFrequency } from '@/types'

const CATEGORY_CONFIG: {
  id: NotificationCategory
  label: string
  description: string
  icon: React.ReactNode
}[] = [
  { id: 'jobs', label: 'Job Alerts', description: 'New jobs, applications, status changes', icon: <Briefcase className="h-5 w-5" /> },
  { id: 'messages', label: 'Messages', description: 'New messages and conversation updates', icon: <MessageSquare className="h-5 w-5" /> },
  { id: 'payments', label: 'Payments', description: 'Payment received, invoices, payouts', icon: <CreditCard className="h-5 w-5" /> },
  { id: 'reviews', label: 'Reviews', description: 'New reviews and rating changes', icon: <Star className="h-5 w-5" /> },
  { id: 'verification', label: 'Verification', description: 'Document uploads, approvals, badges', icon: <Shield className="h-5 w-5" /> },
  { id: 'gamification', label: 'Achievements', description: 'Points, badges, milestones, leaderboard', icon: <Trophy className="h-5 w-5" /> },
  { id: 'system', label: 'System', description: 'Account updates, security alerts', icon: <Settings className="h-5 w-5" /> },
]

const FREQUENCY_OPTIONS: { value: NotificationFrequency; label: string }[] = [
  { value: 'instant', label: 'Instant' },
  { value: 'daily_digest', label: 'Daily digest' },
  { value: 'weekly_digest', label: 'Weekly digest' },
  { value: 'off', label: 'Off' },
]

interface NotificationPreferencesProps {
  userId: string
  onSaved?: () => void
}

export default function NotificationPreferences({ userId, onSaved }: NotificationPreferencesProps) {
  const { preferences, loading, saving, save } = useNotificationPreferences(userId)
  const [localPrefs, setLocalPrefs] = useState(preferences)
  const [savedMsg, setSavedMsg] = useState(false)

  // Sync local state when preferences load from the hook
  useEffect(() => {
    if (preferences) setLocalPrefs(preferences)
  }, [preferences])

  const handleSave = async () => {
    if (!localPrefs) return
    const ok = await save(localPrefs)
    if (ok) {
      setSavedMsg(true)
      setTimeout(() => setSavedMsg(false), 3000)
      onSaved?.()
    }
  }

  if (loading || !localPrefs) {
    return (
      <div className="py-12 flex items-center justify-center">
        <LoadingSpinner size="md" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Global channels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary-600" />
            Notification Channels
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {([
            { key: 'in_app' as const, label: 'In-App', description: 'Notifications inside QuickTrade', icon: <Bell className="h-5 w-5" /> },
            { key: 'push' as const, label: 'Push Notifications', description: 'Browser or mobile push', icon: <Smartphone className="h-5 w-5" /> },
            { key: 'email' as const, label: 'Email', description: 'Delivered to your inbox', icon: <Mail className="h-5 w-5" /> },
            { key: 'sms' as const, label: 'SMS', description: 'Text message alerts (critical only)', icon: <MessageSquare className="h-5 w-5" /> },
          ] as const).map(({ key, label, description, icon }) => (
            <label key={key} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30">
              <div className="flex items-center gap-3">
                <span className="text-gray-500 dark:text-gray-400">{icon}</span>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={localPrefs.channels[key]}
                onChange={(e) =>
                  setLocalPrefs((p) =>
                    p ? { ...p, channels: { ...p.channels, [key]: e.target.checked } } : p
                  )
                }
                className="h-4 w-4 text-primary-600 rounded"
              />
            </label>
          ))}
        </CardContent>
      </Card>

      {/* Per-category preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary-600" />
            Category Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {CATEGORY_CONFIG.map(({ id, label, description, icon }) => {
            const catPrefs = localPrefs.categories[id]
            return (
              <div key={id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-gray-500 dark:text-gray-400">{icon}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  {(['push', 'email', 'sms'] as const).map((ch) => (
                    <label key={ch} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={catPrefs[ch]}
                        onChange={(e) =>
                          setLocalPrefs((p) =>
                            p
                              ? {
                                  ...p,
                                  categories: {
                                    ...p.categories,
                                    [id]: { ...catPrefs, [ch]: e.target.checked },
                                  },
                                }
                              : p
                          )
                        }
                        className="h-3.5 w-3.5 text-primary-600 rounded"
                      />
                      {ch.toUpperCase()}
                    </label>
                  ))}
                  <div className="ml-auto flex items-center gap-1.5">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Frequency:</span>
                    <select
                      value={catPrefs.frequency}
                      onChange={(e) =>
                        setLocalPrefs((p) =>
                          p
                            ? {
                                ...p,
                                categories: {
                                  ...p.categories,
                                  [id]: { ...catPrefs, frequency: e.target.value as NotificationFrequency },
                                },
                              }
                            : p
                        )
                      }
                      className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    >
                      {FREQUENCY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Quiet hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5 text-primary-600" />
            Quiet Hours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <label className="flex items-center justify-between mb-4 cursor-pointer">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Enable quiet hours</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Suppress non-critical notifications during the specified hours
              </p>
            </div>
            <input
              type="checkbox"
              checked={localPrefs.quietHours.enabled}
              onChange={(e) =>
                setLocalPrefs((p) =>
                  p
                    ? { ...p, quietHours: { ...p.quietHours, enabled: e.target.checked } }
                    : p
                )
              }
              className="h-4 w-4 text-primary-600 rounded"
            />
          </label>

          {localPrefs.quietHours.enabled && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start time
                </label>
                <input
                  type="time"
                  value={localPrefs.quietHours.startTime}
                  onChange={(e) =>
                    setLocalPrefs((p) =>
                      p
                        ? { ...p, quietHours: { ...p.quietHours, startTime: e.target.value } }
                        : p
                    )
                  }
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-1.5 text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End time
                </label>
                <input
                  type="time"
                  value={localPrefs.quietHours.endTime}
                  onChange={(e) =>
                    setLocalPrefs((p) =>
                      p
                        ? { ...p, quietHours: { ...p.quietHours, endTime: e.target.value } }
                        : p
                    )
                  }
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-1.5 text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <LoadingSpinner size="sm" /> : <Save className="h-4 w-4 mr-1.5" />}
          Save preferences
        </Button>
        {savedMsg && (
          <span className="text-sm text-green-600 dark:text-green-400 font-medium">
            ✓ Saved successfully
          </span>
        )}
      </div>
    </div>
  )
}
