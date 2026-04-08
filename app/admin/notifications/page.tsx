'use client'
import { useState, useEffect, useCallback } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useAuth } from '@/components/providers/AuthProvider'
import { useRouter } from 'next/navigation'
import {
  getAdminNotifications,
  createAdminNotification,
  updateAdminNotification,
} from '@/lib/notifications/firebase'
import toast from 'react-hot-toast'
import {
  Bell, Send, Users, BarChart2, CheckCircle, XCircle,
  Clock, Plus, Trash2, RefreshCw, Megaphone,
} from 'lucide-react'
import type { AdminNotificationRequest, NotificationType, NotificationChannel } from '@/types'

const MOCK_ADMIN_NOTIFICATIONS: AdminNotificationRequest[] = [
  {
    id: '1',
    title: 'Platform Maintenance',
    message: 'Scheduled maintenance on Sunday 2am–4am EST. The platform will be unavailable during this time.',
    type: 'maintenance',
    targetSegment: 'all',
    channels: ['email', 'in_app'],
    status: 'sent',
    sentCount: 1248,
    deliveredCount: 1230,
    failedCount: 18,
    createdBy: 'admin',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    title: 'New Feature: Photo Reviews',
    message: 'You can now upload before/after photos to showcase your work quality. Try it on your next job!',
    type: 'account_update',
    targetSegment: 'workers',
    channels: ['push', 'email', 'in_app'],
    status: 'sent',
    sentCount: 643,
    deliveredCount: 628,
    failedCount: 15,
    createdBy: 'admin',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    sentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    title: 'Weekend Promo — 0% Fees',
    message: 'This weekend only: 0% platform fee on all completed jobs. Post a job or apply now!',
    type: 'account_update',
    targetSegment: 'all',
    channels: ['push', 'email', 'in_app'],
    status: 'scheduled',
    sentCount: 0,
    deliveredCount: 0,
    failedCount: 0,
    createdBy: 'admin',
    createdAt: new Date().toISOString(),
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
]

const TARGET_SEGMENTS = [
  { value: 'all', label: 'All users' },
  { value: 'workers', label: 'Workers only' },
  { value: 'employers', label: 'Employers only' },
]

const NOTIFICATION_TYPES: { value: NotificationType; label: string }[] = [
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'account_update', label: 'Account Update' },
  { value: 'security_alert', label: 'Security Alert' },
  { value: 'badge_unlocked', label: 'Achievement / Badge' },
  { value: 'new_job', label: 'Job Alert' },
]

const CHANNEL_OPTIONS: { value: NotificationChannel; label: string; icon: string }[] = [
  { value: 'in_app', label: 'In-App', icon: '🔔' },
  { value: 'push', label: 'Push', icon: '📱' },
  { value: 'email', label: 'Email', icon: '📧' },
  { value: 'sms', label: 'SMS', icon: '💬' },
]

function StatusBadge({ status }: { status: AdminNotificationRequest['status'] }) {
  const cfg = {
    sent: { cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: <CheckCircle className="h-3 w-3" />, label: 'Sent' },
    scheduled: { cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: <Clock className="h-3 w-3" />, label: 'Scheduled' },
    draft: { cls: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300', icon: null, label: 'Draft' },
    cancelled: { cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: <XCircle className="h-3 w-3" />, label: 'Cancelled' },
  }[status]
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${cfg.cls}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  )
}

interface ComposedNotification {
  title: string
  message: string
  type: NotificationType
  targetSegment: 'all' | 'workers' | 'employers'
  channels: NotificationChannel[]
  scheduledAt: string
}

