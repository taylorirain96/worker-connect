'use client'

import { useState, useEffect, use } from 'react';
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ReputationScore from '@/components/reputation/ReputationScore'
import ReputationBreakdown from '@/components/reputation/ReputationBreakdown'
import BadgeDisplay from '@/components/reputation/BadgeDisplay'
import TrustShields from '@/components/reputation/TrustShields'
import VerificationChecklist from '@/components/verification/VerificationChecklist'
import VerificationModal from '@/components/verification/VerificationModal'
import CompletionRateDisplay from '@/components/completion/CompletionRateDisplay'
import CompletionRateChart from '@/components/completion/CompletionRateChart'
import PortfolioGallery from '@/components/portfolio/PortfolioGallery'
import PortfolioStats from '@/components/portfolio/PortfolioStats'
import type { ReputationScore as ReputationScoreType, WorkerVerification, CompletionStats, VerificationType, WorkerPortfolio } from '@/types/reputation'
import type { PortfolioPhoto } from '@/types'
import { getCompletionLabel } from '@/lib/utils/completionRateCalc'

export default function WorkerReputationPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const [reputationScore, setReputationScore] = useState<ReputationScoreType | null>(null)
  const [verification, setVerification] = useState<WorkerVerification | null>(null)
  const [completionStats, setCompletionStats] = useState<CompletionStats | null>(null)
  const [portfolio, setPortfolio] = useState<WorkerPortfolio | null>(null)
  const [badges, setBadges] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<VerificationType>('government_id')

  const portfolioPhotos: PortfolioPhoto[] = portfolio
    ? portfolio.items.flatMap((item) =>
        [item.beforeImageUrl, item.afterImageUrl]
          .filter((url): url is string => Boolean(url))
          .map((url, index) => ({
            id: `${item.id}-${index}`,
            uid: item.workerId,
            url,
            title: item.title,
            category: item.category,
            description: item.description,
            order: index,
            createdAt: item.completedAt,
          })),
      )
    : []

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [repRes, verRes, badgeRes, portRes] = await Promise.allSettled([
          fetch(`/api/reputation/${params.id}`),
          fetch(`/api/verification/status`, { headers: { 'x-user-id': params.id } }),
          fetch(`/api/trust-badges/${params.id}`),
          fetch(`/api/portfolio/${params.id}`),
        ])

        if (repRes.status === 'fulfilled' && repRes.value.ok) {
          const data = await repRes.value.json()
          setReputationScore(data)
          // Derive completion stats from the reputation score breakdown
          const cr = Math.round(data.breakdown?.completionRate ?? 97)
          const total = 100
          const completed = Math.round(total * (cr / 100))
          setCompletionStats({
            workerId: params.id,
            completionRate: cr,
            totalJobs: total,
            completedJobs: completed,
            cancelledJobs: total - completed,
            label: getCompletionLabel(cr),
            trend: [],
          })
        } else {
          setReputationScore(null)
          setCompletionStats(null)
        }

        if (verRes.status === 'fulfilled' && verRes.value.ok) {
          const data = await verRes.value.json()
          setVerification(data.verification)
        }

        if (badgeRes.status === 'fulfilled' && badgeRes.value.ok) {
          const data = await badgeRes.value.json()
          setBadges(data.badges ?? [])
        } else {
          setBadges([])
        }

        if (portRes.status === 'fulfilled' && portRes.value.ok) {
          const data = await portRes.value.json()
          setPortfolio(data.portfolio ?? null)
        } else {
          setPortfolio(null)
        }
      } catch {
        setReputationScore(null)
        setBadges([])
        setPortfolio(null)
        setCompletionStats(null)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params.id])

  const handleStartVerification = (type: VerificationType) => {
    setSelectedType(type)
    setModalOpen(true)
  }

  const handleVerificationComplete = async () => {
    await fetch(`/api/verification/start/${selectedType}`, {
      method: 'POST',
      headers: { 'x-user-id': params.id },
    })
    const res = await fetch('/api/verification/status', { headers: { 'x-user-id': params.id } })
    if (res.ok) {
      const data = await res.json()
      setVerification(data.verification)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Loading reputation data…</p>
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

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left column */}
            <div className="space-y-6">
              {reputationScore && <ReputationScore score={reputationScore} />}

              {reputationScore && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 space-y-2">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Trust Badges</h3>
                  <TrustShields shields={reputationScore.trustShields} />
                  <BadgeDisplay badges={badges} tier={reputationScore.tier} />
                </div>
              )}

              {!reputationScore && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 text-center text-gray-400 text-sm">
                  No reputation data available yet.
                </div>
              )}
            </div>

            {/* Main column */}
            <div className="lg:col-span-2 space-y-6">
              {reputationScore && <ReputationBreakdown score={reputationScore} />}

              {completionStats && (
                <>
                  <CompletionRateDisplay stats={completionStats} />
                  <CompletionRateChart trend={completionStats.trend} />
                </>
              )}

              <VerificationChecklist
                verification={verification}
                onStartVerification={handleStartVerification}
              />

              {portfolio && (
                <div className="space-y-4">
                  <PortfolioStats portfolio={portfolio} />
                  <PortfolioGallery photos={portfolioPhotos} />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {modalOpen && (
        <VerificationModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          type={selectedType}
          onComplete={handleVerificationComplete}
        />
      )}
    </div>
  )
}
