'use client'
import { cn } from '@/lib/utils'

interface NotificationBadgeProps {
  /** Number to display in the badge */
  count: number
  /** Maximum before showing "N+" (default 99) */
  max?: number
  /** Extra CSS classes */
  className?: string
  /** Whether to hide the badge when count is 0 */
  hideWhenZero?: boolean
}

/**
 * Circular badge displaying an unread / notification count.
 * Used alongside bell icons, avatar stacks, and conversation list items.
 */
export default function NotificationBadge({
  count,
  max = 99,
  className,
  hideWhenZero = true,
}: NotificationBadgeProps) {
  if (hideWhenZero && count <= 0) return null

  const label = count > max ? `${max}+` : String(count)

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center bg-red-500 text-white font-bold rounded-full leading-none select-none',
        label.length > 2 ? 'px-1.5 py-0.5 text-[10px]' : 'h-5 w-5 text-[11px]',
        className
      )}
      aria-label={`${count} unread`}
    >
      {label}
    </span>
  )
}
