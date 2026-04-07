import { Calendar, Tag } from 'lucide-react'
import type { PortfolioItem } from '@/types/reputation'

interface Props {
  item: PortfolioItem
}

export default function PortfolioCard({ item }: Props) {
  const imageUrl = item.afterImageUrl ?? item.imageUrls[0]

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {imageUrl && (
        <div className="aspect-video bg-gray-100 overflow-hidden">
          <img src={imageUrl} alt={item.title} className="w-full h-full object-cover" />
        </div>
      )}
      {!imageUrl && (
        <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
          <span className="text-3xl">🖼️</span>
        </div>
      )}
      <div className="p-4">
        <h4 className="text-sm font-semibold text-gray-900 truncate">{item.title}</h4>
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
        <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(item.completedAt).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1 capitalize">
            <Tag className="h-3.5 w-3.5" />
            {item.category}
          </span>
        </div>
        {item.clientTestimonial && (
          <p className="text-xs text-gray-600 italic mt-3 border-l-2 border-blue-200 pl-2 line-clamp-2">
            &quot;{item.clientTestimonial}&quot;
          </p>
        )}
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {item.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
