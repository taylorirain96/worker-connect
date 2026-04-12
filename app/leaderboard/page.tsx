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
import { Trophy, RefreshCw } from 'lucide-react'

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
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Navbar />
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Hero section */}
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl mb-8 p-8 text-center shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(234,179,8,0.15)_0%,_transparent_70%)] pointer-events-none" />
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-[0_0_30px_rgba(234,179,8,0.5)] mb-4 mx-auto">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 bg-clip-text text-transparent mb-2">
                Leaderboard
              </h1>
              <p className="text-slate-400 text-sm">Week {weekId} &nbsp;·&nbsp; {weekRange}</p>
            </div>
          </div>

          {/* Refresh button */}
          <div className="flex justify-end mb-6">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Reward tier cards */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {/* Gold */}
            <div className="rounded-2xl border border-yellow-400/40 bg-gradient-to-b from-yellow-50 to-white dark:from-yellow-900/20 dark:to-slate-900 p-4 text-center shadow-[0_0_20px_rgba(234,179,8,0.15)]">
              <div className="text-2xl mb-1">🥇</div>
              <p className="font-bold text-yellow-600 dark:text-yellow-400 text-sm">Champion</p>
              <p className="text-xs text-slate-500">+{RANK_BONUSES[1].bonusPoints} bonus pts</p>
            </div>
            {/* Silver */}
            <div className="rounded-2xl border border-slate-400/40 bg-gradient-to-b from-slate-50 to-white dark:from-slate-700/20 dark:to-slate-900 p-4 text-center shadow-[0_0_20px_rgba(148,163,184,0.2)]">
              <div className="text-2xl mb-1">🥈</div>
              <p className="font-bold text-slate-500 dark:text-slate-300 text-sm">Runner-up</p>
              <p className="text-xs text-slate-500">+{RANK_BONUSES[2].bonusPoints} bonus pts</p>
            </div>
            {/* Bronze */}
            <div className="rounded-2xl border border-orange-400/40 bg-gradient-to-b from-orange-50 to-white dark:from-orange-900/20 dark:to-slate-900 p-4 text-center shadow-[0_0_20px_rgba(251,146,60,0.15)]">
              <div className="text-2xl mb-1">🥉</div>
              <p className="font-bold text-orange-500 dark:text-orange-400 text-sm">Rising Star</p>
              <p className="text-xs text-slate-500">+{RANK_BONUSES[3].bonusPoints} bonus pts</p>
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
                  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="flex-1 h-px bg-gradient-to-r from-transparent to-slate-200 dark:to-slate-700" />
                    Top Performers
                    <span className="flex-1 h-px bg-gradient-to-l from-transparent to-slate-200 dark:to-slate-700" />
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
                  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="flex-1 h-px bg-gradient-to-r from-transparent to-slate-200 dark:to-slate-700" />
                    Rankings
                    <span className="flex-1 h-px bg-gradient-to-l from-transparent to-slate-200 dark:to-slate-700" />
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
