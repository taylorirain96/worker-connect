'use client'
import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { createAdminNotification } from '@/lib/notifications/firebase'
import { Send, Megaphone, Users, CheckCircle } from 'lucide-react'
import type { NotificationType, NotificationChannel } from '@/types'

interface BroadcastForm {
  title: string
  message: string
  type: NotificationType
  targetSegment: 'all' | 'workers' | 'employers' | 'specific'
  specificUserIds: string
  channels: NotificationChannel[]
  scheduledAt: string
}

const TYPE_OPTIONS: { value: NotificationType; label: string }[] = [
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'account_update', label: 'Account Update' },
  { value: 'security_alert', label: 'Security Alert' },
  { value: 'new_job', label: 'New Job' },
  { value: 'badge_unlocked', label: 'Badge Unlocked' },
  { value: 'milestone_reached', label: 'Milestone' },
]

const CHANNEL_OPTIONS: { value: NotificationChannel; label: string }[] = [
  { value: 'in_app', label: 'In-App' },
  { value: 'push', label: 'Push' },
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
]

const SEGMENT_OPTIONS: { value: BroadcastForm['targetSegment']; label: string; icon: string }[] = [
  { value: 'all', label: 'All Users', icon: '🌐' },
  { value: 'workers', label: 'Workers Only', icon: '🔧' },
  { value: 'employers', label: 'Employers Only', icon: '🏢' },
  { value: 'specific', label: 'Specific Users', icon: '👤' },
]

interface AdminNotificationBroadcastProps {
  adminUserId: string
  onSent?: () => void
}

export default function AdminNotificationBroadcast({
  adminUserId,
  onSent,
}: AdminNotificationBroadcastProps) {
  const [form, setForm] = useState<BroadcastForm>({
    title: '',
    message: '',
    type: 'account_update',
    targetSegment: 'all',
    specificUserIds: '',
    channels: ['in_app', 'push'],
    scheduledAt: '',
  })
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleChannel = (ch: NotificationChannel) => {
    setForm((f) => ({
      ...f,
      channels: f.channels.includes(ch) ? f.channels.filter((c) => c !== ch) : [...f.channels, ch],
    }))
  }

  const handleSend = async () => {
    if (!form.title.trim() || !form.message.trim()) {
      setError('Title and message are required')
      return
    }
    if (form.channels.length === 0) {
      setError('Select at least one channel')
      return
    }
    try {
      setSending(true)
      setError(null)
      const targetUserIds =
        form.targetSegment === 'specific'
          ? form.specificUserIds
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined

      await createAdminNotification({
        title: form.title,
        message: form.message,
        type: form.type,
        targetSegment: form.targetSegment,
        targetUserIds,
        channels: form.channels,
        scheduledAt: form.scheduledAt || undefined,
        status: form.scheduledAt ? 'scheduled' : 'sent',
        sentAt: form.scheduledAt ? undefined : new Date().toISOString(),
        createdBy: adminUserId,
      })

      setSuccess(true)
      setForm({
        title: '',
        message: '',
        type: 'account_update',
        targetSegment: 'all',
        specificUserIds: '',
        channels: ['in_app', 'push'],
        scheduledAt: '',
      })
      setTimeout(() => setSuccess(false), 5000)
      onSent?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send notification')
    } finally {
      setSending(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-primary-600" />
          Send Broadcast Notification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {success && (
          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-700 dark:text-green-400 text-sm">
            <CheckCircle className="h-4 w-4 flex-shrink-0" />
            Notification broadcast successfully!
          </div>
        )}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="e.g. Platform Maintenance"
            maxLength={100}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <p className="text-xs text-gray-400 mt-0.5 text-right">{form.title.length}/100</p>
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Message <span className="text-red-500">*</span>
          </label>
          <textarea
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            placeholder="Write your broadcast message here..."
            rows={3}
            maxLength={500}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
          <p className="text-xs text-gray-400 mt-0.5 text-right">{form.message.length}/500</p>
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notification Type
          </label>
          <select
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as NotificationType }))}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Target segment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Users className="h-4 w-4 inline mr-1" />
            Target Audience
          </label>
          <div className="grid grid-cols-2 gap-2">
            {SEGMENT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setForm((f) => ({ ...f, targetSegment: opt.value }))}
                className={`flex items-center gap-2 p-2.5 rounded-lg border text-sm transition-colors ${
                  form.targetSegment === opt.value
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-primary-300'
                }`}
              >
                <span>{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>

          {form.targetSegment === 'specific' && (
            <div className="mt-2">
              <input
                type="text"
                value={form.specificUserIds}
                onChange={(e) => setForm((f) => ({ ...f, specificUserIds: e.target.value }))}
                placeholder="Comma-separated user IDs"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          )}
        </div>

        {/* Channels */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Channels
          </label>
          <div className="flex flex-wrap gap-2">
            {CHANNEL_OPTIONS.map((ch) => (
              <button
                key={ch.value}
                type="button"
                onClick={() => toggleChannel(ch.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  form.channels.includes(ch.value)
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-primary-400'
                }`}
              >
                {ch.label}
              </button>
            ))}
          </div>
        </div>

        {/* Schedule */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Schedule (optional)
          </label>
          <input
            type="datetime-local"
            value={form.scheduledAt}
            onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <p className="text-xs text-gray-400 mt-0.5">Leave empty to send immediately</p>
        </div>

        <Button onClick={handleSend} disabled={sending} className="w-full justify-center">
          {sending ? (
            <LoadingSpinner size="sm" />
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              {form.scheduledAt ? 'Schedule Notification' : 'Send Now'}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
