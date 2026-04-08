import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import { ArrowLeft, Star, CheckCircle, MapPin, Briefcase, MessageSquare, Camera } from 'lucide-react'
import { getInitials } from '@/lib/utils'
import PhotoGallery from '@/components/jobs/PhotoGallery'
import type { JobPhoto } from '@/types'

// Mock photo data for profile display
const MOCK_PROFILE_PHOTOS: JobPhoto[] = [
  {
    id: 'prof-p1',
    jobId: 'j1',
    workerId: 'w1',
    workerName: 'User Profile',
    url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    caption: 'Bathroom pipe repair — before',
    type: 'before',
    approvalStatus: 'approved',
    uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    fileSize: 1_234_567,
  },
  {
    id: 'prof-p2',
    jobId: 'j1',
    workerId: 'w1',
    workerName: 'User Profile',
    url: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400',
    caption: 'Bathroom pipe repair — after',
    type: 'after',
    approvalStatus: 'approved',
    uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    fileSize: 987_654,
  },
  {
    id: 'prof-p3',
    jobId: 'j2',
    workerId: 'w1',
    workerName: 'User Profile',
    url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400',
    caption: 'Electrical panel — completed',
    type: 'after',
    approvalStatus: 'approved',
    uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    fileSize: 2_100_000,
  },
]
import { ArrowLeft, Star, CheckCircle, MapPin, Briefcase, MessageSquare, Trophy, DollarSign, Users, Camera } from 'lucide-react'
import { getInitials, formatCurrency } from '@/lib/utils'
import { LEADERBOARD_BADGE_DEFINITIONS } from '@/lib/leaderboard/rankingLogic'
import { generateReferralCode } from '@/lib/referrals/referralLogic'
import { BADGE_DEFINITIONS } from '@/lib/services/gamificationService'
import ReviewSummary from '@/components/reviews/ReviewSummary'

/** Mock leaderboard data — replaced by real data once Firebase is wired. */
const MOCK_RANK = {
  rank: 4,
  totalEntries: 48,
  weeklyPoints: 310,
  previousRank: 6,
  badgesEarned: ['weekly_champion', 'photo_master'],
}

/** Mock earnings data — replaced by real data once Firebase is wired. */
const MOCK_EARNINGS = {
  totalLifetime: 1847.50,
  thisMonth: 312.40,
  completedJobs: 47,
  referralCode: generateReferralCode('mock-worker-id'),
}

/** Mock photo stats — replaced by real data once Firebase is wired. */
const MOCK_PHOTO_STATS = {
  totalPhotos: 63,
  photoCompletionRate: 87,
  avgPhotosPerJob: 3.2,
  totalJobsWithPhotos: 41,
}

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

            {/* Earnings section */}
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="h-5 w-5 text-emerald-500" />
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Earnings</h2>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                    {formatCurrency(MOCK_EARNINGS.totalLifetime)}
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-0.5">Lifetime</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(MOCK_EARNINGS.thisMonth)}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">This Month</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {MOCK_EARNINGS.completedJobs}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Jobs Done</p>
                </div>
              </div>

              {/* Referral code */}
              <div className="flex items-center justify-between p-3 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary-500" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Referral Code</p>
                    <p className="text-sm font-bold font-mono text-primary-600 dark:text-primary-400">
                      {MOCK_EARNINGS.referralCode}
                    </p>
                  </div>
                </div>
                <Link
                  href="/referrals"
                  className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 hover:underline"
                >
                  View referrals →
                </Link>
              </div>

              <div className="mt-3 flex gap-3">
                <Link href="/earnings" className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 hover:underline">
                  Earnings dashboard →
                </Link>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
              <p className="text-gray-500 italic">This user has not added a bio yet.</p>
            </div>

            {/* Photo Documentation Stats */}
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <Camera className="h-5 w-5 text-primary-600" />
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Photo Documentation</h2>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-primary-700 dark:text-primary-400">
                    {MOCK_PHOTO_STATS.totalPhotos}
                  </p>
                  <p className="text-xs text-primary-600 dark:text-primary-500 mt-0.5">Total Photos</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {MOCK_PHOTO_STATS.photoCompletionRate}%
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Photo Rate</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {MOCK_PHOTO_STATS.avgPhotosPerJob}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Avg / Job</p>
                </div>
              </div>

              {/* Photo badges */}
              <div className="flex gap-2 flex-wrap">
                {MOCK_RANK.badgesEarned
                  .filter((b) => b === 'photo_master' || b === 'detail_oriented')
                  .map((b) => {
                    const def = BADGE_DEFINITIONS[b]
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
            </div>

            <div className="mt-6 flex gap-3">
              <Link href="/messages">
                <Button>
                  <MessageSquare className="h-4 w-4" />
                  Send Message
                </Button>
              </Link>
            </div>

            {/* Review Summary */}
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
              <ReviewSummary entityId="mock-worker-id" profileId="mock-worker-id" />
            </div>
          </div>

          {/* Photo Stats */}
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Camera className="h-5 w-5 text-primary-600" />
              <h2 className="font-semibold text-gray-900 dark:text-white">Photo Documentation</h2>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Total Photos', value: MOCK_PROFILE_PHOTOS.length },
                { label: 'Jobs Documented', value: new Set(MOCK_PROFILE_PHOTOS.map((p) => p.jobId)).size },
                { label: 'Approval Rate', value: `${Math.round((MOCK_PROFILE_PHOTOS.filter((p) => p.approvalStatus === 'approved').length / MOCK_PROFILE_PHOTOS.length) * 100)}%` },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
            <PhotoGallery photos={MOCK_PROFILE_PHOTOS} showComparisonTab />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
