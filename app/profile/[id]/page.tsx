'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import { ArrowLeft, Star, CheckCircle, MapPin, Briefcase, MessageSquare, Trophy } from 'lucide-react'
import { getInitials } from '@/lib/utils'
import { LEADERBOARD_BADGE_DEFINITIONS } from '@/lib/leaderboard/rankingLogic'
import { getWeeklyLeaderboard } from '@/lib/leaderboard/firebase'
import type { LeaderboardEntry } from '@/lib/leaderboard/rankingLogic'
import ReviewSummary from '@/components/reviews/ReviewSummary'
import { getUserProfile } from '@/lib/users/getProfile'
import type { UserProfile } from '@/types'

export default function UserProfilePage() {
  const params = useParams()
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string)

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [leaderboardEntry, setLeaderboardEntry] = useState<LeaderboardEntry | null>(null)
  const [totalEntries, setTotalEntries] = useState(0)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) return
    async function fetchData() {
      setLoading(true)
      const [userProfile, leaderboard] = await Promise.all([
        getUserProfile(id),
        getWeeklyLeaderboard('all', 50),
      ])
      if (!userProfile) {
        setNotFound(true)
      } else {
        setProfile(userProfile)
        const entry = leaderboard.find((e) => e.userId === id) ?? null
        setLeaderboardEntry(entry)
        setTotalEntries(leaderboard.length)
      }
      setLoading(false)
    }
    fetchData()
  }, [id])

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse space-y-4">
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-start gap-5">
                  <div className="h-20 w-20 rounded-full bg-gray-200 dark:bg-gray-700" />
                  <div className="flex-1 space-y-3">
                    <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (notFound || !profile) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Link href="/workers" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6 text-sm">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
              <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Profile not found</p>
              <p className="text-gray-500 text-sm">This worker profile does not exist or has been removed.</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const rankChange =
    leaderboardEntry?.previousRank != null && leaderboardEntry?.rank != null
      ? leaderboardEntry.previousRank - leaderboardEntry.rank
      : null
  const trendLabel =
    rankChange == null
      ? null
      : rankChange > 0
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
              {profile.photoURL ? (
                <Image
                  src={profile.photoURL}
                  alt={profile.displayName ?? 'Worker'}
                  width={80}
                  height={80}
                  className="h-20 w-20 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                  {getInitials(profile.displayName ?? 'W')}
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {profile.displayName ?? 'Worker'}
                  </h1>
                  {profile.verified && <CheckCircle className="h-5 w-5 text-blue-500" />}
                </div>
                {profile.location && (
                  <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                    <MapPin className="h-4 w-4" />
                    {profile.location}
                  </div>
                )}
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{profile.rating?.toFixed(1) ?? '-'}</span>
                    <span className="text-gray-500">({profile.reviewCount ?? 0} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Briefcase className="h-4 w-4" />
                    {profile.completedJobs ?? 0} completed
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{profile.bio}</p>
              </div>
            )}

            {/* Skills */}
            {profile.skills && profile.skills.length > 0 && (
              <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-700">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 px-3 py-1.5 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Leaderboard rank section */}
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Weekly Leaderboard</h2>
              </div>
              {leaderboardEntry ? (
                <>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                        #{leaderboardEntry.rank}
                      </p>
                      <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-0.5">This Week</p>
                      {trendLabel && (
                        <p className="text-xs text-gray-400 mt-0.5">{trendLabel}</p>
                      )}
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {leaderboardEntry.weeklyPoints.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">Weekly Points</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {totalEntries}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">Total Workers</p>
                    </div>
                  </div>
                  {leaderboardEntry.badges && leaderboardEntry.badges.length > 0 && (
                    <div className="flex gap-2 flex-wrap mb-3">
                      {leaderboardEntry.badges.map((b) => {
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
                </>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Not ranked this week</p>
              )}
              <Link
                href="/leaderboard"
                className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 hover:underline"
              >
                View full leaderboard →
              </Link>
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
              <ReviewSummary entityId={id} profileId={id} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
