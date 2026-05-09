/**
 * Compact text-based social marker shown in place of brand icons that
 * are no longer exported by `lucide-react` (Twitter / Facebook / LinkedIn / X).
 *
 * Pure visual affordance — accessible labelling should be set on the parent
 * `<a>` via `aria-label`.
 */
export type SocialPlatform = 'x' | 'twitter' | 'facebook' | 'linkedin'

interface SocialMarkProps {
  platform: SocialPlatform
  className?: string
}

const LABELS: Record<SocialPlatform, string> = {
  x: 'X',
  twitter: 'X',
  facebook: 'f',
  linkedin: 'in',
}

export default function SocialMark({ platform, className = '' }: SocialMarkProps) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex h-5 w-5 items-center justify-center rounded text-[11px] font-bold leading-none ${className}`}
    >
      {LABELS[platform]}
    </span>
  )
}
