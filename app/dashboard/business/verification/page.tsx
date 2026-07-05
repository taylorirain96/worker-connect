'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Shield,
  FileText,
  UserCheck,
  Star,
  Award,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import TrustBadge, { TrustScoreBar, VerificationStatusBadge } from '@/components/business/TrustBadge'
import BackgroundCheckSection from '@/components/business/verification/BackgroundCheckSection'
import CertificationsManager from '@/components/business/verification/CertificationsManager'
import ExternalRatingsForm from '@/components/business/verification/ExternalRatingsForm'
import InsuranceForm from '@/components/business/verification/InsuranceForm'
import LicenseForm from '@/components/business/verification/LicenseForm'
import { useAuth } from '@/components/providers/AuthProvider'
import { Card, CardContent } from '@/components/ui/Card'
import type { BusinessVerification } from '@/types'

// ─── Mock initial state ────────────────────────────────────────────────────────
// Kept for reference only; real data is loaded from /api/business/verification-status

// ─── helpers ─────────────────────────────────────────────────────────────────

function computeTrustScore(v: BusinessVerification): number {
  let score = 0
  if (v.license?.verified) score += 20
  if (v.insurance?.verified) score += 20
  if (v.backgroundCheck.status === 'clear') score += 20
  const hasExternalRating = Boolean(v.externalRatings.bbbRating || v.externalRatings.googleRating)
  if (hasExternalRating) score += 20
  if (v.certifications.some((c) => c.verified)) score += 20
  return score
}

function computeVerifiedCount(v: BusinessVerification): number {
  let count = 0
  if (v.license?.verified) count++
  if (v.insurance?.verified) count++
  if (v.backgroundCheck.status === 'clear') count++
  if (v.externalRatings.bbbRating || v.externalRatings.googleRating) count++
  if (v.certifications.some((c) => c.verified)) count++
  return count
}

// ─── Verification step item ───────────────────────────────────────────────────

interface StepStatus {
  status: 'verified' | 'pending' | 'not_started'
  label: string
}

function getStepStatus(v: BusinessVerification): {
  license: StepStatus
  insurance: StepStatus
  background: StepStatus
  ratings: StepStatus
  certs: StepStatus
} {
  return {
    license: {
      status: v.license?.verified ? 'verified' : 'not_started',
      label: v.license?.verified ? 'Verified' : 'Not Started',
    },
    insurance: {
      status: v.insurance?.verified ? 'verified' : 'not_started',
      label: v.insurance?.verified ? 'Verified' : 'Not Started',
    },
    background: {
      status:
        v.backgroundCheck.status === 'clear'
          ? 'verified'
          : v.backgroundCheck.status === 'pending'
          ? 'pending'
          : 'not_started',
      label:
        v.backgroundCheck.status === 'clear'
          ? 'Clear'
          : v.backgroundCheck.status === 'pending'
          ? 'In Progress'
          : 'Not Started',
    },
    ratings: {
      status:
        v.externalRatings.bbbRating || v.externalRatings.googleRating
          ? 'verified'
          : 'not_started',
      label:
        v.externalRatings.bbbRating || v.externalRatings.googleRating
          ? 'Linked'
          : 'Not Started',
    },
    certs: {
      status: v.certifications.some((c) => c.verified) ? 'verified' : v.certifications.length > 0 ? 'pending' : 'not_started',
      label:
        v.certifications.some((c) => c.verified)
          ? `${v.certifications.filter((c) => c.verified).length} Verified`
          : v.certifications.length > 0
          ? 'Pending Review'
          : 'Not Started',
    },
  }
}

// ─── Main page ────────────────────────────────────────────────────────────────

const EMPTY_VERIFICATION: BusinessVerification = {
  id: '',
  businessId: '',
  license: null,
  insurance: null,
  backgroundCheck: { status: 'not_started' },
  externalRatings: {},
  certifications: [],
  trustScore: 0,
  verifiedCount: 0,
  updatedAt: new Date().toISOString(),
}

