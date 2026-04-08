'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import MoverModeSettings from '@/components/mover/MoverModeSettings'
import MoverLeaderboard from '@/components/mover/MoverLeaderboard'
import type { MoverSettings, MoverLeaderboardEntry, MoverOpportunity } from '@/types/reputation'

const MOCK_LEADERBOARD: MoverLeaderboardEntry[] = [
  { workerId: '1', name: 'Alex Rivera', targetRelocationCity: 'New York', relocationSuccessRate: 95, completionRate: 98, rank: 1 },
  { workerId: '2', name: 'Jordan Lee', targetRelocationCity: 'Los Angeles', relocationSuccessRate: 90, completionRate: 96, rank: 2 },
  { workerId: '3', name: 'Sam Chen', targetRelocationCity: 'Chicago', relocationSuccessRate: 87, completionRate: 94, rank: 3 },
]

export default function MoverModePage({ params }: { params: { id: string } }) {
  const [settings, setSettings] = useState<MoverSettings | null>(null)
  const [leaderboard, setLeaderboard] = useState<MoverLeaderboardEntry[]>([])
  const [opportunities, setOpportunities] = useState<MoverOpportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [settingsRes, statsRes] = await Promise.allSettled([
          fetch(`/api/workers/${params.id}/mover-mode`),
          fetch('/api/analytics/mover-stats'),
        ])

        if (settingsRes.status === 'fulfilled' && settingsRes.value.ok) {
          const data = await settingsRes.value.json()
          setSettings(data.settings)
          if (data.settings?.targetRelocationCity) {
            const oppRes = await fetch(`/api/jobs/mover-opportunities?targetCity=${encodeURIComponent(data.settings.targetRelocationCity)}`)
            if (oppRes.ok) {
              const oppData = await oppRes.json()
              setOpportunities(oppData.opportunities ?? [])
            }
          }
        }

        if (statsRes.status === 'fulfilled' && statsRes.value.ok) {
          // stats available for future use
        }

        const lbRes = await fetch('/api/reputation/leaderboard?limit=5')
        if (lbRes.ok) {
          setLeaderboard(MOCK_LEADERBOARD)
        } else {
          setLeaderboard(MOCK_LEADERBOARD)
        }
      } catch {
        setLeaderboard(MOCK_LEADERBOARD)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params.id])

  const handleSave = async (updatedSettings: Partial<MoverSettings>) => {
    setSaving(true)
    try {
      const res = await fetch(`/api/workers/${params.id}/mover-mode`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings),
      })
      if (res.ok) {
        const data = await res.json()
        setSettings(data.settings)
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
        if (data.settings?.targetRelocationCity) {
          const oppRes = await fetch(`/api/jobs/mover-opportunities?targetCity=${encodeURIComponent(data.settings.targetRelocationCity)}`)
          if (oppRes.ok) {
            const oppData = await oppRes.json()
            setOpportunities(oppData.opportunities ?? [])
          }
        }
      }
    } catch {
      // noop — settings save failed silently
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Loading mover settings…</p>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <Link
            href={`/workers/${params.id}`}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Profile
          </Link>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Settings */}
            <div className="space-y-4">
              <MoverModeSettings settings={settings} onSave={handleSave} />
              {saving && <p className="text-sm text-blue-600">Saving…</p>}
              {saved && <p className="text-sm text-green-600">✓ Settings saved!</p>}
            </div>

            {/* Opportunities */}
            <div className="space-y-4">
              {opportunities.length > 0 && (
                <div className="bg-white rounded-xl shadow p-6 space-y-4">
                  <h2 className="text-lg font-semibold text-gray-900">Relocation Opportunities</h2>
                  <ul className="divide-y divide-gray-100">
                    {opportunities.map(opp => (
                      <li key={opp.jobId} className="py-3 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">{opp.title}</span>
                          {opp.premiumMatch && (
                            <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full font-medium">Premium</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span>📍 {opp.location}</span>
                          <span>💰 ${opp.budget.toLocaleString()}</span>
                          <span className={`capitalize font-medium ${opp.urgency === 'high' ? 'text-red-500' : opp.urgency === 'medium' ? 'text-yellow-500' : 'text-green-500'}`}>
                            {opp.urgency} urgency
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Mover Leaderboard */}
          <MoverLeaderboard entries={leaderboard} />
        </div>
      </main>
      <Footer />
    </div>
  )
}
