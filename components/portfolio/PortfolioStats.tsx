import { Briefcase, Star, Tag, Calendar } from 'lucide-react'
import type { PortfolioItem } from '@/types/reputation'

interface Props {
  items: PortfolioItem[]
}

export default function PortfolioStats({ items }: Props) {
  const totalItems = items.length
  const testimonialCount = items.filter((i) => i.clientTestimonial).length
  const allTags = Array.from(new Set(items.flatMap((i) => i.tags)))
  const categories = Array.from(new Set(items.map((i) => i.category)))

  const stats = [
    { label: 'Projects', value: totalItems, icon: <Briefcase className="h-5 w-5" />, color: 'text-blue-600 bg-blue-50' },
    { label: 'Testimonials', value: testimonialCount, icon: <Star className="h-5 w-5" />, color: 'text-yellow-600 bg-yellow-50' },
    { label: 'Skills', value: allTags.length, icon: <Tag className="h-5 w-5" />, color: 'text-purple-600 bg-purple-50' },
    { label: 'Categories', value: categories.length, icon: <Calendar className="h-5 w-5" />, color: 'text-green-600 bg-green-50' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-4 text-center shadow-sm">
          <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-2 ${s.color}`}>
            {s.icon}
          </div>
          <p className="text-2xl font-bold text-gray-900">{s.value}</p>
          <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
        </div>
      ))}
    </div>
  )
}
