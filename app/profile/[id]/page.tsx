import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import { ArrowLeft, Star, CheckCircle, MapPin, Briefcase, MessageSquare, Trophy, Camera } from 'lucide-react'
import { getInitials } from '@/lib/utils'
import { LEADERBOARD_BADGE_DEFINITIONS } from '@/lib/leaderboard/rankingLogic'
import PhotoGallery from '@/components/jobs/PhotoGallery'
import { MOCK_PHOTOS } from '@/lib/photos/firebase'
import { PHOTO_BADGE_DEFINITIONS, computePhotoBadges } from '@/lib/photos/gamificationLogic'

/** Mock leaderboard data — replaced by real data once Firebase is wired. */
const MOCK_RANK = {
  rank: 4,
  totalEntries: 48,
  weeklyPoints: 310,
  previousRank: 6,
  badgesEarned: ['weekly_champion'],
}

/** Mock photo stats — replaced by real Firestore data once Firebase is wired. */
const MOCK_WORKER_ID = 'worker1'
const MOCK_PHOTO_STATS = {
  totalPhotos: MOCK_PHOTOS.filter((p) => p.workerId === MOCK_WORKER_ID).length,
  jobsWithPhotos: 1,
  totalCompletedJobs: 3,
}
const photoCompletionRate = MOCK_PHOTO_STATS.totalCompletedJobs > 0
  ? Math.round((MOCK_PHOTO_STATS.jobsWithPhotos / MOCK_PHOTO_STATS.totalCompletedJobs) * 100)
  : 0
const workerPhotos = MOCK_PHOTOS.filter((p) => p.workerId === MOCK_WORKER_ID)
const earnedPhotoBadges = computePhotoBadges(workerPhotos, MOCK_PHOTO_STATS.totalCompletedJobs)

export default function UserProfilePage() {
  const rankChange = MOCK_RANK.previousRank - MOCK_RANK.rank
  const trendLabel =
    rankChange > 0
      ? `↑ ${rankChange} from last week`
      : rankChange < 0
      ? `↓ ${Math.abs(rankChange)} from last week`
      : '→ Same as last week'

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/workers" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6 text-sm">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start gap-5">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-2xl font-bold">
                {getInitials('User Profile')}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Profile</h1>
                  <CheckCircle className="h-5 w-5 text-blue-500" />
                </div>
                <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                  <MapPin className="h-4 w-4" />
                  Location not set
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">-</span>
                    <span className="text-gray-500">(0 reviews)</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Briefcase className="h-4 w-4" />
                    0 completed
                  </div>
                </div>
              </div>
            </div>

            {/* Leaderboard rank section */}
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Weekly Leaderboard</h2>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                    #{MOCK_RANK.rank}
                  </p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-0.5">This Week</p>
                  <p className="text-xs text-gray-400 mt-0.5">{trendLabel}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {MOCK_RANK.weeklyPoints.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Weekly Points</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {MOCK_RANK.totalEntries}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Total Workers</p>
                </div>
              </div>

              {/* Leaderboard badges */}
              {MOCK_RANK.badgesEarned.length > 0 && (
                <div className="flex gap-2 flex-wrap mb-3">
                  {MOCK_RANK.badgesEarned.map((b) => {
                    const def = LEADERBOARD_BADGE_DEFINITIONS[b]
                    if (!def) return null
                    return (
                      <span
                        key={b}
                        title={def.description}
                        className="text-xs bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 px-2 py-1 rounded-full"
                      >
                        {def.icon} {def.label}
                      </span>
                    )
                  })}
                </div>
              )}

              <Link
                href="/leaderboard"
                className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 hover:underline"
              >
                View full leaderboard →
              </Link>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
              <p className="text-gray-500 italic">This user has not added a bio yet.</p>
            </div>

            {/* Photo stats & gallery */}
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <Camera className="h-5 w-5 text-primary-500" />
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Job Photos</h2>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{MOCK_PHOTO_STATS.totalPhotos}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Photos</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{photoCompletionRate}%</p>
                  <p className="text-xs text-gray-500 mt-0.5">Jobs with Photos</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {MOCK_PHOTO_STATS.jobsWithPhotos > 0
                      ? (MOCK_PHOTO_STATS.totalPhotos / MOCK_PHOTO_STATS.jobsWithPhotos).toFixed(1)
                      : '0'}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Avg per Job</p>
                </div>
              </div>

              {/* Photo badges */}
              {earnedPhotoBadges.map((badgeId) => {
                const badge = PHOTO_BADGE_DEFINITIONS[badgeId]
                if (!badge) return null
                return (
                  <span
                    key={badge.id}
                    title={badge.description}
                    className="inline-flex items-center gap-1 mr-2 mb-2 text-xs bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 px-2 py-1 rounded-full"
                  >
                    {badge.icon} {badge.label}
                  </span>
                )
              })}

              {/* Gallery highlights */}
              <PhotoGallery photos={workerPhotos} className="mt-3" />
            </div>

            <div className="mt-6 flex gap-3">
              <Link href="/messages">
                <Button>
                  <MessageSquare className="h-4 w-4" />
                  Send Message
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