export default function AdminNotificationsPage() {
  const { profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<AdminNotificationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [showCompose, setShowCompose] = useState(false)
  const [sending, setSending] = useState(false)
  const [useMock, setUseMock] = useState(false)

  const [composed, setComposed] = useState<ComposedNotification>({
    title: '',
    message: '',
    type: 'account_update',
    targetSegment: 'all',
    channels: ['in_app', 'push', 'email'],
    scheduledAt: '',
  })

  useEffect(() => {
    if (!authLoading && profile?.role !== 'admin') router.push('/dashboard')
  }, [profile, authLoading, router])

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getAdminNotifications()
      if (data.length === 0) {
        setUseMock(true)
        setNotifications(MOCK_ADMIN_NOTIFICATIONS)
      } else {
        setNotifications(data)
      }
    } catch {
      setUseMock(true)
      setNotifications(MOCK_ADMIN_NOTIFICATIONS)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleSend = async (schedule = false) => {
    if (!composed.title.trim() || !composed.message.trim()) {
      toast.error('Please fill in title and message')
      return
    }
    try {
      setSending(true)
      const req: Omit<AdminNotificationRequest, 'id' | 'createdAt'> = {
        title: composed.title,
        message: composed.message,
        type: composed.type,
        targetSegment: composed.targetSegment,
        channels: composed.channels,
        status: schedule ? 'scheduled' : 'sent',
        scheduledAt: schedule && composed.scheduledAt ? composed.scheduledAt : undefined,
        sentAt: schedule ? undefined : new Date().toISOString(),
        sentCount: 0,
        deliveredCount: 0,
        failedCount: 0,
        createdBy: profile?.uid ?? 'admin',
      }

      if (!useMock) {
        await createAdminNotification(req)
        await load()
      } else {
        const newNotif: AdminNotificationRequest = { id: Date.now().toString(), ...req, createdAt: new Date().toISOString() }
        setNotifications((p) => [newNotif, ...p])
      }

      toast.success(schedule ? 'Notification scheduled!' : 'Notification sent!')
      setShowCompose(false)
      setComposed({ title: '', message: '', type: 'account_update', targetSegment: 'all', channels: ['in_app', 'push', 'email'], scheduledAt: '' })
    } catch {
      toast.error('Failed to send notification')
    } finally {
      setSending(false)
    }
  }

  const handleCancel = async (id: string) => {
    if (!useMock) await updateAdminNotification(id, { status: 'cancelled' })
    setNotifications((p) => p.map((n) => n.id === id ? { ...n, status: 'cancelled' } : n))
    toast.success('Notification cancelled')
  }

  const totalSent = notifications.reduce((s, n) => s + (n.sentCount ?? 0), 0)
  const totalDelivered = notifications.reduce((s, n) => s + (n.deliveredCount ?? 0), 0)
  const totalFailed = notifications.reduce((s, n) => s + (n.failedCount ?? 0), 0)
  const deliveryRate = totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 0

  if (authLoading || (profile?.role !== 'admin' && !authLoading)) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Megaphone className="h-6 w-6 text-primary-600" />
              Notification Management
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Send and manage system-wide notifications
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={load} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={() => setShowCompose(true)}>
              <Plus className="h-4 w-4 mr-1.5" />
              New Notification
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Sent', value: totalSent.toLocaleString(), icon: <Send className="h-5 w-5 text-blue-500" />, color: 'bg-blue-50 dark:bg-blue-900/20' },
            { label: 'Delivered', value: totalDelivered.toLocaleString(), icon: <CheckCircle className="h-5 w-5 text-green-500" />, color: 'bg-green-50 dark:bg-green-900/20' },
            { label: 'Failed', value: totalFailed.toLocaleString(), icon: <XCircle className="h-5 w-5 text-red-500" />, color: 'bg-red-50 dark:bg-red-900/20' },
            { label: 'Delivery Rate', value: `${deliveryRate}%`, icon: <BarChart2 className="h-5 w-5 text-purple-500" />, color: 'bg-purple-50 dark:bg-purple-900/20' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className={`inline-flex p-2 rounded-lg mb-2 ${stat.color}`}>{stat.icon}</div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Compose Modal */}
        {showCompose && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary-600" />
                  Compose Notification
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                    <input
                      type="text"
                      value={composed.title}
                      onChange={(e) => setComposed((p) => ({ ...p, title: e.target.value }))}
                      placeholder="Notification title..."
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
                    <textarea
                      value={composed.message}
                      onChange={(e) => setComposed((p) => ({ ...p, message: e.target.value }))}
                      placeholder="Notification body..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                      <select
                        value={composed.type}
                        onChange={(e) => setComposed((p) => ({ ...p, type: e.target.value as NotificationType }))}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        {NOTIFICATION_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target</label>
                      <select
                        value={composed.targetSegment}
                        onChange={(e) => setComposed((p) => ({ ...p, targetSegment: e.target.value as 'all' | 'workers' | 'employers' }))}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        {TARGET_SEGMENTS.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Channels</label>
                    <div className="flex flex-wrap gap-2">
                      {CHANNEL_OPTIONS.map((ch) => (
                        <label key={ch.value} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm cursor-pointer border transition-colors ${
                          composed.channels.includes(ch.value)
                            ? 'bg-primary-100 border-primary-400 text-primary-700 dark:bg-primary-900/30 dark:border-primary-500 dark:text-primary-400'
                            : 'bg-white border-gray-200 text-gray-600 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300'
                        }`}>
                          <input
                            type="checkbox"
                            checked={composed.channels.includes(ch.value)}
                            onChange={(e) =>
                              setComposed((p) => ({
                                ...p,
                                channels: e.target.checked
                                  ? [...p.channels, ch.value]
                                  : p.channels.filter((c) => c !== ch.value),
                              }))
                            }
                            className="sr-only"
                          />
                          <span>{ch.icon}</span>
                          {ch.label}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Schedule (optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={composed.scheduledAt}
                      onChange={(e) => setComposed((p) => ({ ...p, scheduledAt: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <Button variant="secondary" onClick={() => setShowCompose(false)}>
                    Cancel
                  </Button>
                  {composed.scheduledAt && (
                    <Button variant="secondary" onClick={() => handleSend(true)} disabled={sending}>
                      <Clock className="h-4 w-4 mr-1.5" />
                      Schedule
                    </Button>
                  )}
                  <Button onClick={() => handleSend(false)} disabled={sending}>
                    {sending ? <LoadingSpinner size="sm" /> : <Send className="h-4 w-4 mr-1.5" />}
                    Send now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notification History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="py-12 flex items-center justify-center">
                <LoadingSpinner size="md" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Notification</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Target</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Channels</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Sent</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Delivered</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {notifications.map((n) => (
                      <tr key={n.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900 dark:text-white">{n.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">{n.message}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                            <Users className="h-3 w-3" />
                            {TARGET_SEGMENTS.find((s) => s.value === n.targetSegment)?.label ?? n.targetSegment}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            {n.channels.map((ch) => (
                              <span key={ch} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded">
                                {CHANNEL_OPTIONS.find((c) => c.value === ch)?.icon ?? ch}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-gray-900 dark:text-white font-medium">
                          {(n.sentCount ?? 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-green-600 dark:text-green-400 font-medium">
                            {(n.deliveredCount ?? 0).toLocaleString()}
                          </span>
                          {(n.failedCount ?? 0) > 0 && (
                            <span className="text-red-500 text-xs ml-1">(-{n.failedCount})</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={n.status} />
                        </td>
                        <td className="px-4 py-3">
                          {n.status === 'scheduled' && (
                            <button
                              onClick={() => handleCancel(n.id!)}
                              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                              title="Cancel"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {useMock && (
          <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">
            Showing demo data — connect Firebase to manage real notifications
          </p>
        )}
      </main>
      <Footer />
    </div>
  )
}
