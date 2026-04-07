'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { WorkerPortfolio } from '@/types/reputation'
import PortfolioCard from './PortfolioCard'

interface Props {
  portfolio: WorkerPortfolio
  onAdd?: () => void
  className?: string
}

export default function PortfolioGallery({ portfolio, onAdd, className }: Props) {
  const [category, setCategory] = useState<string>('all')

  const categories = ['all', ...Array.from(new Set(portfolio.projects.map((p) => p.category)))]

  const filtered =
    category === 'all'
      ? portfolio.projects
      : portfolio.projects.filter((p) => p.category === category)

  const featured = filtered.filter((p) => p.featured)
  const regular = filtered.filter((p) => !p.featured)

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Work Portfolio</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {portfolio.stats.totalProjects} project{portfolio.stats.totalProjects !== 1 ? 's' : ''}
          </p>
        </div>
        {onAdd && (
          <button
            onClick={onAdd}
            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            + Add Project
          </button>
        )}
      </div>

      {/* Category filter */}
      {categories.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                category === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              )}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
      )}

      {/* Featured */}
      {featured.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Featured</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {featured.map((project) => (
              <PortfolioCard key={project.id} project={project} featured />
            ))}
          </div>
        </div>
      )}

      {/* Regular */}
      {regular.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {regular.map((project) => (
            <PortfolioCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            {portfolio.projects.length === 0 ? 'No projects yet. Add your first project!' : 'No projects in this category.'}
          </p>
        </div>
      )}
    </div>
  )
}
