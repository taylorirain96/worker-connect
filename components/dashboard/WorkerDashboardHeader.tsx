import { Settings, Star, TrendingUp, Search } from 'lucide-react'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import AvailabilityToggle from '@/components/workers/AvailabilityToggle'
import type { UserProfile } from '@/types'

interface Props {
  firstName: string
  profile: UserProfile | null
}

export default function WorkerDashboardHeader({ firstName, profile }: Props) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back, {firstName}! 👋
        </h1>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <AvailabilityToggle />
          {(profile?.rating ?? 0) > 0 && (
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-gray-900 dark:text-white">{profile?.rating?.toFixed(1)}</span>
              <span className="text-gray-500 dark:text-gray-400">/ 5</span>
              <span className="text-gray-400 dark:text-gray-500 ml-1">({profile?.reviewCount ?? 0} review{(profile?.reviewCount ?? 0) === 1 ? '' : 's'})</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Link href="/settings/profile">
          <Button variant="outline" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Edit Profile
          </Button>
        </Link>
        <Link href="/dashboard/worker/analytics">
          <Button variant="outline" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </Button>
        </Link>
        <Link href="/jobs">
          <Button className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Find Jobs
          </Button>
        </Link>
      </div>
    </div>
  )
}
