'use client'

import { cn } from '@/lib/utils'
import type { PortfolioProject } from '@/types/reputation'

interface Props {
  project: PortfolioProject
  featured?: boolean
  onClick?: (project: PortfolioProject) => void
  className?: string
}

export default function PortfolioCard({ project, featured, onClick, className }: Props) {
  const thumbnail = project.afterPhotoUrl ?? project.photos[0] ?? null

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={() => onClick?.(project)}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.(project)}
      className={cn(
        'group bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm transition-shadow hover:shadow-md',
        onClick && 'cursor-pointer',
        featured && 'ring-2 ring-blue-500',
        className
      )}
    >
      {/* Thumbnail */}
      <div className={cn('relative bg-gray-100 dark:bg-gray-700 overflow-hidden', featured ? 'h-48' : 'h-32')}>
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-3xl text-gray-300 dark:text-gray-600">📷</span>
          </div>
        )}
        {featured && (
          <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-medium px-2 py-0.5 rounded-full">
            Featured
          </span>
        )}
        {project.beforePhotoUrl && (
          <span className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
            Before/After
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{project.title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 capitalize">{project.category}</p>

        {project.clientRating && (
          <div className="flex items-center gap-1 mt-1">
            {'⭐'.repeat(Math.round(project.clientRating))}
            <span className="text-xs text-gray-500 dark:text-gray-400">({project.clientRating.toFixed(1)})</span>
          </div>
        )}

        {project.tags.length > 0 && (
          <div className="flex gap-1 mt-2 flex-wrap">
            {project.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
