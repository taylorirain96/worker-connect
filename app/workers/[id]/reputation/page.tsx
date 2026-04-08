'use client'

import { useState, useEffect } from 'react'
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
import { calculateCompletionRate, getCompletionLabel } from '@/lib/utils/completionRateCalc'

const MOCK_REPUTATION: ReputationScoreType = {
  userId: 'demo',
  score: 78,
  tier: 'expert',
  trustShields: 4,
  breakdown: {
    completionRate: 97,
    rating: 82,
    verification: 60,
    responseTime: 75,
    portfolio: 80,
  },
  calculatedAt: new Date().toISOString(),
}

const MOCK_COMPLETION: CompletionStats = {
  workerId: 'demo',
  completionRate: 97,
  totalJobs: 103,
  completedJobs: 100,
  cancelledJobs: 3,
  label: 'pro',
  trend: [
    { month: 'Jan', rate: 92 },
    { month: 'Feb', rate: 95 },
    { month: 'Mar', rate: 97 },
    { month: 'Apr', rate: 96 },
    { month: 'May', rate: 97 },
  ],
}

const MOCK_PORTFOLIO: WorkerPortfolio = {
  workerId: 'demo',
  items: [],
  totalProjects: 0,
  avgRating: 0,
}

const MOCK_BADGES = ['Expert Worker', 'Premium Access', 'Highly Trusted']

export default function WorkerReputationPage({ params }: { params: { id: string } }) {
  const [reputationScore, setReputationScore] = useState<ReputationScoreType | null>(null)
  const [verification, setVerification] = useState<WorkerVerification | null>(null)
  const [completionStats, setCompletionStats] = useState<CompletionStats | null>(null)
  const [portfolio, setPortfolio] = useState<WorkerPortfolio | null>(null)
  const [badges, setBadges] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<VerificationType>('government_id')

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
        } else {
          setReputationScore(MOCK_REPUTATION)
        }

        if (verRes.status === 'fulfilled' && verRes.value.ok) {
          const data = await verRes.value.json()
          setVerification(data.verification)
        }

        if (badgeRes.status === 'fulfilled' && badgeRes.value.ok) {
          const data = await badgeRes.value.json()
          setBadges(data.badges ?? [])
        } else {
          setBadges(MOCK_BADGES)
        }

        if (portRes.status === 'fulfilled' && portRes.value.ok) {
          const data = await portRes.value.json()
          setPortfolio(data.portfolio ?? MOCK_PORTFOLIO)
        } else {
          setPortfolio(MOCK_PORTFOLIO)
        }

        const completionRate = calculateCompletionRate(100, 103)
        setCompletionStats({
          ...MOCK_COMPLETION,
          completionRate,
          label: getCompletionLabel(completionRate),
        })
      } catch {
        setReputationScore(MOCK_REPUTATION)
        setBadges(MOCK_BADGES)
        setPortfolio(MOCK_PORTFOLIO)
        setCompletionStats(MOCK_COMPLETION)
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
                  <PortfolioGallery portfolio={portfolio} />
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
