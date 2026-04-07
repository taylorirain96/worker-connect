import { Shield } from 'lucide-react'

interface Props {
  count: number
  size?: 'sm' | 'md' | 'lg'
}

const SIZE_MAP = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
}

export default function TrustShields({ count, size = 'md' }: Props) {
  const iconClass = SIZE_MAP[size]
  return (
    <div className="flex items-center gap-0.5" title={`${count} of 5 Trust Shields`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Shield
          key={i}
          className={`${iconClass} ${i < count ? 'text-blue-500 fill-blue-100' : 'text-gray-200 fill-gray-50'}`}
        />
      ))}
    </div>
  )
}
