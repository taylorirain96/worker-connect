'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import RatingAppealCard from '@/components/disputes/RatingAppealCard'
import { useAuth } from '@/components/providers/AuthProvider'
import { getWorkerRatingAppeals } from '@/lib/services/disputeService'
import type { RatingAppeal } from '@/types'
import { Star, Plus, ArrowLeft } from 'lucide-react'

export default function RatingAppealsPage() {
  const { user } = useAuth()
  const [appeals, setAppeals] = useState<RatingAppeal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    getWorkerRatingAppeals(user.uid)
      .then(setAppeals)
      .finally(() => setLoading(false))
  }, [user])

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
              <Star className="h-7 w-7 text-yellow-500" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Rating Appeals</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Appeal ratings you believe are unfair
                </p>
              </div>
            </div>
            <Link
              href="/rating-appeals/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Appeal
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-gray-400 dark:text-gray-600">Loading…</div>
          ) : appeals.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <Star className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400">No rating appeals yet.</p>
              <Link
                href="/rating-appeals/new"
                className="inline-flex items-center gap-2 text-sm text-primary-600 hover:underline"
              >
                <Plus className="h-4 w-4" />
                File your first appeal
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {appeals.map((a) => (
                <RatingAppealCard key={a.id} appeal={a} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
