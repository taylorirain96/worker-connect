'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import type { PortfolioProject } from '@/types/reputation'
import { BeforeAfterShowcase } from './BeforeAfterShowcase'

interface Props {
  project: PortfolioProject
}

export function PortfolioCard({ project }: Props) {
  const [showSlider, setShowSlider] = useState(false)
  const hasBefore = project.beforePhotos.length > 0
  const hasAfter = project.afterPhotos.length > 0

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Before/After Preview */}
      {hasBefore && hasAfter ? (
        <div className="relative">
          {showSlider ? (
            <BeforeAfterShowcase
              before={project.beforePhotos[0]}
              after={project.afterPhotos[0]}
            />
          ) : (
            <div className="relative">
              <img
                src={project.afterPhotos[0]}
                alt="After"
                className="w-full h-48 object-cover"
              />
              <button
                onClick={() => setShowSlider(true)}
                className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg hover:bg-black/80"
              >
                Before / After
              </button>
            </div>
          )}
        </div>
      ) : hasAfter ? (
        <img
          src={project.afterPhotos[0]}
          alt={project.title}
          className="w-full h-48 object-cover"
        />
      ) : hasBefore ? (
        <img
          src={project.beforePhotos[0]}
          alt={project.title}
          className="w-full h-48 object-cover"
        />
      ) : (
        <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
          No photos
        </div>
      )}

      {/* Content */}
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 leading-tight">{project.title}</h3>
          {project.featured && (
            <Star className="w-4 h-4 text-amber-500 shrink-0" fill="currentColor" />
          )}
        </div>
        <p className="text-xs text-indigo-600 font-medium">{project.category}</p>
        <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
        {project.clientTestimonial && (
          <p className="text-xs text-gray-500 italic border-l-2 border-indigo-200 pl-2 mt-2 line-clamp-2">
            &ldquo;{project.clientTestimonial}&rdquo;
          </p>
        )}
        <p className="text-xs text-gray-400">
          {new Date(project.completedAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  )
}
