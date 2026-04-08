'use client'

import { ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import Button from '@/components/ui/Button'

interface OnboardingStepProps {
  title: string
  description?: string
  children: ReactNode
  onNext?: () => void | Promise<void>
  onBack?: () => void
  nextLabel?: string
  backLabel?: string
  loading?: boolean
  canProceed?: boolean
  isFirst?: boolean
  isLast?: boolean
  className?: string
}

export default function OnboardingStep({
  title,
  description,
  children,
  onNext,
  onBack,
  nextLabel = 'Continue',
  backLabel = 'Back',
  loading = false,
  canProceed = true,
  isFirst = false,
  isLast = false,
  className,
}: OnboardingStepProps) {
  return (
    <section className={cn('space-y-6', className)} aria-label={title}>
      <header className="space-y-1">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        )}
      </header>

      <div className="min-h-[200px]">{children}</div>

      <div className="flex items-center justify-between gap-3 pt-2">
        {!isFirst ? (
          <Button variant="outline" size="md" onClick={onBack} disabled={loading}>
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            {backLabel}
          </Button>
        ) : (
          <span />
        )}

        {onNext && (
          <Button
            variant="primary"
            size="md"
            loading={loading}
            onClick={onNext}
            disabled={!canProceed}
            aria-label={isLast ? 'Complete onboarding' : `Continue to next step: ${nextLabel}`}
            className="ml-auto"
          >
            {nextLabel}
            {!isLast && <ChevronRight className="h-4 w-4" aria-hidden="true" />}
          </Button>
        )}
      </div>
    </section>
  )
}
