'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Card, CardContent } from '@/components/ui/Card'
import DisputeCard from '@/components/disputes/DisputeCard'
import RatingAppealCard from '@/components/disputes/RatingAppealCard'
import { getPendingDisputes, getPendingRatingAppeals } from '@/lib/services/disputeService'
import type { Dispute, RatingAppeal } from '@/types'
import { AlertTriangle, Star, ArrowLeft, RefreshCw } from 'lucide-react'

type Tab = 'disputes' | 'appeals'

export default function AdminDisputesPage() {
  const [tab, setTab] = useState<Tab>('disputes')
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [appeals, setAppeals] = useState<RatingAppeal[]>([])
  const [loading, setLoading] = useState(true)

  async function refresh() {
    setLoading(true)
    const [d, a] = await Promise.all([getPendingDisputes(), getPendingRatingAppeals()])
    setDisputes(d)
    setAppeals(a)
    setLoading(false)
  }

  useEffect(() => { refresh() }, [])

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Admin
          </Link>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-7 w-7 text-red-500" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mediator Queue</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Review pending disputes and rating appeals
                </p>
              </div>
            </div>
            <button
              onClick={refresh}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card padding="sm">
              <CardContent>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">Pending Disputes</span>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{disputes.length}</p>
              </CardContent>
            </Card>
            <Card padding="sm">
              <CardContent>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">Pending Appeals</span>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{appeals.length}</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {([['disputes', 'Disputes', AlertTriangle], ['appeals', 'Rating Appeals', Star]] as const).map(
              ([key, label, Icon]) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                    tab === key
                      ? 'border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              )
            )}
          </div>

          {loading ? (
            <div className="py-12 text-center text-gray-400 dark:text-gray-600">Loading…</div>
          ) : tab === 'disputes' ? (
            disputes.length === 0 ? (
              <div className="py-12 text-center text-gray-400 dark:text-gray-600">
                No pending disputes. 🎉
              </div>
            ) : (
              <div className="space-y-3">
                {disputes.map((d) => (
                  <DisputeCard key={d.id} dispute={d} href={`/admin/disputes/${d.id}`} />
                ))}
              </div>
            )
          ) : (
            appeals.length === 0 ? (
              <div className="py-12 text-center text-gray-400 dark:text-gray-600">
                No pending appeals. 🎉
              </div>
            ) : (
              <div className="space-y-3">
                {appeals.map((a) => (
                  <RatingAppealCard key={a.id} appeal={a} />
                ))}
              </div>
            )
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
