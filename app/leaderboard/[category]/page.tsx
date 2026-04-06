'use client'
import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Card, CardContent } from '@/components/ui/Card'
import LeaderboardCard from '@/components/leaderboard/LeaderboardCard'
import { getWeeklyLeaderboard } from '@/lib/leaderboard/firebase'
import { getWeekId, getWeekBounds } from '@/lib/leaderboard/rankingLogic'
import type { LeaderboardEntry } from '@/lib/leaderboard/rankingLogic'
import { useAuth } from '@/components/providers/AuthProvider'
import { JOB_CATEGORIES } from '@/lib/utils'
import type { JobCategory } from '@/types'
import { ArrowLeft, Trophy, Search, X } from 'lucide-react'
import Input from '@/components/ui/Input'

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
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Category not found</p>
            <Link href="/leaderboard" className="text-primary-600 hover:underline text-sm">
              ← Back to Leaderboard
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Back link */}
          <Link
            href="/leaderboard"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            All Categories
          </Link>

          {/* Header */}
          <div className="flex items-center gap-4 mb-2">
            <span className="text-4xl">{categoryInfo.icon}</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {categoryInfo.label} Leaderboard
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Week {weekId} · {weekRange}
              </p>
            </div>
          </div>

          {/* Category description */}
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{categoryInfo.description}</p>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <Input
              placeholder={`Search ${categoryInfo.label} workers…`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* List */}
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredEntries.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Trophy className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">
                  {searchQuery
                    ? 'No workers match your search.'
                    : `No ${categoryInfo.label} entries yet this week.`}
                </p>
              </CardContent>
            </Card>
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

          {/* Other categories */}
          <div className="mt-12">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Other Categories
            </h2>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/leaderboard"
                className="px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                🏆 Overall
              </Link>
              {JOB_CATEGORIES.filter((c) => c.id !== category).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/leaderboard/${cat.id}`}
                  className="px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
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
