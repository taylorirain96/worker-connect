'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import { getUserProfile } from '@/lib/users/getProfile'
import FavouriteButton from '@/components/workers/FavouriteButton'
import { MapPin, Star, CheckCircle, Briefcase, Heart, X, Calendar, ArrowLeft, Send } from 'lucide-react'
import { getInitials } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { UserProfile } from '@/types'

// ─── Quick Rebook Modal ───────────────────────────────────────────────────────

interface RebookModalProps {
  worker: UserProfile
  homeownerId: string
  onClose: () => void
}

function RebookModal({ worker, homeownerId, onClose }: RebookModalProps) {
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [address, setAddress] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim() || !date || !address.trim()) {
      toast.error('Please fill in all fields')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/jobs/direct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': homeownerId,
        },
        body: JSON.stringify({
          workerId: worker.uid,
          description: description.trim(),
          date,
          address: address.trim(),
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as { error?: string }).error ?? 'Request failed')
      }
      toast.success(`Request sent to ${worker.displayName ?? 'the worker'}! They'll be in touch soon.`)
      onClose()
    } catch (err) {
      console.error('Rebook request failed:', err)
      toast.error('Could not send request. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            {worker.photoURL ? (
              <Image
                src={worker.photoURL}
                alt={worker.displayName ?? 'Worker'}
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-sm font-bold">
                {getInitials(worker.displayName ?? 'W')}
              </div>
            )}
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white text-sm">
                Request {worker.displayName ?? 'Worker'}
              </h2>
              {worker.skills && worker.skills.length > 0 && (
                <p className="text-xs text-gray-500 capitalize">{worker.skills[0]}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              What do you need done? <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="e.g. Fix the leaking tap in the kitchen, replace the washer…"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Date needed <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 12 Sample Street, Auckland"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <p className="text-xs text-gray-400">
            This request goes directly to {worker.displayName ?? 'the worker'} — it won&apos;t be posted publicly.
          </p>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white transition-colors"
            >
              <Send className="h-3.5 w-3.5" />
              {submitting ? 'Sending…' : 'Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Favourite Worker Card ─────────────────────────────────────────────────────

interface FavouriteWorkerCardProps {
  worker: UserProfile
  onRemove: (uid: string) => void
  onRebook: (worker: UserProfile) => void
}

function FavouriteWorkerCard({ worker, onRemove, onRebook }: FavouriteWorkerCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex flex-col hover:shadow-md transition-shadow">
      <Link href={`/workers/${worker.uid}`} className="flex-1">
        <div className="flex items-start gap-3 mb-3">
          <div className="relative flex-shrink-0">
            {worker.photoURL ? (
              <Image
                src={worker.photoURL}
                alt={worker.displayName ?? 'Worker'}
                width={52}
                height={52}
                className="h-13 w-13 rounded-full object-cover"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-base font-bold">
                {getInitials(worker.displayName ?? 'W')}
              </div>
            )}
            {worker.availability === 'available' && (
              <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate text-sm">
                {worker.displayName ?? 'Worker'}
              </h3>
              {worker.verified && (
                <CheckCircle className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" aria-label="Verified" />
              )}
            </div>
            {worker.skills && worker.skills.length > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 capitalize">
                {worker.skills.slice(0, 2).join(' · ')}
              </p>
            )}
            <div className="flex items-center gap-3 mt-1">
              {worker.rating !== undefined && (
                <div className="flex items-center gap-0.5 text-xs">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium text-gray-700 dark:text-gray-300">{worker.rating.toFixed(1)}</span>
                  <span className="text-gray-400">({worker.reviewCount ?? 0})</span>
                </div>
              )}
              {worker.completedJobs !== undefined && (
                <div className="flex items-center gap-0.5 text-xs text-gray-500">
                  <Briefcase className="h-3 w-3" />
                  {worker.completedJobs} jobs
                </div>
              )}
            </div>
            {worker.location && (
              <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                <MapPin className="h-3 w-3" />
                {worker.location}
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={() => onRebook(worker)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary-600 hover:bg-primary-700 text-white transition-colors"
        >
          <Calendar className="h-3.5 w-3.5" />
          Rebook
        </button>
        <FavouriteButton
          workerId={worker.uid}
          initialFavourited={true}
          onToggle={(fav) => { if (!fav) onRemove(worker.uid) }}
          size="sm"
        />
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomeownerFavouritesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [workers, setWorkers] = useState<UserProfile[]>([])
  const [fetching, setFetching] = useState(true)
  const [rebookWorker, setRebookWorker] = useState<UserProfile | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [loading, user, router])

  useEffect(() => {
    if (!user?.uid) return

    const load = async () => {
      setFetching(true)
      try {
        const res = await fetch('/api/favourites', {
          headers: { 'x-user-id': user.uid },
        })
        const data = await res.json() as { favourites?: string[] }
        const ids: string[] = data.favourites ?? []

        if (ids.length === 0) {
          setWorkers([])
          return
        }

        // Fetch all worker profiles in parallel
        const profiles = await Promise.all(ids.map((id) => getUserProfile(id)))
        const valid = profiles.filter((p): p is UserProfile => p !== null && p.role === 'worker')
        setWorkers(valid)
      } catch {
        toast.error('Could not load your favourites')
      } finally {
        setFetching(false)
      }
    }

    load()
  }, [user])

  const handleRemove = useCallback((uid: string) => {
    setWorkers((prev) => prev.filter((w) => w.uid !== uid))
  }, [])

  if (loading || fetching) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-8" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-52 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950">
      {rebookWorker && user && (
        <RebookModal
          worker={rebookWorker}
          homeownerId={user.uid}
          onClose={() => setRebookWorker(null)}
        />
      )}

      <Navbar />
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back link */}
          <Link
            href="/dashboard/homeowner"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6 text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Heart className="h-6 w-6 text-rose-500 fill-rose-500" />
                My Favourite Tradies
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Save workers you trust and rebook them quickly
              </p>
            </div>
            <Link
              href="/workers"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-colors"
            >
              Browse Tradies
            </Link>
          </div>

          {/* Empty state */}
          {workers.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
              <div className="mx-auto h-14 w-14 rounded-full bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center mb-4">
                <Heart className="h-7 w-7 text-rose-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No favourites yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto mb-6">
                You haven&apos;t saved any workers yet — browse tradies to find someone you like and tap the heart icon.
              </p>
              <Link
                href="/workers"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-primary-600 hover:bg-primary-700 text-white transition-colors"
              >
                Browse Tradies
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {workers.map((worker) => (
                <FavouriteWorkerCard
                  key={worker.uid}
                  worker={worker}
                  onRemove={handleRemove}
                  onRebook={setRebookWorker}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
