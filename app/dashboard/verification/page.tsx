'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Button from '@/components/ui/Button'
import { useAuth } from '@/components/providers/AuthProvider'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { ShieldCheck, CheckCircle, Clock, XCircle, ArrowLeft } from 'lucide-react'
import IDUploadForm from '@/components/verification/IDUploadForm'

type VerificationStatus = 'none' | 'pending' | 'approved' | 'rejected'

interface WorkerVerificationDoc {
  status: VerificationStatus
  documentType?: string
  frontImageUrl?: string
  backImageUrl?: string
  rejectionReason?: string
  submittedAt?: string
}

const DOCUMENT_LABELS: Record<string, string> = {
  nz_drivers_licence: 'NZ Driver Licence',
  nz_passport: 'NZ Passport',
}

export default function VerificationCentrePage() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()

  const [verificationDoc, setVerificationDoc] = useState<WorkerVerificationDoc | null>(null)
  const [docLoading, setDocLoading] = useState(true)

  // Redirect if not a worker
  useEffect(() => {
    if (!authLoading && (!user || (profile && profile.role !== 'worker'))) {
      router.replace('/dashboard')
    }
  }, [authLoading, user, profile, router])

  // Load existing verification status from workerVerifications collection
  useEffect(() => {
    if (!user) return
    const uid = user.uid
    async function loadStatus() {
      try {
        const { db } = await import('@/lib/firebase')
        if (!db) { setDocLoading(false); return }
        const { doc, getDoc } = await import('firebase/firestore')
        const snap = await getDoc(doc(db, 'workerVerifications', uid))
        if (snap.exists()) {
          const data = snap.data() as WorkerVerificationDoc & {
            submittedAt?: { toDate?: () => Date } | string
          }
          const submittedAt = data.submittedAt
            ? typeof data.submittedAt === 'string'
              ? data.submittedAt
              : (data.submittedAt as { toDate?: () => Date }).toDate?.().toISOString()
            : undefined
          setVerificationDoc({ ...data, submittedAt })
        }
      } catch (err) {
        console.error('Error loading verification:', err)
      } finally {
        setDocLoading(false)
      }
    }
    loadStatus()
  }, [user])

  if (authLoading || docLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </main>
        <Footer />
      </div>
    )
  }

  if (!user) return null

  // ── Step indicator ──────────────────────────────────────────────────────────

  const steps = [
    { label: 'Upload ID', done: !!verificationDoc },
    { label: 'Admin Review', done: verificationDoc?.status === 'approved' || verificationDoc?.status === 'rejected' },
    { label: 'Verified', done: verificationDoc?.status === 'approved' },
  ]

  const activeStep = verificationDoc
    ? verificationDoc.status === 'approved'
      ? 2
      : verificationDoc.status === 'rejected'
      ? 0
      : 1
    : 0

  // ── Approved screen ─────────────────────────────────────────────────────────

  if (verificationDoc?.status === 'approved') {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-xl mx-auto px-4 py-12">
            <ProgressSteps steps={steps} activeStep={activeStep} />
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center mt-6">
              <CheckCircle className="h-14 w-14 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">You&apos;re Verified! ✓</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-2">
                Ka pai! Your identity has been verified. You now have the{' '}
                <span className="inline-flex items-center gap-1 text-blue-600 font-semibold">
                  <CheckCircle className="h-4 w-4" /> Verified
                </span>{' '}
                badge on your profile — this builds trust with homeowners and helps you win more jobs.
              </p>
              {verificationDoc.documentType && (
                <p className="text-xs text-gray-400 mb-6">
                  Verified with: {DOCUMENT_LABELS[verificationDoc.documentType] ?? verificationDoc.documentType}
                </p>
              )}
              <Link href="/dashboard/worker" className="inline-flex mt-2">
                <Button>Back to Dashboard</Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // ── Pending screen ──────────────────────────────────────────────────────────

  if (verificationDoc?.status === 'pending') {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-xl mx-auto px-4 py-12">
            <ProgressSteps steps={steps} activeStep={activeStep} />
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center mt-6">
              <Clock className="h-14 w-14 text-amber-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Review in Progress</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                Your verification is being reviewed. This usually takes 1–2 business days. We&apos;ll email you when it&apos;s done.
              </p>
              {verificationDoc.documentType && (
                <p className="text-xs text-gray-400 mt-3">
                  Submitted: {DOCUMENT_LABELS[verificationDoc.documentType] ?? verificationDoc.documentType}
                </p>
              )}
              <Link href="/dashboard/worker" className="inline-flex mt-6">
                <Button variant="outline">Back to Dashboard</Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // ── Rejected screen ─────────────────────────────────────────────────────────

  if (verificationDoc?.status === 'rejected') {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-xl mx-auto px-4 py-12">
            <ProgressSteps steps={steps} activeStep={activeStep} />
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center mt-6">
              <XCircle className="h-14 w-14 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Verification Unsuccessful</h1>
              {verificationDoc.rejectionReason && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4 text-left">
                  <p className="text-red-700 dark:text-red-400 text-sm font-medium">Reason:</p>
                  <p className="text-red-600 dark:text-red-300 text-sm mt-1">{verificationDoc.rejectionReason}</p>
                </div>
              )}
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">
                Please resubmit with clearer photos. Make sure your ID is fully visible and well-lit.
              </p>
              <Button onClick={() => setVerificationDoc(null)}>Resubmit Verification</Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // ── Upload flow ─────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-xl mx-auto px-4 py-8">
          <Link
            href="/dashboard/worker"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6 text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">ID Verification Centre</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Get the{' '}
                <span className="inline-flex items-center gap-0.5 text-blue-600 font-medium">
                  <CheckCircle className="h-3.5 w-3.5" /> Verified
                </span>{' '}
                badge on your profile
              </p>
            </div>
          </div>

          {/* Progress steps */}
          <ProgressSteps steps={steps} activeStep={activeStep} />

          {/* Upload form */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-green-600" />
                Step 1 — Upload Government-Issued ID
              </CardTitle>
            </CardHeader>
            <CardContent>
              <IDUploadForm
                uid={user.uid}
                onSuccess={() =>
                  setVerificationDoc({ status: 'pending', submittedAt: new Date().toISOString() })
                }
              />
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}

// ── Helper component ──────────────────────────────────────────────────────────

function ProgressSteps({
  steps,
  activeStep,
}: {
  steps: { label: string; done: boolean }[]
  activeStep: number
}) {
  return (
    <div className="flex items-center gap-2">
      {steps.map((step, i) => (
        <div key={step.label} className="flex items-center gap-2 flex-1">
          <div className="flex items-center gap-2">
            <div
              className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold border-2 flex-shrink-0 ${
                step.done
                  ? 'bg-green-500 border-green-500 text-white'
                  : i === activeStep
                  ? 'border-green-500 text-green-600 bg-white dark:bg-gray-900'
                  : 'border-gray-300 dark:border-gray-600 text-gray-400 bg-white dark:bg-gray-900'
              }`}
            >
              {step.done ? '✓' : i + 1}
            </div>
            <span
              className={`text-xs font-medium hidden sm:block ${
                step.done
                  ? 'text-gray-900 dark:text-white'
                  : i === activeStep
                  ? 'text-green-600'
                  : 'text-gray-400'
              }`}
            >
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`flex-1 h-0.5 ${step.done ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`}
            />
          )}
        </div>
      ))}
    </div>
  )
}
