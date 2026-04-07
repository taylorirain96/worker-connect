'use client'

import { useState } from 'react'
import type { PortfolioProject } from '@/types/reputation'
import { PortfolioCard } from './PortfolioCard'

interface Props {
  projects: PortfolioProject[]
  workerId: string
}

export function PortfolioGallery({ projects }: Props) {
  const categories = ['All', ...Array.from(new Set(projects.map((p) => p.category)))]
  const [activeCategory, setActiveCategory] = useState('All')

  const filtered =
    activeCategory === 'All'
      ? projects
      : projects.filter((p) => p.category === activeCategory)

  const featured = filtered.filter((p) => p.featured)
  const regular = filtered.filter((p) => !p.featured)

  return (
    <div className="space-y-6">
      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Featured projects */}
      {featured.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Featured
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {featured.map((p) => (
              <PortfolioCard key={p.id} project={p} />
            ))}
          </div>
        </div>
      )}

      {/* Regular projects */}
      {regular.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {regular.map((p) => (
            <PortfolioCard key={p.id} project={p} />
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <p className="text-center text-gray-400 py-12">No projects in this category yet.</p>
      )}
    </div>
  )
}
