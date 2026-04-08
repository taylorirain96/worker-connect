import type { PortfolioItem } from '@/types/reputation'

interface Props {
  items: PortfolioItem[]
}

export default function ClientTestimonials({ items }: Props) {
  const withTestimonials = items.filter(i => i.clientTestimonial)

  if (withTestimonials.length === 0) {
    return <p className="text-sm text-gray-400">No testimonials yet.</p>
  }

  return (
    <div className="space-y-4">
      {withTestimonials.map(item => (
        <div key={item.id} className="bg-gray-50 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
              {item.clientTestimonial!.author.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{item.clientTestimonial!.author}</p>
              <div className="text-yellow-500 text-xs">
                {'★'.repeat(Math.round(item.clientTestimonial!.rating))}
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600 italic">&ldquo;{item.clientTestimonial!.text}&rdquo;</p>
          <p className="text-xs text-gray-400">{item.title}</p>
        </div>
      ))}
    </div>
  )
}
