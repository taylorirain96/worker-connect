'use client'
import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Card, CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { useAuth } from '@/components/providers/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import {
  Camera,
  CheckCircle,
  AlertTriangle,
  Clock,
  Flag,
  Star,
} from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import type { JobPhoto } from '@/types'

// Mock data for admin photo moderation
const MOCK_PENDING_PHOTOS: JobPhoto[] = [
  {
    id: 'p1',
    jobId: 'j1',
    workerId: 'w1',
    workerName: 'Alex Rivera',
    url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    caption: 'Bathroom pipe repair — before',
    type: 'before',
    approvalStatus: 'pending',
    uploadedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    fileSize: 1_234_567,
  },
  {
    id: 'p2',
    jobId: 'j1',
    workerId: 'w1',
    workerName: 'Alex Rivera',
    url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400',
    caption: 'Bathroom pipe repair — after',
    type: 'after',
    approvalStatus: 'pending',
    uploadedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    fileSize: 987_654,
  },
  {
    id: 'p3',
    jobId: 'j2',
    workerId: 'w2',
    workerName: 'Jordan Kim',
    url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400',
    caption: 'Electrical panel installation progress',
    type: 'progress',
    approvalStatus: 'pending',
    uploadedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    fileSize: 2_100_000,
  },
]

const MOCK_STATS = {
  pending: 14,
  approved: 342,
  flagged: 3,
  totalToday: 28,
}

export default function AdminPhotosPage() {
  const { profile, loading } = useAuth()
  const router = useRouter()
  const [photos, setPhotos] = useState<JobPhoto[]>(MOCK_PENDING_PHOTOS)
  const [filter, setFilter] = useState<'pending' | 'approved' | 'flagged'>('pending')

  useEffect(() => {
    if (!loading && profile?.role !== 'admin') {
      router.push('/dashboard')
    }
  }, [profile, loading, router])

  if (loading || profile?.role !== 'admin') return null

  const handleApprove = async (photoId: string) => {
    // In a real app: await updatePhotoStatus(photoId, 'approved', score)
    setPhotos((prev) =>
      prev.map((p) => (p.id === photoId ? { ...p, approvalStatus: 'approved', qualityScore: 85 } : p))
    )
  }

  const handleFlag = async (photoId: string) => {
    // In a real app: await updatePhotoStatus(photoId, 'flagged')
    setPhotos((prev) =>
      prev.map((p) => (p.id === photoId ? { ...p, approvalStatus: 'flagged' } : p))
    )
  }

  const displayedPhotos = photos.filter((p) => p.approvalStatus === filter)

  const stats = [
    { label: 'Pending Review', value: MOCK_STATS.pending, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
    { label: 'Approved', value: MOCK_STATS.approved, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
    { label: 'Flagged', value: MOCK_STATS.flagged, icon: Flag, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' },
    { label: 'Uploaded Today', value: MOCK_STATS.totalToday, icon: Camera, color: 'text-primary-600', bg: 'bg-primary-100 dark:bg-primary-900/30' },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Camera className="h-6 w-6 text-primary-600" />
              Photo Moderation
            </h1>
            <p className="text-gray-500 mt-1">Review and approve worker-submitted job photos</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map(({ label, value, icon: Icon, color, bg }) => (
              <Card key={label} padding="md">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
                    <p className="text-xs text-gray-500">{label}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 mb-6">
            {(['pending', 'approved', 'flagged'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                  filter === tab
                    ? 'bg-primary-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Photo grid */}
          {displayedPhotos.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Camera className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p>No {filter} photos</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedPhotos.map((photo) => (
                <Card key={photo.id} className="overflow-hidden">
                  <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.url}
                      alt={photo.caption}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 flex gap-1.5">
                      <span className="text-xs font-medium bg-black/60 text-white px-2 py-0.5 rounded capitalize">
                        {photo.type}
                      </span>
                      {photo.approvalStatus === 'flagged' && (
                        <span className="text-xs font-medium bg-red-600/80 text-white px-2 py-0.5 rounded flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Flagged
                        </span>
                      )}
                      {photo.qualityScore && (
                        <span className="text-xs font-medium bg-green-600/80 text-white px-2 py-0.5 rounded flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          {photo.qualityScore}
                        </span>
                      )}
                    </div>
                  </div>
                  <CardContent className="py-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {photo.caption || 'No caption'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      By <strong>{photo.workerName}</strong> · Job #{photo.jobId}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(photo.uploadedAt)}</p>

                    {photo.approvalStatus === 'pending' && (
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(photo.id)}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleFlag(photo.id)}
                          className="flex-1"
                        >
                          <Flag className="h-3.5 w-3.5" />
                          Flag
                        </Button>
                      </div>
                    )}

                    {photo.approvalStatus === 'approved' && (
                      <Badge variant="success" className="mt-3 text-xs">
                        ✓ Approved
                      </Badge>
                    )}
                    {photo.approvalStatus === 'flagged' && (
                      <Badge variant="danger" className="mt-3 text-xs">
                        ⚑ Flagged
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
