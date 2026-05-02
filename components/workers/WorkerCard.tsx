'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Star, CheckCircle, Briefcase, DollarSign, MessageSquare } from 'lucide-react'
import type { UserProfile } from '@/types'
import { getInitials } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import { useAuth } from '@/components/providers/AuthProvider'
import { getOrCreateConversation } from '@/lib/messaging'
import toast from 'react-hot-toast'

interface WorkerCardProps {
  worker: UserProfile
}

export default function WorkerCard({ worker }: WorkerCardProps) {
  const { user, profile } = useAuth()
  const router = useRouter()
  const [messaging, setMessaging] = useState(false)

  const handleMessage = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      router.push(`/auth/login?redirect=/workers`)
      return
    }

    if (user.uid === worker.uid) return

    setMessaging(true)
    try {
      const convId = await getOrCreateConversation(
        user.uid,
        profile?.displayName || user.displayName || user.email || 'User',
        profile?.photoURL ?? user.photoURL ?? null,
        worker.uid,
        worker.displayName || 'Worker',
        worker.photoURL ?? null,
      )
      router.push(`/messages/${convId}`)
    } catch (err) {
      console.error('Failed to open conversation:', err)
      toast.error('Could not open conversation. Please try again.')
    } finally {
      setMessaging(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700 transition-all group flex flex-col">
      <Link href={`/workers/${worker.uid}`} className="flex-1">
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
          <div className="flex flex-wrap gap-1 mb-3">
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
      </Link>

      {/* Action buttons */}
      <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-700 mt-auto">
        <button
          onClick={handleMessage}
          disabled={messaging || user?.uid === worker.uid}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white transition-colors"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          {messaging ? 'Opening…' : 'Message'}
        </button>
        <Link
          href={`/workers/${worker.uid}`}
          className="flex-1 flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          View Profile
        </Link>
      </div>
    </div>
  )
}
