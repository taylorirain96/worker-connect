interface AvailableTodayBadgeProps {
  availability?: string
  className?: string
}

export default function AvailableTodayBadge({ availability, className }: AvailableTodayBadgeProps) {
  if (availability !== 'available') return null

  return (
    <span
      className={`inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium px-2.5 py-1 rounded-full ${className ?? ''}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
      Available Today
    </span>
  )
}
