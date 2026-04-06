'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PhotoGalleryProps {
  photos: string[]
  altPrefix?: string
  /** Grid columns (defaults to responsive 3/4 col grid) */
  columns?: 2 | 3 | 4 | 5
  className?: string
}

const COLUMNS_CLASS: Record<number, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-4',
  5: 'grid-cols-3 sm:grid-cols-5',
}

export default function PhotoGallery({
  photos,
  altPrefix = 'Review photo',
  columns = 3,
  className,
}: PhotoGalleryProps) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)

  if (photos.length === 0) return null

  function prev() {
    setLightboxIdx((i) => (i === null ? null : (i - 1 + photos.length) % photos.length))
  }

  function next() {
    setLightboxIdx((i) => (i === null ? null : (i + 1) % photos.length))
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowLeft') prev()
    else if (e.key === 'ArrowRight') next()
    else if (e.key === 'Escape') setLightboxIdx(null)
  }

  const colClass = COLUMNS_CLASS[columns] ?? COLUMNS_CLASS[3]

  return (
    <>
      {/* Grid */}
      <div className={cn(`grid gap-2 ${colClass}`, className)}>
        {photos.map((url, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setLightboxIdx(idx)}
            className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label={`${altPrefix} ${idx + 1} – click to enlarge`}
          >
            <Image
              src={url}
              alt={`${altPrefix} ${idx + 1}`}
              fill
              className="object-cover transition-transform duration-200 group-hover:scale-105"
              sizes="(max-width: 640px) 30vw, 150px"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo lightbox"
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={(e) => { if (e.target === e.currentTarget) setLightboxIdx(null) }}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          {/* Close */}
          <button
            type="button"
            onClick={() => setLightboxIdx(null)}
            className="absolute top-4 right-4 h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Close lightbox"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Counter */}
          <span className="absolute top-4 left-4 text-xs text-white/70 tabular-nums">
            {lightboxIdx + 1} / {photos.length}
          </span>

          {/* Previous */}
          {photos.length > 1 && (
            <button
              type="button"
              onClick={prev}
              className="absolute left-4 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {/* Image */}
          <div className="relative w-full max-w-3xl max-h-[80vh] mx-12">
            <Image
              src={photos[lightboxIdx]}
              alt={`${altPrefix} ${lightboxIdx + 1}`}
              width={1200}
              height={900}
              className="object-contain w-full h-full max-h-[80vh] rounded-lg"
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>

          {/* Next */}
          {photos.length > 1 && (
            <button
              type="button"
              onClick={next}
              className="absolute right-4 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Next photo"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}

          {/* Thumbnail strip */}
          {photos.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-full overflow-x-auto px-4">
              {photos.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setLightboxIdx(idx)}
                  className={cn(
                    'relative shrink-0 h-12 w-12 rounded overflow-hidden border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50',
                    idx === lightboxIdx
                      ? 'border-white'
                      : 'border-white/30 hover:border-white/60'
                  )}
                  aria-label={`Go to photo ${idx + 1}`}
                  aria-current={idx === lightboxIdx}
                >
                  <Image
                    src={url}
                    alt={`Thumbnail ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}
