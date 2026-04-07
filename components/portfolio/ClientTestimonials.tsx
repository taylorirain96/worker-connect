'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface Testimonial {
  id: string
  clientName: string
  quote: string
  rating: number
  projectTitle?: string
  date: string
}

interface Props {
  testimonials: Testimonial[]
  className?: string
}

export default function ClientTestimonials({ testimonials, className }: Props) {
  const [current, setCurrent] = useState(0)

  if (testimonials.length === 0) {
    return (
      <div className={cn('bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center', className)}>
        <p className="text-sm text-gray-400 dark:text-gray-500">No testimonials yet. Complete jobs to receive client feedback!</p>
      </div>
    )
  }

  const t = testimonials[current]

  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6', className)}>
      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Client Testimonials</h3>

      <div className="space-y-3">
        {/* Quote */}
        <blockquote className="relative">
          <span className="text-4xl text-gray-200 dark:text-gray-700 font-serif leading-none absolute -top-2 -left-1">&ldquo;</span>
          <p className="text-sm text-gray-700 dark:text-gray-300 italic pl-4 pt-2">{t.quote}</p>
        </blockquote>

        {/* Rating */}
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={i < t.rating ? 'text-yellow-400' : 'text-gray-200 dark:text-gray-600'}>⭐</span>
          ))}
        </div>

        {/* Client info */}
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{t.clientName}</p>
          {t.projectTitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400">re: {t.projectTitle}</p>
          )}
          <p className="text-xs text-gray-400 dark:text-gray-500">{new Date(t.date).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Navigation */}
      {testimonials.length > 1 && (
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            disabled={current === 0}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-30 transition-colors"
            aria-label="Previous testimonial"
          >
            ←
          </button>
          <div className="flex gap-1.5">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-200',
                  i === current ? 'w-5 bg-blue-500' : 'w-1.5 bg-gray-300 dark:bg-gray-600'
                )}
                aria-label={`Testimonial ${i + 1}`}
              />
            ))}
          </div>
          <button
            onClick={() => setCurrent((c) => Math.min(testimonials.length - 1, c + 1))}
            disabled={current === testimonials.length - 1}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-30 transition-colors"
            aria-label="Next testimonial"
          >
            →
          </button>
        </div>
      )}
    </div>
  )
}
