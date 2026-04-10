import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface PremiumCategoryCardProps {
  id: string
  label: string
  description: string
  icon: LucideIcon
  gradient: string
  isPremium?: boolean
}

export default function PremiumCategoryCard({
  id,
  label,
  description,
  icon: Icon,
  gradient,
  isPremium = false,
}: PremiumCategoryCardProps) {
  return (
    <Link
      href={`/workers?category=${id}`}
      className={cn(
        'group relative flex flex-col items-center p-5 rounded-2xl',
        'bg-gradient-to-br from-slate-900 to-slate-800',
        'border border-slate-700/50',
        'transition-all duration-300',
        'hover:scale-105 hover:border-gold-500/40',
        'hover:shadow-[0_0_30px_rgba(212,175,55,0.18)]',
        'category-icon-glow',
      )}
    >
      {/* Icon with gradient background */}
      <div
        className={cn(
          'h-12 w-12 rounded-xl flex items-center justify-center mb-3',
          'bg-gradient-to-br',
          gradient,
          'opacity-90 group-hover:opacity-100 transition-opacity duration-300',
          'shadow-lg',
        )}
      >
        <Icon
          className="h-6 w-6 text-white transition-all duration-300 group-hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]"
          strokeWidth={1.75}
        />
      </div>

      <span className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors duration-300 text-center leading-tight">
        {label}
      </span>
      <span className="text-xs text-slate-500 group-hover:text-slate-400 text-center mt-1 leading-tight transition-colors duration-300 hidden sm:block">
        {description}
      </span>

      {/* Premium indicator */}
      {isPremium && (
        <div className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-gold-500 to-gold-600 rounded-full w-5 h-5 flex items-center justify-center shadow-gold-glow animate-pulse-gold">
          <span className="text-slate-900 text-[9px] font-black">★</span>
        </div>
      )}
    </Link>
  )
}
