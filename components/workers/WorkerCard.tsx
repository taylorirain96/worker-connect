import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Star, CheckCircle, Briefcase, DollarSign } from 'lucide-react'
import type { UserProfile } from '@/types'
import { getInitials } from '@/lib/utils'
import Badge from '@/components/ui/Badge'

interface WorkerCardProps {
  worker: UserProfile
}

export default function WorkerCard({ worker }: WorkerCardProps) {
  return (
    <Link href={`/workers/${worker.uid}`}>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700 transition-all cursor-pointer group">
        <div className="flex items-start gap-4 mb-4">
          <div className="relative flex-shrink-0">
            {worker.photoURL ? (
              <Image
                src={worker.photoURL}
                alt={worker.displayName || 'Worker'}
                width={56}
                height={56}
                className="h-14 w-14 rounded-full object-cover"
              />
            ) : (
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-lg font-bold">
                {getInitials(worker.displayName || worker.email || 'W')}
              </div>
            )}
            {worker.availability === 'available' && (
              <div className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors truncate">
                {worker.displayName || 'Anonymous Worker'}
              </h3>
              {worker.verified && (
                <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0" aria-label="Verified" />
              )}
            </div>
            {worker.location && (
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                <MapPin className="h-3 w-3" />
                {worker.location}
              </div>
            )}
            <div className="flex items-center gap-3 mt-1">
              {worker.rating !== undefined && (
                <div className="flex items-center gap-1 text-xs">
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium text-gray-700 dark:text-gray-300">{worker.rating.toFixed(1)}</span>
                  <span className="text-gray-400">({worker.reviewCount || 0})</span>
                </div>
              )}
              {worker.completedJobs !== undefined && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Briefcase className="h-3 w-3" />
                  {worker.completedJobs} jobs
                </div>
              )}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            {worker.hourlyRate && (
              <div className="flex items-center gap-0.5 text-sm font-semibold text-gray-900 dark:text-white">
                <DollarSign className="h-3.5 w-3.5 text-green-500" />
                {worker.hourlyRate}/hr
              </div>
            )}
            <Badge
              variant={worker.availability === 'available' ? 'success' : worker.availability === 'busy' ? 'warning' : 'default'}
              className="mt-1"
            >
              {worker.availability === 'available' ? 'Available' : worker.availability === 'busy' ? 'Busy' : 'Unavailable'}
            </Badge>
          </div>
        </div>

        {worker.bio && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">{worker.bio}</p>
        )}

        {worker.skills && worker.skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {worker.skills.slice(0, 4).map((skill) => (
              <span key={skill} className="text-xs bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 px-2 py-0.5 rounded-full">
                {skill}
              </span>
            ))}
            {worker.skills.length > 4 && (
              <span className="text-xs text-gray-400">+{worker.skills.length - 4} more</span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
