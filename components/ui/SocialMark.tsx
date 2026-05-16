import { cn } from '@/lib/utils'

interface SocialMarkProps {
  platformToken: string
  className?: string
}

export default function SocialMark({ platformToken, className }: SocialMarkProps) {
  return (
    <span aria-hidden="true" className={cn('flex items-center justify-center font-semibold uppercase', className)}>
      {platformToken}
    </span>
  )
}
