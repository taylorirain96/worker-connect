'use client'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import PortfolioCard from './PortfolioCard'
import type { PortfolioItem } from '@/types/reputation'

interface Props {
  items: PortfolioItem[]
  workerId: string
}

export default function PortfolioGallery({ items, workerId }: Props) {
  const [filter, setFilter] = useState<string>('all')

  const categories = ['all', ...Array.from(new Set(items.map((i) => i.category)))]
  const filtered = filter === 'all' ? items : items.filter((i) => i.category === filter)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${
              filter === cat ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl">
          <Plus className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No portfolio items yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <PortfolioCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
