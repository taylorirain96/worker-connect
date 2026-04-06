'use client'

import { useState } from 'react'
import { Camera, LayoutGrid, ArrowLeftRight, ChevronDown, ChevronUp } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import PhotoLightbox from './PhotoLightbox'
import BeforeAfterSlider from './BeforeAfterSlider'
import type { JobPhoto } from '@/types'

interface PhotoGalleryProps {
  photos: JobPhoto[]
  className?: string
}

const TYPE_BADGE: Record<JobPhoto['type'], { label: string; variant: 'warning' | 'success' | 'info' }> = {
  before: { label: 'Before', variant: 'warning' },
  after: { label: 'After', variant: 'success' },
  progress: { label: 'Progress', variant: 'info' },
}

export default function PhotoGallery({ photos, className }: PhotoGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [view, setView] = useState<'grid' | 'comparison'>('grid')
  const [expanded, setExpanded] = useState(false)

  const beforePhoto = photos.find((p) => p.type === 'before')
  const afterPhoto = photos.find((p) => p.type === 'after')
  const canCompare = Boolean(beforePhoto && afterPhoto)

  const displayedPhotos = expanded ? photos : photos.slice(0, 6)

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center text-gray-400 dark:text-gray-600">
        <Camera className="h-10 w-10 mb-2 opacity-40" />
        <p className="text-sm">No photos uploaded yet.</p>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {photos.length} photo{photos.length !== 1 ? 's' : ''}
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setView('grid')}
            className={`p-1.5 rounded-lg transition-colors ${view === 'grid' ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
            title="Grid view"
            aria-label="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          {canCompare && (
            <button
              onClick={() => setView('comparison')}
              className={`p-1.5 rounded-lg transition-colors ${view === 'comparison' ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
              title="Before/After comparison"
              aria-label="Before/After comparison"
            >
              <ArrowLeftRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Before/After slider */}
      {view === 'comparison' && canCompare && beforePhoto && afterPhoto && (
        <BeforeAfterSlider
          beforeUrl={beforePhoto.url}
          afterUrl={afterPhoto.url}
          className="mb-4 aspect-video"
        />
      )}

      {/* Grid */}
      {view === 'grid' && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {displayedPhotos.map((photo, idx) => (
              <button
                key={photo.id}
                onClick={() => setLightboxIndex(idx)}
                className="relative group aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label={`View photo: ${photo.caption || photo.type}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.thumbnailUrl || photo.url}
                  alt={photo.caption || photo.type}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                {/* Type badge */}
                <div className="absolute top-1.5 left-1.5">
                  <Badge
                    variant={TYPE_BADGE[photo.type].variant}
                    className="text-[10px] px-1.5 py-0"
                  >
                    {TYPE_BADGE[photo.type].label}
                  </Badge>
                </div>
                {/* Flagged indicator */}
                {photo.approvalStatus === 'flagged' && (
                  <div className="absolute top-1.5 right-1.5">
                    <Badge variant="danger" className="text-[10px] px-1.5 py-0">
                      Flagged
                    </Badge>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Show more / less */}
          {photos.length > 6 && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="mt-3 w-full flex items-center justify-center gap-1 text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-4 w-4" /> Show less
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" /> Show all {photos.length} photos
                </>
              )}
            </button>
          )}
        </>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <PhotoLightbox
          photos={photos}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex((i) => (i! - 1 + photos.length) % photos.length)}
          onNext={() => setLightboxIndex((i) => (i! + 1) % photos.length)}
          onGoTo={(idx) => setLightboxIndex(idx)}
        />
      )}
    </div>
  )
}
