'use client'
import { cn } from '@/lib/utils'

// Animation delays for the three bouncing dots
const DOT_DELAYS = ['0ms', '150ms', '300ms'] as const

interface TypingIndicatorProps {
  /** Names of the users who are currently typing */
  names: string[]
  className?: string
}

/**
 * Animated typing indicator showing up to three bouncing dots with
 * an accessible label of who is typing.
 */
export default function TypingIndicator({ names, className }: TypingIndicatorProps) {
  if (names.length === 0) return null

  const label =
    names.length === 1
      ? `${names[0]} is typing`
      : names.length === 2
      ? `${names[0]} and ${names[1]} are typing`
      : `${names[0]} and ${names.length - 1} others are typing`

  return (
    <div
      className={cn('flex items-center gap-1.5', className)}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-2 rounded-2xl rounded-bl-sm shadow-sm">
        {DOT_DELAYS.map((delay, i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
            style={{ animationDelay: delay }}
            aria-hidden="true"
          />
        ))}
      </div>
      <span className="text-xs text-gray-400 dark:text-gray-500">{label}</span>
    </div>
  )
}
