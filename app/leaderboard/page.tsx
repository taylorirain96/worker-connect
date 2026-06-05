'use client'
import { useState, useEffect, useMemo } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import LeaderboardCard from '@/components/leaderboard/LeaderboardCard'
import LeaderboardFilters, { type LeaderboardCategory } from '@/components/leaderboard/LeaderboardFilters'
import NeonPodium from '@/components/leaderboard/NeonPodium'
import { getWeeklyLeaderboard } from '@/lib/leaderboard/firebase'
import { getWeekId, getWeekBounds } from '@/lib/leaderboard/rankingLogic'
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
    const data = await getWeeklyLeaderboard(cat, 50)
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
  const currentUserEntry = user
    ? entries.find((e) => e.userId === user.uid)
    : undefined

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <Navbar />
      <main className="flex-1 relative overflow-hidden">
        {/* Animated neon background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />
          <div className="absolute -top-20 right-0 h-96 w-96 rounded-full bg-fuchsia-500/20 blur-3xl" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
        </div>

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-8">
          {/* Arcade frame */}
          <div className="relative rounded-3xl border border-emerald-500/30 bg-slate-950/80 backdrop-blur-xl shadow-[0_0_40px_rgba(52,211,153,0.25)] overflow-hidden">
            {/* Top bar */}
            <div className="flex items-center justify-between px-5 pt-5">
              <button
                aria-label="Info"
                className="inline-flex items-center justify-center h-7 w-7 rounded text-emerald-300/80 hover:text-emerald-200 hover:bg-emerald-500/10 transition-colors"
              >
                <Trophy className="h-4 w-4" />
              </button>
              <h1
                className="text-2xl sm:text-3xl font-black tracking-[0.25em] text-emerald-300"
                style={{ textShadow: '0 0 12px rgba(52,211,153,0.7), 0 0 22px rgba(52,211,153,0.4)' }}
              >
                LEADERBOARD
              </h1>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                aria-label="Refresh"
                className="inline-flex items-center justify-center h-7 w-7 rounded text-emerald-300/80 hover:text-emerald-200 hover:bg-emerald-500/10 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Week meta */}
            <p className="text-center text-[10px] uppercase tracking-[0.3em] text-emerald-300/50 mt-1">
              Week {weekId} · {weekRange}
            </p>

            {/* Podium */}
            {loading ? (
              <div className="h-56 flex items-center justify-center">
                <div className="text-emerald-300/60 text-xs uppercase tracking-widest animate-pulse">
                  Loading…
                </div>
              </div>
            ) : (
              <NeonPodium topThree={topThree} currentUserId={user?.uid} />
            )}

            {/* You currently rank pill */}
            {currentUserEntry && (
              <div className="mx-4 sm:mx-6 mb-4">
                <div
                  className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-cyan-400/60 bg-gradient-to-r from-cyan-500/20 via-cyan-400/30 to-cyan-500/20 shadow-[0_0_20px_rgba(34,211,238,0.5)]"
                >
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-100 drop-shadow-[0_0_4px_rgba(34,211,238,0.7)]">
                    You currently rank
                  </span>
                  <span className="font-mono text-lg font-extrabold text-cyan-50 tabular-nums">
                    {currentUserEntry.rank}
                  </span>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="px-4 sm:px-6 pb-4">
              <LeaderboardFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
              />
            </div>

            {/* Ranking list */}
            <div className="px-4 sm:px-6 pb-6">
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-14 rounded-xl bg-slate-800/60 border border-emerald-500/10 animate-pulse"
                    />
                  ))}
                </div>
              ) : filteredEntries.length === 0 ? (
                <div className="py-12 text-center">
                  <Trophy className="h-10 w-10 text-emerald-500/40 mx-auto mb-3" />
                  <p className="text-sm uppercase tracking-wider text-emerald-300/60">
                    {searchQuery ? 'No players match your search.' : 'No entries yet this week.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {rest.length === 0 ? (
                    <p className="text-center text-xs uppercase tracking-widest text-emerald-300/40 py-4">
                      Only the podium is set so far — keep grinding!
                    </p>
                  ) : (
                    rest.map((entry) => (
                      <LeaderboardCard
                        key={entry.userId}
                        entry={entry}
                        isCurrentUser={entry.userId === user?.uid}
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer note */}
          <p className="mt-6 text-center text-[10px] uppercase tracking-[0.25em] text-emerald-300/40">
            Resets every Sunday · Earn points by completing jobs & getting reviews
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
