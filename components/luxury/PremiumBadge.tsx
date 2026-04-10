import { Crown, BadgeCheck, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PremiumBadgeProps {
  variant?: 'top-pro' | 'verified' | 'featured'
  pulse?: boolean
  className?: string
}

const BADGE_CONFIG = {
  'top-pro': {
    icon: Crown,
    label: 'Top Pro',
    classes: 'bg-gold-500/10 border-gold-500/30 text-gold-400',
  },
  verified: {
    icon: BadgeCheck,
    label: 'Verified',
    classes: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
  },
  featured: {
    icon: Star,
    label: 'Featured',
    classes: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
  },
}

export default function PremiumBadge({
  variant = 'top-pro',
  pulse = false,
  className,
}: PremiumBadgeProps) {
  const config = BADGE_CONFIG[variant]
  const Icon = config.icon

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 border rounded-full text-xs font-bold',
        config.classes,
        pulse && 'animate-pulse-gold-slow',
        className,
      )}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </div>
  )
}
