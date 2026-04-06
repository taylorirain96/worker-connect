'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import DisputeCard from '@/components/disputes/DisputeCard'
import { useAuth } from '@/components/providers/AuthProvider'
import { getUserDisputes } from '@/lib/services/disputeService'
import type { Dispute, DisputeResolutionStatus } from '@/types'
import { AlertTriangle, Plus, ArrowLeft } from 'lucide-react'

type Filter = 'all' | DisputeResolutionStatus

export default function DisputesPage() {
  const { user } = useAuth()
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('all')

  useEffect(() => {
    if (!user) return
    getUserDisputes(user.uid)
      .then(setDisputes)
      .finally(() => setLoading(false))
  }, [user])

  const filtered = filter === 'all' ? disputes : disputes.filter((d) => d.status === filter)

  const FILTERS: Filter[] = ['all', 'open', 'under_review', 'awaiting_evidence', 'resolved', 'closed', 'escalated']

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-7 w-7 text-red-500" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Disputes</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Manage disputes and track their progress
                </p>
              </div>
            </div>
            <Link
              href="/disputes/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              File Dispute
            </Link>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                  filter === f
                    ? 'border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {f === 'all' ? 'All' : f.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="py-12 text-center text-gray-400 dark:text-gray-600">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <AlertTriangle className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400">No disputes found.</p>
              {filter === 'all' && (
                <Link
                  href="/disputes/new"
                  className="inline-flex items-center gap-2 text-sm text-primary-600 hover:underline"
                >
                  <Plus className="h-4 w-4" />
                  File your first dispute
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((d) => (
                <DisputeCard key={d.id} dispute={d} href={`/disputes/${d.id}`} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
