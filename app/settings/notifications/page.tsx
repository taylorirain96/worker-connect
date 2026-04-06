'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useAuth } from '@/components/providers/AuthProvider'
import { useRouter } from 'next/navigation'
import {
  getNotificationPreferences,
  saveNotificationPreferences,
} from '@/lib/notifications/firebase'
import { registerPushNotifications, saveFCMToken } from '@/lib/notifications/push'
import toast from 'react-hot-toast'
import {
  Bell, Mail, MessageSquare, Smartphone, Moon, Save,
  Briefcase, CreditCard, Star, Shield, Trophy, Settings,
} from 'lucide-react'
import type { NotificationPreferences, NotificationCategory, NotificationFrequency } from '@/types'

const CATEGORY_CONFIG: { id: NotificationCategory; label: string; description: string; icon: React.ReactNode }[] = [
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

export default function NotificationSettingsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pushSupported, setPushSupported] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/login')
  }, [user, authLoading, router])

  useEffect(() => {
    setPushSupported(typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator)
  }, [])

  useEffect(() => {
    if (!user) return
    getNotificationPreferences(user.uid)
      .then(setPrefs)
      .catch(() => toast.error('Failed to load preferences'))
      .finally(() => setLoading(false))
  }, [user])

  const updateChannel = (channel: keyof NotificationPreferences['channels'], value: boolean) => {
    setPrefs((p) => p ? { ...p, channels: { ...p.channels, [channel]: value } } : p)
  }

  const updateCategoryToggle = (
    cat: NotificationCategory,
    channel: 'push' | 'email' | 'sms',
    value: boolean
  ) => {
    setPrefs((p) =>
      p
        ? {
            ...p,
            categories: {
              ...p.categories,
              [cat]: { ...p.categories[cat], [channel]: value },
            },
          }
        : p
    )
  }

  const updateCategoryFrequency = (cat: NotificationCategory, frequency: NotificationFrequency) => {
    setPrefs((p) =>
      p
        ? {
            ...p,
            categories: {
              ...p.categories,
              [cat]: { ...p.categories[cat], frequency },
            },
          }
        : p
    )
  }

  const updateQuietHours = (key: keyof NotificationPreferences['quietHours'], value: string | boolean) => {
    setPrefs((p) => p ? { ...p, quietHours: { ...p.quietHours, [key]: value } } : p)
  }

  const handleEnablePush = async () => {
    if (!user) return
    const token = await registerPushNotifications()
    if (token) {
      await saveFCMToken(user.uid, token)
      updateChannel('push', true)
      toast.success('Push notifications enabled!')
    } else {
      toast.error('Push notifications not granted. Check browser permissions.')
    }
  }

  const handleSave = async () => {
    if (!prefs || !user) return
    try {
      setSaving(true)
      await saveNotificationPreferences({ ...prefs, userId: user.uid, updatedAt: new Date().toISOString() })
      toast.success('Notification preferences saved!')
    } catch {
      toast.error('Failed to save preferences')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!prefs) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Bell className="h-6 w-6 text-primary-600" />
              Notification Settings
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Control how and when you receive notifications
            </p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <LoadingSpinner size="sm" /> : <Save className="h-4 w-4 mr-1.5" />}
            Save changes
          </Button>
        </div>

        {/* Global Channels */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Notification Channels</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* In-App */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                  <Bell className="h-4 w-4 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">In-App</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Toast and bell icon notifications</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={prefs.channels.in_app} onChange={(e) => updateChannel('in_app', e.target.checked)} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600" />
              </label>
            </div>

            {/* Email */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Mail className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Email</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Notifications sent to your email address</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={prefs.channels.email} onChange={(e) => updateChannel('email', e.target.checked)} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600" />
              </label>
            </div>

            {/* Push */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Smartphone className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Push Notifications</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Browser push notifications</p>
                </div>
              </div>
              {pushSupported ? (
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prefs.channels.push}
                    onChange={(e) => {
                      if (e.target.checked) handleEnablePush()
                      else updateChannel('push', false)
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600" />
                </label>
              ) : (
                <span className="text-xs text-gray-400">Not supported</span>
              )}
            </div>

            {/* SMS */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <MessageSquare className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">SMS</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Critical alerts via text message</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={prefs.channels.sms} onChange={(e) => updateChannel('sms', e.target.checked)} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600" />
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Per-Category Preferences */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Category Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {CATEGORY_CONFIG.map((cat) => {
              const catPrefs = prefs.categories[cat.id]
              return (
                <div key={cat.id}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-gray-600 dark:text-gray-400">{cat.icon}</div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{cat.label}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{cat.description}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 ml-8">
                    {/* Channel toggles */}
                    <div className="space-y-2">
                      {(['push', 'email', 'sms'] as const).map((ch) => (
                        prefs.channels[ch] && (
                          <label key={ch} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={catPrefs[ch]}
                              onChange={(e) => updateCategoryToggle(cat.id, ch, e.target.checked)}
                              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="capitalize">{ch === 'push' ? 'Push' : ch === 'email' ? 'Email' : 'SMS'}</span>
                          </label>
                        )
                      ))}
                    </div>
                    {/* Frequency */}
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Frequency</label>
                      <select
                        value={catPrefs.frequency}
                        onChange={(e) => updateCategoryFrequency(cat.id, e.target.value as NotificationFrequency)}
                        className="w-full text-xs px-2 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        {FREQUENCY_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="border-b border-gray-100 dark:border-gray-700 mt-4" />
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Quiet Hours */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Moon className="h-4 w-4 text-indigo-500" />
              Quiet Hours (Do Not Disturb)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Enable quiet hours</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Non-critical notifications are paused during this time
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={prefs.quietHours.enabled}
                  onChange={(e) => updateQuietHours('enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600" />
              </label>
            </div>

            {prefs.quietHours.enabled && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start time
                  </label>
                  <input
                    type="time"
                    value={prefs.quietHours.startTime}
                    onChange={(e) => updateQuietHours('startTime', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End time
                  </label>
                  <input
                    type="time"
                    value={prefs.quietHours.endTime}
                    onChange={(e) => updateQuietHours('endTime', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <LoadingSpinner size="sm" /> : <Save className="h-4 w-4 mr-1.5" />}
            Save changes
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  )
}
