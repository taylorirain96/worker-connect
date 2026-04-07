import { MapPin, CheckCircle } from 'lucide-react'

interface Props {
  isReady: boolean
  targetCity?: string
}

export default function RelocationBadge({ isReady, targetCity }: Props) {
  if (!isReady) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
        <MapPin className="h-3.5 w-3.5" />
        Not Relocation Ready
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
      <CheckCircle className="h-3.5 w-3.5" />
      Relocation Ready
      {targetCity && <span className="text-green-500">· {targetCity}</span>}
    </span>
  )
}
