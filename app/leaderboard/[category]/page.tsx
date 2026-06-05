'use client'
import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import LeaderboardCard from '@/components/leaderboard/LeaderboardCard'
import { getWeeklyLeaderboard } from '@/lib/leaderboard/firebase'
import { getWeekId, getWeekBounds } from '@/lib/leaderboard/rankingLogic'
import type { LeaderboardEntry } from '@/lib/leaderboard/rankingLogic'
import { useAuth } from '@/components/providers/AuthProvider'
import { JOB_CATEGORIES } from '@/lib/utils'
import type { JobCategory } from '@/types'
import { ArrowLeft, Trophy, Search, X } from 'lucide-react'

function formatWeekRange(date: Date = new Date()): string {
  const { start, end } = getWeekBounds(date)
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${fmt(start)} – ${fmt(end)}`
}

export default function CategoryLeaderboardPage() {
  const params = useParams<{ category: string }>()
  const { user } = useAuth()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const rawCategory = params?.category ?? ''
  const categoryInfo = JOB_CATEGORIES.find((c) => c.id === rawCategory)
  const category = categoryInfo ? (rawCategory as JobCategory) : null

  const weekId = getWeekId()
  const weekRange = formatWeekRange()

  useEffect(() => {
    if (!category) return
    setLoading(true)
    getWeeklyLeaderboard(category, 10).then((data) => {
      setEntries(data)
      setLoading(false)
    })
  }, [category])

  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return entries
    const q = searchQuery.toLowerCase()
    return entries.filter((e) => e.displayName.toLowerCase().includes(q))
  }, [entries, searchQuery])

  if (!category || !categoryInfo) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-950">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl font-bold uppercase tracking-wider text-emerald-300 mb-2">Category not found</p>
            <Link href="/leaderboard" className="text-cyan-300 hover:text-cyan-200 text-sm uppercase tracking-widest">
              ← Back to Leaderboard
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <Navbar />
      <main className="flex-1 relative overflow-hidden">
        {/* Neon background glows */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />
          <div className="absolute -top-20 right-0 h-96 w-96 rounded-full bg-fuchsia-500/20 blur-3xl" />
        </div>

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-8">
          {/* Back link */}
          <Link
            href="/leaderboard"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-emerald-300/70 hover:text-emerald-200 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            All Categories
          </Link>

          <div className="rounded-3xl border border-emerald-500/30 bg-slate-950/80 backdrop-blur-xl shadow-[0_0_40px_rgba(52,211,153,0.25)] p-5 sm:p-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-2">
              <span className="text-4xl drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]">{categoryInfo.icon}</span>
              <div>
                <h1
                  className="text-2xl sm:text-3xl font-black uppercase tracking-[0.15em] text-emerald-300"
                  style={{ textShadow: '0 0 10px rgba(52,211,153,0.7)' }}
                >
                  {categoryInfo.label}
                </h1>
                <p className="text-[10px] uppercase tracking-[0.3em] text-emerald-300/50 mt-0.5">
                  Week {weekId} · {weekRange}
                </p>
              </div>
            </div>

            {/* Category description */}
            <p className="text-emerald-200/60 text-sm mb-6">{categoryInfo.description}</p>

            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400/70 pointer-events-none" />
              <input
                type="text"
                placeholder={`SEARCH ${categoryInfo.label.toUpperCase()}…`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-9 py-2.5 text-sm rounded-xl border border-emerald-500/30 bg-slate-900/70 text-emerald-200 placeholder-emerald-500/50 uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-cyan-400/60 focus:border-cyan-400/60 focus:shadow-[0_0_15px_rgba(34,211,238,0.35)] transition-shadow"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400/70 hover:text-emerald-300"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* List */}
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-14 rounded-xl bg-slate-800/60 border border-emerald-500/10 animate-pulse" />
                ))}
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="py-12 text-center">
                <Trophy className="h-10 w-10 text-emerald-500/40 mx-auto mb-3" />
                <p className="text-sm uppercase tracking-wider text-emerald-300/60">
                  {searchQuery
                    ? 'No players match your search.'
                    : `No ${categoryInfo.label} entries yet this week.`}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredEntries.map((entry) => (
                  <LeaderboardCard
                    key={entry.userId}
                    entry={entry}
                    isCurrentUser={entry.userId === user?.uid}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Other categories */}
          <div className="mt-10">
            <h2 className="text-[10px] font-bold text-emerald-300/50 uppercase tracking-[0.3em] mb-3">
              Other Categories
            </h2>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/leaderboard"
                className="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide bg-slate-900/70 border border-emerald-500/30 text-emerald-300 hover:border-emerald-400/60 hover:shadow-[0_0_8px_rgba(52,211,153,0.3)] transition-all"
              >
                🏆 Overall
              </Link>
              {JOB_CATEGORIES.filter((c) => c.id !== category).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/leaderboard/${cat.id}`}
                  className="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide bg-slate-900/70 border border-emerald-500/30 text-emerald-300 hover:border-emerald-400/60 hover:shadow-[0_0_8px_rgba(52,211,153,0.3)] transition-all"
                >
                  {cat.icon} {cat.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
