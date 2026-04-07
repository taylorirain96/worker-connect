import Image from 'next/image'
import type { PortfolioItem } from '@/types/reputation'

interface Props {
  item: PortfolioItem
  onClick?: () => void
}

export default function PortfolioCard({ item, onClick }: Props) {
  return (
    <div
      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      {item.afterImageUrl ? (
        <Image src={item.afterImageUrl} alt={item.title} width={400} height={160} className="w-full h-40 object-cover" />
      ) : (
        <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-400 text-4xl">🔨</div>
      )}
      <div className="p-4 space-y-1">
        <span className="text-xs text-blue-600 font-medium uppercase tracking-wide">{item.category}</span>
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">{item.title}</h3>
        {item.clientTestimonial && (
          <div className="flex items-center gap-1 text-yellow-500 text-xs">
            {'★'.repeat(Math.round(item.clientTestimonial.rating))}
            <span className="text-gray-400">{item.clientTestimonial.rating}/5</span>
          </div>
        )}
      </div>
    </div>
  )
}