export default function VerificationPage() {
  const { user } = useAuth()
  const [verification, setVerification] = useState<BusinessVerification>(EMPTY_VERIFICATION)
  const [openStep, setOpenStep] = useState<string | null>('license')
  const userId = user?.uid ?? ''

  // Load real verification data on mount
  useEffect(() => {
    if (!userId) return
    fetch('/api/business/verification-status', { headers: { 'x-user-id': userId } })
      .then((r) => r.json())
      .then((data: BusinessVerification) => {
        const next = { ...EMPTY_VERIFICATION, ...data }
        next.trustScore = computeTrustScore(next)
        next.verifiedCount = computeVerifiedCount(next)
        setVerification(next)
      })
      .catch(() => toast.error('Failed to load verification status'))
  }, [userId])

  function update(patch: Partial<BusinessVerification>) {
    setVerification((prev) => {
      const next = { ...prev, ...patch }
      next.trustScore = computeTrustScore(next)
      next.verifiedCount = computeVerifiedCount(next)
      return next
    })
  }

  const stepStatus = getStepStatus(verification)

  const steps = [
    {
      key: 'license',
      icon: FileText,
      title: 'License Verification',
      description: 'Verify your contractor or trade license for the state(s) you operate in.',
      estimatedTime: '2 min',
      status: stepStatus.license,
      content: (
        <LicenseForm
          onSave={(license) => update({ license })}
          userId={userId}
        />
      ),
    },
    {
      key: 'insurance',
      icon: Shield,
      title: 'Insurance Verification',
      description: 'Confirm your General Liability and / or Workers\' Compensation insurance.',
      estimatedTime: '3 min',
      status: stepStatus.insurance,
      content: (
        <InsuranceForm
          onSave={(insurance) => update({ insurance })}
          userId={userId}
        />
      ),
    },
    {
      key: 'background',
      icon: UserCheck,
      title: 'Background Check',
      description: 'Run a background check via Checkr to build enterprise-level trust.',
      estimatedTime: '1–3 business days',
      status: stepStatus.background,
      content: (
        <BackgroundCheckSection
          details={verification.backgroundCheck}
          onInitiate={(backgroundCheck) => update({ backgroundCheck })}
          userId={userId}
        />
      ),
    },
    {
      key: 'ratings',
      icon: Star,
      title: 'BBB & Google Ratings',
      description: 'Link your BBB and / or Google Business profile to auto-display ratings.',
      estimatedTime: '5 min',
      status: stepStatus.ratings,
      content: (
        <ExternalRatingsForm
          details={verification.externalRatings}
          onSave={(externalRatings) => update({ externalRatings })}
          userId={userId}
        />
      ),
    },
    {
      key: 'certs',
      icon: Award,
      title: 'Certifications',
      description: 'Add your professional certifications (OSHA, EPA, NATE, NFPA, etc.).',
      estimatedTime: '5 min',
      status: stepStatus.certs,
      content: (
        <CertificationsManager
          certs={verification.certifications}
          onAdd={(cert) => update({ certifications: [...verification.certifications, cert] })}
          onRemove={(id) =>
            update({ certifications: verification.certifications.filter((c) => c.id !== id) })
          }
          userId={userId}
        />
      ),
    },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/dashboard/employer"
              className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary-600" />
              Verification Center
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Complete verifications to earn trust badges and attract enterprise clients.
            </p>
          </div>

          {/* Trust Score + Progress */}
          <Card className="mb-6">
            <CardContent className="pt-5 pb-5">
              <div className="grid sm:grid-cols-2 gap-6">
                {/* Progress */}
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Verification Progress
                  </p>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      {verification.verifiedCount}
                    </span>
                    <span className="text-gray-400 text-lg">/ 5</span>
                    <span className="text-sm text-gray-500">verified</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2">
                    <div
                      className="bg-primary-600 h-2.5 rounded-full transition-all duration-700"
                      style={{ width: `${(verification.verifiedCount / 5) * 100}%` }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {steps.map((step) => {
                      const Icon = step.icon
                      const isVerified = step.status.status === 'verified'
                      return (
                        <span
                          key={step.key}
                          title={step.title}
                          className={`h-7 w-7 rounded-full flex items-center justify-center ${
                            isVerified
                              ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-gray-100 text-gray-400 dark:bg-gray-700'
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                      )
                    })}
                  </div>
                </div>

                {/* Trust Score */}
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Trust Score</p>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {verification.trustScore}
                    <span className="text-base text-gray-400 font-normal"> / 100</span>
                  </div>
                  <TrustScoreBar score={verification.trustScore} />
                  <div className="mt-3">
                    <TrustBadge
                      verifiedCount={verification.verifiedCount}
                      trustScore={verification.trustScore}
                      showScore
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Badges unlocked */}
          {verification.verifiedCount > 0 && (
            <Card className="mb-6 border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10">
              <CardContent className="pt-4 pb-4">
                <p className="text-sm font-semibold text-green-800 dark:text-green-300 mb-2 flex items-center gap-1.5">
                  <Award className="h-4 w-4" />
                  Badges Earned
                </p>
                <div className="flex flex-wrap gap-2">
                  {verification.verifiedCount >= 2 && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-300 dark:border-green-700">
                      <Shield className="h-3.5 w-3.5" /> Verified Contractor
                    </span>
                  )}
                  {verification.verifiedCount >= 4 && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-300 dark:border-blue-700">
                      <Star className="h-3.5 w-3.5" /> Trusted Professional
                    </span>
                  )}
                  {verification.verifiedCount >= 5 && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-300 dark:border-purple-700">
                      <Award className="h-3.5 w-3.5" /> Enterprise Certified
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Steps */}
          <div className="space-y-3">
            {steps.map((step, idx) => {
              const Icon = step.icon
              const isOpen = openStep === step.key
              const isVerified = step.status.status === 'verified'
              const isPending = step.status.status === 'pending'

              return (
                <Card key={step.key} className={isVerified ? 'border-green-200 dark:border-green-800' : ''}>
                  <button
                    className="w-full text-left"
                    onClick={() => setOpenStep(isOpen ? null : step.key)}
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-center gap-4 p-5">
                      {/* Step number / icon */}
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isVerified
                            ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                            : isPending
                            ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-gray-100 text-gray-400 dark:bg-gray-700'
                        }`}
                      >
                        {isVerified ? <CheckCircle className="h-5 w-5" /> : isPending ? <Clock className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">
                            {idx + 1}. {step.title}
                          </p>
                          <VerificationStatusBadge status={step.status.status} label={step.status.label} />
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{step.description}</p>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        {!isVerified && (
                          <span className="hidden sm:flex items-center gap-1 text-xs text-gray-400">
                            <Clock className="h-3 w-3" /> {step.estimatedTime}
                          </span>
                        )}
                        {isOpen ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                      </div>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 border-t border-gray-100 dark:border-gray-700 pt-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{step.description}</p>
                      {step.content}
                    </div>
                  )}
                </Card>
              )
            })}
          </div>

          {/* Info box */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                Why complete verifications?
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-400 mt-1 leading-relaxed">
                Verified businesses appear higher in search results, earn trust badges visible on their public
                profile, and are eligible for enterprise-tier job postings from hospitals, property management
                companies, and government facilities. Each verification step takes only a few minutes.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
