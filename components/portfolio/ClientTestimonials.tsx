import { Quote } from 'lucide-react'
import type { PortfolioItem } from '@/types/reputation'

interface Props {
  items: PortfolioItem[]
}

export default function ClientTestimonials({ items }: Props) {
  const withTestimonials = items.filter((i) => i.clientTestimonial)

  if (withTestimonials.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">No client testimonials yet.</div>
    )
  }

  return (
    <div className="space-y-4">
      {withTestimonials.map((item) => (
        <div key={item.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <Quote className="h-5 w-5 text-blue-300 mb-3" />
          <p className="text-sm text-gray-700 italic leading-relaxed">&quot;{item.clientTestimonial}&quot;</p>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs font-medium text-gray-900">{item.title}</p>
            <p className="text-xs text-gray-400">{new Date(item.completedAt).toLocaleDateString()}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
