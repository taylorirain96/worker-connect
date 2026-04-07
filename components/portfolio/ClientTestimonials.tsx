'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react'

interface Props {
  testimonials: string[]
}

export function ClientTestimonials({ testimonials }: Props) {
  const [idx, setIdx] = useState(0)

  if (testimonials.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">No testimonials yet.</div>
    )
  }

  const prev = () => setIdx((i) => (i - 1 + testimonials.length) % testimonials.length)
  const next = () => setIdx((i) => (i + 1) % testimonials.length)

  return (
    <div className="bg-indigo-50 rounded-2xl p-6 relative">
      <Quote className="w-8 h-8 text-indigo-200 mb-2" />
      <p className="text-gray-700 text-sm leading-relaxed min-h-[60px]">
        {testimonials[idx]}
      </p>
      {testimonials.length > 1 && (
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={prev}
            className="p-1.5 rounded-full hover:bg-indigo-100 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-indigo-600" />
          </button>
          <span className="text-xs text-gray-400">
            {idx + 1} / {testimonials.length}
          </span>
          <button
            onClick={next}
            className="p-1.5 rounded-full hover:bg-indigo-100 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-indigo-600" />
          </button>
        </div>
      )}
    </div>
  )
}
