'use client'
import { useState, useEffect, useMemo } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Card, CardContent } from '@/components/ui/Card'
import LeaderboardCard from '@/components/leaderboard/LeaderboardCard'
import LeaderboardFilters, { type LeaderboardCategory } from '@/components/leaderboard/LeaderboardFilters'
import { getWeeklyLeaderboard } from '@/lib/leaderboard/firebase'
import { getWeekId, getWeekBounds, RANK_BONUSES } from '@/lib/leaderboard/rankingLogic'
import type { LeaderboardEntry } from '@/lib/leaderboard/rankingLogic'
import { useAuth } from '@/components/providers/AuthProvider'
import { Trophy, RefreshCw, Calendar, Info } from 'lucide-react'
import Button from '@/components/ui/Button'

function formatWeekRange(date: Date = new Date()): string {
  const { start, end } = getWeekBounds(date)
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-NZ', { month: 'short', day: 'numeric' })
  return `${fmt(start)} – ${fmt(end)}`
}

export default function LeaderboardPage() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<LeaderboardCategory>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const weekId = getWeekId()
  const weekRange = formatWeekRange()

  const loadLeaderboard = async (cat: LeaderboardCategory) => {
    setLoading(true)
    const data = await getWeeklyLeaderboard(cat, 10)
    setEntries(data)
    setLoading(false)
  }

  useEffect(() => {
    loadLeaderboard(selectedCategory)
  }, [selectedCategory])

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadLeaderboard(selectedCategory)
    setRefreshing(false)
  }

  const handleCategoryChange = (cat: LeaderboardCategory) => {
    setSelectedCategory(cat)
    setSearchQuery('')
  }

  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return entries
    const q = searchQuery.toLowerCase()
    return entries.filter((e) => e.displayName.toLowerCase().includes(q))
  }, [entries, searchQuery])

  const topThree = filteredEntries.slice(0, 3)
  const rest = filteredEntries.slice(3)

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950">
      <Navbar />
      <main className="flex-1 bg-gradient-to-b from-slate-100 to-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Header */}
          <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Trophy className="h-7 w-7 text-yellow-500" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Leaderboard</h1>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Calendar className="h-4 w-4" />
                <span>Week {weekId} &nbsp;·&nbsp; {weekRange}</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              loading={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>

          {/* Reward info banner */}
          <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl flex items-start gap-3">
            <Info className="h-5 w-5 text-indigo-500 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-slate-700 dark:text-slate-300 space-y-0.5">
              <p className="font-semibold">Weekly Rewards — Top 3 each Sunday</p>
              <p>
                {RANK_BONUSES[1].label} +{RANK_BONUSES[1].bonusPoints} pts &nbsp;·&nbsp;
                {RANK_BONUSES[2].label} +{RANK_BONUSES[2].bonusPoints} pts &nbsp;·&nbsp;
                {RANK_BONUSES[3].label} +{RANK_BONUSES[3].bonusPoints} pts
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6">
            <LeaderboardFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
            />
          </div>

          {/* Leaderboard list */}
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : filteredEntries.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Trophy className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">
                  {searchQuery ? 'No workers match your search.' : 'No entries yet this week.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Podium — top 3 */}
              {topThree.length > 0 && (
                <div>
                  <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    Top Performers
                  </h2>
                  <div className="space-y-2">
                    {topThree.map((entry) => (
                      <LeaderboardCard
                        key={entry.userId}
                        entry={entry}
                        isCurrentUser={entry.userId === user?.uid}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Rest of top 10 */}
              {rest.length > 0 && (
                <div>
                  <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    Rankings
                  </h2>
                  <div className="space-y-2">
                    {rest.map((entry) => (
                      <LeaderboardCard
                        key={entry.userId}
                        entry={entry}
                        isCurrentUser={entry.userId === user?.uid}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer note */}
          <p className="mt-8 text-center text-xs text-gray-400 dark:text-gray-600">
            Resets every Sunday at midnight · Earn points by completing jobs and receiving reviews
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
