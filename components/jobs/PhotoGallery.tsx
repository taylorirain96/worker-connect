'use client'

import { useState } from 'react'
import type { JobPhoto } from '@/types'
import PhotoLightbox from './PhotoLightbox'
import BeforeAfterSlider from './BeforeAfterSlider'
import { Camera, ChevronDown, ChevronUp } from 'lucide-react'
import { formatRelativeDate } from '@/lib/utils'

interface PhotoGalleryProps {
  photos: JobPhoto[]
  /** Show the before/after comparison slider if pairs are available */
  showComparisonSlider?: boolean
}

const TYPE_LABEL: Record<string, string> = {
  before: 'Before',
  after: 'After',
  general: 'General',
}

const TYPE_COLOR: Record<string, string> = {
  before: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  after:  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  general: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
}

export default function PhotoGallery({ photos, showComparisonSlider = true }: PhotoGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [showAll, setShowAll] = useState(false)

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-gray-400 dark:text-gray-600 gap-2">
        <Camera className="h-10 w-10" />
        <p className="text-sm">No photos uploaded yet</p>
      </div>
    )
  }

  // Find first before/after pair for the comparison slider
  const beforePhoto = photos.find((p) => p.type === 'before')
  const afterPhoto = photos.find((p) => p.type === 'after')
  const hasComparison = showComparisonSlider && !!beforePhoto && !!afterPhoto

  const visiblePhotos = showAll ? photos : photos.slice(0, 6)

  return (
    <div className="space-y-4">
      {/* Before/After slider */}
      {hasComparison && (
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Before / After Comparison
          </p>
          <BeforeAfterSlider
            beforeUrl={beforePhoto!.url}
            afterUrl={afterPhoto!.url}
            className="aspect-video"
          />
        </div>
      )}

      {/* Grid */}
      <div>
        {hasComparison && (
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            All Photos ({photos.length})
          </p>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {visiblePhotos.map((photo, idx) => (
            <button
              key={photo.id}
              onClick={() => setLightboxIndex(idx)}
              className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label={`View photo: ${photo.caption || TYPE_LABEL[photo.type]}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt={photo.caption || TYPE_LABEL[photo.type]}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              {/* Type badge */}
              <span className={`absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_COLOR[photo.type] ?? TYPE_COLOR.general}`}>
                {TYPE_LABEL[photo.type] ?? photo.type}
              </span>
              {/* Caption */}
              {photo.caption && (
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-2 translate-y-full group-hover:translate-y-0 transition-transform">
                  <p className="text-white text-xs truncate">{photo.caption}</p>
                  <p className="text-white/60 text-xs">{formatRelativeDate(photo.uploadedAt)}</p>
                </div>
              )}
            </button>
          ))}
        </div>

        {photos.length > 6 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="mt-3 w-full flex items-center justify-center gap-1.5 text-sm text-primary-600 dark:text-primary-400 hover:underline"
          >
            {showAll ? (
              <><ChevronUp className="h-4 w-4" /> Show less</>
            ) : (
              <><ChevronDown className="h-4 w-4" /> Show all {photos.length} photos</>
            )}
          </button>
        )}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <PhotoLightbox
          photos={photos}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </div>
  )
}
