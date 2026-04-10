'use client'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { ComponentPropsWithoutRef } from 'react'

interface GlowButtonProps {
  href?: string
  variant?: 'gold' | 'outline'
  pulse?: boolean
  className?: string
  children: React.ReactNode
  onClick?: () => void
}

export default function GlowButton({
  href,
  variant = 'gold',
  pulse = false,
  className,
  children,
  onClick,
}: GlowButtonProps) {
  const base = cn(
    'inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300',
    variant === 'gold' && [
      'bg-gradient-to-r from-gold-500 to-gold-600 text-slate-900',
      'shadow-gold-glow hover:shadow-gold-glow-lg hover:scale-105',
      pulse && 'animate-pulse-gold',
    ],
    variant === 'outline' && [
      'border border-gold-500/50 text-gold-400 bg-transparent',
      'hover:border-gold-400 hover:text-gold-300 hover:shadow-gold-glow hover:scale-105',
    ],
    className,
  )

  if (href) {
    return (
      <Link href={href} className={base}>
        {children}
      </Link>
    )
  }

  return (
    <button className={base} onClick={onClick}>
      {children}
    </button>
  )
}
