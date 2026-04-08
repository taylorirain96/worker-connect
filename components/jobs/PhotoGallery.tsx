'use client'
import { useState } from 'react'
import { Camera, Columns2 } from 'lucide-react'
import type { JobPhoto } from '@/types'
import PhotoLightbox from './PhotoLightbox'
import BeforeAfterSlider from './BeforeAfterSlider'
import Badge from '@/components/ui/Badge'

interface PhotoGalleryProps {
  photos: JobPhoto[]
  jobTitle?: string
  showComparisonTab?: boolean
}

const TYPE_LABELS: Record<string, string> = {
  before: 'Before',
  after: 'After',
  progress: 'Progress',
  other: 'Other',
}

const TYPE_COLORS: Record<string, string> = {
  before: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  after: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  other: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
}

export default function PhotoGallery({
  photos,
  jobTitle,
  showComparisonTab = true,
}: PhotoGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'gallery' | 'comparison'>('gallery')

  const approvedPhotos = photos.filter((p) => p.approvalStatus !== 'flagged')
  const beforePhotos = approvedPhotos.filter((p) => p.type === 'before')
  const afterPhotos = approvedPhotos.filter((p) => p.type === 'after')
  const hasComparison = beforePhotos.length > 0 && afterPhotos.length > 0

  if (approvedPhotos.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400">
        <Camera className="h-10 w-10 mx-auto mb-2 opacity-40" />
        <p className="text-sm">No photos available for this job.</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header / tabs */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-primary-600" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {jobTitle ? `${jobTitle} — ` : ''}Photos ({approvedPhotos.length})
          </h3>
        </div>

        {showComparisonTab && hasComparison && (
          <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden text-sm">
            <button
              onClick={() => setActiveTab('gallery')}
              className={`px-3 py-1.5 flex items-center gap-1.5 transition-colors ${
                activeTab === 'gallery'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Camera className="h-3.5 w-3.5" />
              Gallery
            </button>
            <button
              onClick={() => setActiveTab('comparison')}
              className={`px-3 py-1.5 flex items-center gap-1.5 transition-colors ${
                activeTab === 'comparison'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Columns2 className="h-3.5 w-3.5" />
              Compare
            </button>
          </div>
        )}
      </div>

      {/* Gallery grid */}
      {activeTab === 'gallery' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {approvedPhotos.map((photo, index) => (
            <button
              key={photo.id}
              className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
              onClick={() => setLightboxIndex(index)}
              aria-label={`View photo: ${photo.caption || `Photo ${index + 1}`}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.thumbnailUrl ?? photo.url}
                alt={photo.caption || `Photo ${index + 1}`}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
              {/* Type badge */}
              <span
                className={`absolute top-1.5 left-1.5 text-xs font-medium px-1.5 py-0.5 rounded ${TYPE_COLORS[photo.type]}`}
              >
                {TYPE_LABELS[photo.type] ?? photo.type}
              </span>
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            </button>
          ))}
        </div>
      )}

      {/* Before/after comparison */}
      {activeTab === 'comparison' && hasComparison && (
        <div className="space-y-6">
          {beforePhotos.map((before, i) => {
            const after = afterPhotos[i] ?? afterPhotos[0]
            return (
              <div key={before.id} className="space-y-2">
                <BeforeAfterSlider
                  beforeSrc={before.url}
                  afterSrc={after.url}
                  beforeLabel={before.caption || 'Before'}
                  afterLabel={after.caption || 'After'}
                  className="w-full aspect-video"
                />
                <p className="text-xs text-gray-500 text-center">
                  Drag slider to compare · By {before.workerName}
                </p>
              </div>
            )
          })}
        </div>
      )}

      {/* Status summary */}
      {photos.some((p) => p.approvalStatus === 'pending') && (
        <div className="mt-3 flex items-center gap-2">
          <Badge variant="warning" className="text-xs">
            {photos.filter((p) => p.approvalStatus === 'pending').length} pending review
          </Badge>
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <PhotoLightbox
          photos={approvedPhotos}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </div>
  )
}
