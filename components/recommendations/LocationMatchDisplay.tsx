'use client'
import { MapPin, CheckCircle } from 'lucide-react'

interface Props { location: string; workerLocation?: string; matchScore: number }

export default function LocationMatchDisplay({ location, workerLocation = 'New York, NY', matchScore }: Props) {
  const isGood = matchScore >= 70
  return (
    <div className="flex items-center gap-2 text-sm">
      <MapPin className={`h-4 w-4 ${isGood ? 'text-emerald-500' : 'text-amber-500'}`} />
      <span className="text-gray-600 dark:text-gray-300">{location}</span>
      {isGood && <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />}
    </div>
  )
}
