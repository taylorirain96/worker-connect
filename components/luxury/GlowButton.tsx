'use client'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface GlowButtonProps {
  href?: string
  variant?: 'indigo' | 'violet' | 'outline'
  pulse?: boolean
  className?: string
  children: React.ReactNode
  onClick?: () => void
}

export default function GlowButton({
  href,
  variant = 'indigo',
  pulse = false,
  className,
  children,
  onClick,
}: GlowButtonProps) {
  const base = cn(
    'inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300',
    variant === 'indigo' && [
      'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white',
      'shadow-indigo-glow hover:shadow-indigo-glow-lg hover:scale-105',
      pulse && 'animate-pulse-indigo',
    ],
    variant === 'violet' && [
      'bg-gradient-to-r from-violet-500 to-violet-600 text-white',
      'shadow-violet-glow hover:shadow-violet-glow-lg hover:scale-105',
      pulse && 'animate-pulse-violet',
    ],
    variant === 'outline' && [
      'border border-indigo-500/50 text-indigo-400 bg-transparent',
      'hover:border-indigo-400 hover:text-indigo-300 hover:shadow-indigo-glow hover:scale-105',
    ],
    className,
  )

  if (href) {
    return <Link href={href} className={base}>{children}</Link>
  }
  return <button className={base} onClick={onClick}>{children}</button>
}
