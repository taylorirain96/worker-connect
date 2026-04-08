'use client'
import { useState, useEffect, useCallback } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import { useRouter } from 'next/navigation'
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  clearAllNotifications,
  getNotificationsByCategory,
} from '@/lib/notifications/firebase'
import NotificationItem from '@/components/NotificationItem'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Button from '@/components/ui/Button'
import { Bell, CheckCheck, Trash2, Settings, Filter } from 'lucide-react'
import Link from 'next/link'
import type { Notification, NotificationCategory } from '@/types'
import type { QueryDocumentSnapshot } from 'firebase/firestore'

const CATEGORIES: { id: 'all' | NotificationCategory; label: string; icon: string }[] = [
  { id: 'all', label: 'All', icon: '🔔' },
  { id: 'jobs', label: 'Jobs', icon: '💼' },
  { id: 'messages', label: 'Messages', icon: '💬' },
  { id: 'payments', label: 'Payments', icon: '💰' },
  { id: 'reviews', label: 'Reviews', icon: '⭐' },
  { id: 'verification', label: 'Verification', icon: '✅' },
  { id: 'gamification', label: 'Achievements', icon: '🏆' },
  { id: 'system', label: 'System', icon: '⚙️' },
]

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: '1', userId: 'demo', type: 'new_job', category: 'jobs', title: 'New Job Available', message: 'A new plumbing job in your area was posted: "Emergency pipe repair needed"', read: false, actionUrl: '/jobs/1', jobId: '1', createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString() },
  { id: '2', userId: 'demo', type: 'payment_received', category: 'payments', title: 'Payment Received', message: 'You received $450.00 for "Kitchen renovation - electrical work"', read: false, actionUrl: '/payments', createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
  { id: '3', userId: 'demo', type: 'review_received', category: 'reviews', title: 'New Review', message: 'John Smith left you a 5-star review for your recent work!', read: true, actionUrl: '/profile', createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() },
  { id: '4', userId: 'demo', type: 'badge_unlocked', category: 'gamification', title: 'Badge Unlocked! 🏆', message: 'You unlocked the "Top Rated" badge for maintaining a 4.8+ rating!', read: true, actionUrl: '/profile', createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
  { id: '5', userId: 'demo', type: 'verification_approved', category: 'verification', title: 'Verification Approved', message: 'Your license verification has been approved. Your profile now shows a verified badge!', read: true, actionUrl: '/profile', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '6', userId: 'demo', type: 'new_message', category: 'messages', title: 'New Message', message: 'Sarah Johnson: Hi, I saw your profile and would like to discuss a project...', read: false, actionUrl: '/messages', createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
  { id: '7', userId: 'demo', type: 'milestone_reached', category: 'gamification', title: 'Milestone Reached! 🎉', message: 'Congratulations! You completed your 50th job on QuickTrade!', read: true, actionUrl: '/earnings', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '8', userId: 'demo', type: 'security_alert', category: 'system', title: 'Security Alert', message: 'A new device signed in to your account. If this was you, you can ignore this.', read: true, actionUrl: '/settings', createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
]

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<'all' | NotificationCategory>('all')
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [useMock, setUseMock] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/login')
  }, [user, authLoading, router])

  const loadNotifications = useCallback(async (category: 'all' | NotificationCategory, reset = true) => {
    if (!user) return
    try {
      if (reset) setLoading(true)
      else setLoadingMore(true)

      let result: Notification[]
      let nextDoc: QueryDocumentSnapshot | null = null

      if (category === 'all') {
        const res = await getNotifications(user.uid, 20, reset ? undefined : lastDoc ?? undefined)
        result = res.notifications
        nextDoc = res.lastDoc
      } else {
        result = await getNotificationsByCategory(user.uid, category)
      }

      if (result.length === 0 && reset) {
        setUseMock(true)
        result = MOCK_NOTIFICATIONS.filter(n => category === 'all' || n.category === category)
      }

      if (reset) setNotifications(result)
      else setNotifications((prev) => [...prev, ...result])
      setLastDoc(nextDoc)
      setHasMore(nextDoc !== null && result.length === 20)
    } catch {
      setUseMock(true)
      setNotifications(MOCK_NOTIFICATIONS.filter(n => category === 'all' || n.category === category))
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [user, lastDoc])

  useEffect(() => {
    if (user) loadNotifications(selectedCategory, true)
  }, [user, selectedCategory]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleMarkRead = async (id: string) => {
    if (!useMock && user) await markNotificationRead(id)
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const handleMarkAllRead = async () => {
    if (!useMock && user) await markAllNotificationsRead(user.uid)
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const handleDelete = async (id: string) => {
    if (!useMock && user) await deleteNotification(id)
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const handleClearAll = async () => {
    if (!useMock && user) await clearAllNotifications(user.uid)
    setNotifications([])
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Bell className="h-6 w-6 text-primary-600" />
              Notifications
              {unreadCount > 0 && (
                <span className="text-sm bg-red-500 text-white px-2 py-0.5 rounded-full font-medium">
                  {unreadCount} unread
                </span>
              )}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Your recent activity and alerts
            </p>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="secondary" size="sm" onClick={handleMarkAllRead}>
                <CheckCheck className="h-4 w-4 mr-1.5" />
                Mark all read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button variant="secondary" size="sm" onClick={handleClearAll} className="text-red-600 hover:text-red-700">
                <Trash2 className="h-4 w-4 mr-1.5" />
                Clear all
              </Button>
            )}
            <Link href="/settings/notifications">
              <Button variant="secondary" size="sm">
                <Settings className="h-4 w-4 mr-1.5" />
                Settings
              </Button>
            </Link>
          </div>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary-400'
              }`}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Notification list */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="py-16 flex items-center justify-center">
              <LoadingSpinner size="md" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-16 text-center">
              <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">No notifications</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                {selectedCategory !== 'all' ? 'No notifications in this category yet.' : "You're all caught up!"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {notifications.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onMarkRead={handleMarkRead}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>

        {/* Load more */}
        {hasMore && !loading && (
          <div className="mt-4 text-center">
            <Button
              variant="secondary"
              onClick={() => loadNotifications(selectedCategory, false)}
              disabled={loadingMore}
            >
              {loadingMore ? <LoadingSpinner size="sm" /> : 'Load more'}
            </Button>
          </div>
        )}

        {useMock && (
          <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">
            <Filter className="h-3 w-3 inline mr-1" />
            Showing demo notifications — connect Firebase to see real data
          </p>
        )}
      </main>
      <Footer />
    </div>
  )
}
