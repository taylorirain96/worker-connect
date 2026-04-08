'use client'

import { CheckCircle, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { OnboardingChecklistItem } from '@/types'

interface OnboardingProgressProps {
  completion: number
  checklist?: OnboardingChecklistItem[]
  className?: string
}

export default function OnboardingProgress({
  completion,
  checklist = [],
  className,
}: OnboardingProgressProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Progress bar */}
      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Profile Completion
          </span>
          <span
            className="text-sm font-semibold text-primary-600 dark:text-primary-400"
            aria-live="polite"
            aria-atomic="true"
          >
            {completion}%
          </span>
        </div>
        <div
          className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700"
          role="progressbar"
          aria-valuenow={completion}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Onboarding completion: ${completion}%`}
        >
          <div
            className="h-full rounded-full bg-primary-600 transition-all duration-500 ease-out"
            style={{ width: `${completion}%` }}
          />
        </div>
      </div>

      {/* Checklist */}
      {checklist.length > 0 && (
        <ul className="space-y-2" aria-label="Onboarding checklist">
          {checklist
            .sort((a, b) => a.order - b.order)
            .map((item) => (
              <li
                key={item.id}
                className={cn(
                  'flex items-start gap-3 rounded-lg border p-3 text-sm transition-colors',
                  item.completed
                    ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                    : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                )}
              >
                {item.completed ? (
                  <CheckCircle
                    className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-400"
                    aria-hidden="true"
                  />
                ) : (
                  <Circle
                    className="mt-0.5 h-4 w-4 shrink-0 text-gray-400"
                    aria-hidden="true"
                  />
                )}
                <div className="min-w-0">
                  <p
                    className={cn(
                      'font-medium',
                      item.completed
                        ? 'text-green-700 dark:text-green-300'
                        : 'text-gray-900 dark:text-white'
                    )}
                  >
                    {item.label}
                    {item.required && !item.completed && (
                      <span className="ml-1.5 text-xs font-normal text-red-500" aria-label="required">
                        *required
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.description}</p>
                </div>
              </li>
            ))}
        </ul>
      )}
    </div>
  )
}
