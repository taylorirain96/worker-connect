'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, Camera } from 'lucide-react'
import type { PortfolioPhoto } from '@/types'

interface PortfolioGalleryProps {
  photos: PortfolioPhoto[]
  /** Maximum number of photos to show before a "View all" link. Defaults to showing all. */
  limit?: number
  /** href for the "View all" link when limit is set */
  viewAllHref?: string
  /** Extra CSS classes for the grid wrapper */
  className?: string
}

export default function PortfolioGallery({
  photos,
  limit,
  viewAllHref,
  className = '',
}: PortfolioGalleryProps) {
  const [lightbox, setLightbox] = useState<PortfolioPhoto | null>(null)

  if (photos.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <Camera className="h-10 w-10 mx-auto mb-2 opacity-40" />
        <p className="text-sm">No portfolio photos yet.</p>
      </div>
    )
  }

  const visible = limit ? photos.slice(0, limit) : photos
  const hiddenCount = limit ? Math.max(0, photos.length - limit) : 0

  return (
    <>
      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-3 right-3 z-10 p-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="relative w-full aspect-video bg-gray-100 dark:bg-gray-800">
              <Image
                src={lightbox.url}
                alt={lightbox.title}
                fill
                className="object-contain"
              />
            </div>
            <div className="p-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{lightbox.title}</h3>
              <p className="text-sm text-primary-600 dark:text-primary-400 mt-1">{lightbox.category}</p>
              {lightbox.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{lightbox.description}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Photo grid */}
      <div className={`grid grid-cols-2 sm:grid-cols-3 gap-3 ${className}`}>
        {visible.map((photo) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setLightbox(photo)}
            className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 hover:opacity-90 transition-opacity group"
          >
            <Image
              src={photo.url}
              alt={photo.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end">
              <div className="w-full bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-xs font-medium truncate">{photo.title}</p>
                <p className="text-white/70 text-xs truncate">{photo.category}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {hiddenCount > 0 && viewAllHref && (
        <div className="mt-3 text-center">
          <Link
            href={viewAllHref}
            className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
          >
            View all {photos.length} photos →
          </Link>
        </div>
      )}

      {hiddenCount > 0 && !viewAllHref && (
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-3 text-center">
          +{hiddenCount} more photo{hiddenCount !== 1 ? 's' : ''}
        </p>
      )}
    </>
  )
}
