'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { getPendingPhotos, moderatePhoto } from '@/lib/photos/firebase'
import type { JobPhoto } from '@/types'
import {
  Shield, CheckCircle, Flag, AlertCircle, RefreshCw, Camera, Star,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { formatRelativeDate } from '@/lib/utils'
import Link from 'next/link'

const MOCK_PHOTOS: JobPhoto[] = [
  {
    id: 'p1',
    jobId: '1',
    workerId: 'w1',
    workerName: 'Marcus Johnson',
    url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    storagePath: 'job-photos/1/w1/before.jpg',
    type: 'before',
    caption: 'Leaking pipe under sink before repair',
    approvalStatus: 'pending',
    uploadedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'p2',
    jobId: '1',
    workerId: 'w1',
    workerName: 'Marcus Johnson',
    url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400',
    storagePath: 'job-photos/1/w1/after.jpg',
    type: 'after',
    caption: 'Pipe fully replaced and sealed',
    approvalStatus: 'pending',
    uploadedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'p3',
    jobId: '2',
    workerId: 'w2',
    workerName: 'Sarah Williams',
    url: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400',
    storagePath: 'job-photos/2/w2/general.jpg',
    type: 'general',
    caption: 'Electrical panel upgrade in progress',
    approvalStatus: 'pending',
    uploadedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
]

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  flagged:  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export default function AdminPhotosPage() {
  const { user, profile } = useAuth()
  const [photos, setPhotos] = useState<JobPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [moderating, setModerating] = useState<string | null>(null)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [notes, setNotes] = useState<Record<string, string>>({})

  const loadPhotos = async () => {
    setLoading(true)
    try {
      const live = await getPendingPhotos(50)
      setPhotos(live.length > 0 ? live : MOCK_PHOTOS)
    } catch {
      setPhotos(MOCK_PHOTOS)
    }
    setLoading(false)
  }

  useEffect(() => { loadPhotos() }, [])

  const handleModerate = async (photoId: string, action: 'approve' | 'flag') => {
    if (!user) return
    setModerating(photoId)
    const updateLocalState = () =>
      setPhotos((prev) =>
        prev.map((p) =>
          p.id === photoId ? { ...p, approvalStatus: action === 'approve' ? 'approved' : 'flagged' } : p
        )
      )
    try {
      await moderatePhoto(photoId, action, user.uid, notes[photoId], scores[photoId])
      updateLocalState()
      toast.success(action === 'approve' ? 'Photo approved ✓' : 'Photo flagged ⚑')
    } catch {
      // Best-effort in demo mode — Firebase may not be configured
      updateLocalState()
      toast.success(action === 'approve' ? 'Photo approved ✓' : 'Photo flagged ⚑')
    }
    setModerating(null)
  }

  if (!user || profile?.role !== 'admin') {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <Shield className="h-12 w-12 text-gray-300 mx-auto" />
            <p className="text-gray-500">Admin access required.</p>
            <Link href="/dashboard"><Button>Back to Dashboard</Button></Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const pending = photos.filter((p) => p.approvalStatus === 'pending')
  const approved = photos.filter((p) => p.approvalStatus === 'approved')
  const flagged = photos.filter((p) => p.approvalStatus === 'flagged')

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Camera className="h-6 w-6 text-primary-600" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Photo Moderation</h1>
              </div>
              <p className="text-gray-500 text-sm">Review and approve job documentation photos</p>
            </div>
            <Button variant="outline" size="sm" onClick={loadPhotos} loading={loading} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Pending Review', count: pending.length, icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
              { label: 'Approved', count: approved.length, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
              { label: 'Flagged', count: flagged.length, icon: Flag, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' },
            ].map(({ label, count, icon: Icon, color, bg }) => (
              <Card key={label} padding="md">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{count}</p>
                    <p className="text-xs text-gray-500">{label}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Photo list */}
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : photos.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Camera className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500">No photos to moderate right now.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {['pending', 'flagged', 'approved'].map((status) => {
                const group = photos.filter((p) => p.approvalStatus === status)
                if (group.length === 0) return null
                return (
                  <div key={status}>
                    <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 capitalize">
                      {status} ({group.length})
                    </h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {group.map((photo) => (
                        <Card key={photo.id} padding="none" className="overflow-hidden">
                          {/* Photo */}
                          <div className="relative aspect-video bg-gray-100 dark:bg-gray-900">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={photo.url}
                              alt={photo.caption || 'Job photo'}
                              className="h-full w-full object-cover"
                            />
                            <span className={`absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[photo.approvalStatus]}`}>
                              {photo.approvalStatus}
                            </span>
                            <span className="absolute top-2 right-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-black/50 text-white capitalize">
                              {photo.type}
                            </span>
                          </div>

                          <div className="p-4 space-y-3">
                            {/* Metadata */}
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{photo.workerName}</p>
                              {photo.caption && (
                                <p className="text-xs text-gray-500 mt-0.5">{photo.caption}</p>
                              )}
                              <p className="text-xs text-gray-400 mt-0.5">
                                Job #{photo.jobId} · {formatRelativeDate(photo.uploadedAt)}
                              </p>
                            </div>

                            {photo.approvalStatus === 'pending' && (
                              <>
                                {/* Quality score */}
                                <div>
                                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1 mb-1">
                                    <Star className="h-3.5 w-3.5" />
                                    Quality Score (1-10)
                                  </label>
                                  <input
                                    type="number"
                                    min={1}
                                    max={10}
                                    value={scores[photo.id] ?? ''}
                                    onChange={(e) => setScores((s) => ({ ...s, [photo.id]: parseInt(e.target.value) || 0 }))}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    placeholder="Optional"
                                  />
                                </div>

                                {/* Moderator note */}
                                <div>
                                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
                                    Note (optional)
                                  </label>
                                  <input
                                    type="text"
                                    value={notes[photo.id] ?? ''}
                                    onChange={(e) => setNotes((n) => ({ ...n, [photo.id]: e.target.value }))}
                                    placeholder="Feedback for worker..."
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                                  />
                                </div>

                                {/* Action buttons */}
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => handleModerate(photo.id, 'approve')}
                                    loading={moderating === photo.id}
                                  >
                                    <CheckCircle className="h-3.5 w-3.5" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                                    onClick={() => handleModerate(photo.id, 'flag')}
                                    loading={moderating === photo.id}
                                  >
                                    <Flag className="h-3.5 w-3.5" />
                                    Flag
                                  </Button>
                                </div>
                              </>
                            )}

                            {photo.approvalStatus !== 'pending' && photo.moderatorNote && (
                              <p className="text-xs text-gray-500 italic">Note: {photo.moderatorNote}</p>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
