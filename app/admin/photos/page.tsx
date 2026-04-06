'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { getAllPhotos, moderatePhoto } from '@/lib/photos/firebase'
import { Camera, CheckCircle2, Flag, Clock, User, Search } from 'lucide-react'
import { formatRelativeDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { JobPhoto } from '@/types'

type FilterStatus = 'all' | 'pending' | 'approved' | 'flagged'

const STATUS_BADGE: Record<JobPhoto['approvalStatus'], { label: string; variant: 'warning' | 'success' | 'danger' }> = {
  pending: { label: 'Pending', variant: 'warning' },
  approved: { label: 'Approved', variant: 'success' },
  flagged: { label: 'Flagged', variant: 'danger' },
}

const TYPE_BADGE: Record<JobPhoto['type'], { label: string; variant: 'warning' | 'success' | 'info' }> = {
  before: { label: 'Before', variant: 'warning' },
  after: { label: 'After', variant: 'success' },
  progress: { label: 'Progress', variant: 'info' },
}

export default function AdminPhotosPage() {
  const [photos, setPhotos] = useState<JobPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [search, setSearch] = useState('')
  const [moderating, setModerating] = useState<string | null>(null)
  const [noteModal, setNoteModal] = useState<{ photoId: string; action: 'approved' | 'flagged' } | null>(null)
  const [moderatorNote, setModeratorNote] = useState('')

  useEffect(() => {
    getAllPhotos().then((data) => {
      setPhotos(data)
      setLoading(false)
    })
  }, [])

  const filtered = photos.filter((p) => {
    if (filter !== 'all' && p.approvalStatus !== filter) return false
    if (search) {
      const s = search.toLowerCase()
      return (
        p.workerName.toLowerCase().includes(s) ||
        p.caption.toLowerCase().includes(s) ||
        p.jobId.includes(s)
      )
    }
    return true
  })

  const handleModerate = async (photoId: string, status: 'approved' | 'flagged', note?: string) => {
    setModerating(photoId)
    try {
      await moderatePhoto(photoId, status, note)
      setPhotos((prev) =>
        prev.map((p) =>
          p.id === photoId ? { ...p, approvalStatus: status, moderatorNote: note } : p
        )
      )
      toast.success(`Photo ${status === 'approved' ? 'approved' : 'flagged'}.`)
    } catch {
      toast.error('Moderation failed.')
    } finally {
      setModerating(null)
      setNoteModal(null)
      setModeratorNote('')
    }
  }

  const counts: Record<FilterStatus, number> = {
    all: photos.length,
    pending: photos.filter((p) => p.approvalStatus === 'pending').length,
    approved: photos.filter((p) => p.approvalStatus === 'approved').length,
    flagged: photos.filter((p) => p.approvalStatus === 'flagged').length,
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <Camera className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Photo Moderation</h1>
              <p className="text-sm text-gray-500">Review and approve job photos submitted by workers</p>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {(['all', 'pending', 'approved', 'flagged'] as FilterStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`p-4 rounded-xl border text-left transition-colors ${
                  filter === s
                    ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300'
                }`}
              >
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{counts[s]}</p>
                <p className="text-xs text-gray-500 capitalize">{s}</p>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative mb-5">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by worker, caption, or job ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Photo grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-400">
              <div className="animate-spin h-8 w-8 border-2 border-primary-500 border-t-transparent rounded-full" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Camera className="h-10 w-10 mb-2 opacity-40" />
              <p className="text-sm">No photos found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((photo) => (
                <div
                  key={photo.id}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  {/* Image */}
                  <div className="relative aspect-video bg-gray-100 dark:bg-gray-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.thumbnailUrl || photo.url}
                      alt={photo.caption || 'Job photo'}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute top-2 left-2 flex gap-1">
                      <Badge variant={TYPE_BADGE[photo.type].variant} className="text-[10px]">
                        {TYPE_BADGE[photo.type].label}
                      </Badge>
                      <Badge variant={STATUS_BADGE[photo.approvalStatus].variant} className="text-[10px]">
                        {STATUS_BADGE[photo.approvalStatus].label}
                      </Badge>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="p-3">
                    <p className="text-sm text-gray-900 dark:text-white font-medium line-clamp-1 mb-1">
                      {photo.caption || <span className="italic text-gray-400">No caption</span>}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {photo.workerName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatRelativeDate(photo.createdAt)}
                      </span>
                    </div>

                    {photo.moderatorNote && (
                      <p className="text-xs text-yellow-600 dark:text-yellow-400 italic mb-2 line-clamp-1">
                        Note: {photo.moderatorNote}
                      </p>
                    )}

                    {/* Actions */}
                    {photo.approvalStatus !== 'approved' && (
                      <Button
                        size="sm"
                        variant="primary"
                        className="w-full mb-2"
                        loading={moderating === photo.id}
                        onClick={() => handleModerate(photo.id, 'approved')}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Approve
                      </Button>
                    )}
                    {photo.approvalStatus !== 'flagged' && (
                      <Button
                        size="sm"
                        variant="danger"
                        className="w-full"
                        loading={moderating === photo.id}
                        onClick={() => setNoteModal({ photoId: photo.id, action: 'flagged' })}
                      >
                        <Flag className="h-3.5 w-3.5" />
                        Flag
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* Flag note modal */}
      {noteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          onClick={() => setNoteModal(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-sm shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
              Flag Photo
            </h2>
            <textarea
              rows={3}
              value={moderatorNote}
              onChange={(e) => setModeratorNote(e.target.value)}
              placeholder="Reason for flagging (optional)…"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
            />
            <div className="flex gap-3">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setNoteModal(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                className="flex-1"
                loading={moderating === noteModal.photoId}
                onClick={() => handleModerate(noteModal.photoId, 'flagged', moderatorNote)}
              >
                Confirm Flag
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
