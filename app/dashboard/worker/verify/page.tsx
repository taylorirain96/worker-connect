'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Button from '@/components/ui/Button'
import { useAuth } from '@/components/providers/AuthProvider'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { ShieldCheck, Upload, CheckCircle, Clock, XCircle, ArrowLeft, Camera, CreditCard } from 'lucide-react'
import toast from 'react-hot-toast'

type UploadStep = 'front' | 'back' | 'selfie'
type VerificationStatus = 'none' | 'pending' | 'approved' | 'rejected'

interface VerificationDoc {
  status: VerificationStatus
  frontUrl?: string
  backUrl?: string
  selfieUrl?: string
  rejectionReason?: string
  submittedAt?: string
}

const STEP_ORDER: UploadStep[] = ['front', 'back', 'selfie']

const STEP_INFO: Record<UploadStep, { label: string; description: string; icon: React.ElementType }> = {
  front: {
    label: 'Front of ID',
    description: 'Upload a clear photo of the front of your driver\'s licence or passport.',
    icon: CreditCard,
  },
  back: {
    label: 'Back of ID',
    description: 'Upload the back of your driver\'s licence (skip if using a passport).',
    icon: CreditCard,
  },
  selfie: {
    label: 'Selfie with ID',
    description: 'Take a photo of yourself clearly holding your ID next to your face.',
    icon: Camera,
  },
}

export default function VerifyIdentityPage() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()

  const [verificationDoc, setVerificationDoc] = useState<VerificationDoc | null>(null)
  const [docLoading, setDocLoading] = useState(true)

  const [currentStep, setCurrentStep] = useState<UploadStep>('front')
  const [uploads, setUploads] = useState<Partial<Record<UploadStep, { file: File; previewUrl: string; storageUrl: string }>>>({})
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Redirect if not a worker
  useEffect(() => {
    if (!authLoading && (!user || (profile && profile.role !== 'worker'))) {
      router.replace('/dashboard')
    }
  }, [authLoading, user, profile, router])

  // Load existing verification status
  useEffect(() => {
    if (!user) return
    async function loadStatus() {
      try {
        const { db } = await import('@/lib/firebase')
        if (!db) { setDocLoading(false); return }
        const { doc, getDoc } = await import('firebase/firestore')
        const snap = await getDoc(doc(db, 'verifications', user!.uid))
        if (snap.exists()) {
          const data = snap.data() as VerificationDoc & { submittedAt?: { toDate?: () => Date } | string }
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

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be smaller than 10 MB')
      return
    }

    const previewUrl = URL.createObjectURL(file)
    setUploading(true)

    try {
      const { storage } = await import('@/lib/firebase')
      if (!storage) {
        toast.error('Storage is not configured')
        return
      }
      const { ref, uploadBytesResumable, getDownloadURL } = await import('firebase/storage')
      const ext = file.name.split('.').pop() ?? 'jpg'
      const storagePath = `verification/${user.uid}/${currentStep}.${ext}`
      const storageRef = ref(storage, storagePath)

      await new Promise<void>((resolve, reject) => {
        const task = uploadBytesResumable(storageRef, file)
        task.on('state_changed', undefined, reject, () => resolve())
      })

      const storageUrl = await getDownloadURL(storageRef)
      setUploads((prev) => ({ ...prev, [currentStep]: { file, previewUrl, storageUrl } }))
      toast.success(`${STEP_INFO[currentStep].label} uploaded!`)
    } catch (err) {
      console.error('Upload error:', err)
      toast.error('Upload failed — please try again')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function handleNextStep() {
    const stepIndex = STEP_ORDER.indexOf(currentStep)
    if (stepIndex < STEP_ORDER.length - 1) {
      setCurrentStep(STEP_ORDER[stepIndex + 1])
    }
  }

  function handleSkipBack() {
    // Back of ID is optional — skip to selfie
    setCurrentStep('selfie')
  }

  async function handleSubmit() {
    if (!user) return
    if (!uploads.front || !uploads.selfie) {
      toast.error('Please upload front of ID and selfie before submitting')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/verification/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          frontUrl: uploads.front.storageUrl,
          backUrl: uploads.back?.storageUrl,
          selfieUrl: uploads.selfie.storageUrl,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Submission failed')

      setVerificationDoc({ status: 'pending', submittedAt: new Date().toISOString() })
      toast.success('Verification submitted! We\'ll review it shortly.')
    } catch (err) {
      console.error('Submit error:', err)
      toast.error('Submission failed — please try again')
    } finally {
      setSubmitting(false)
    }
  }

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

  // ── Status screens ──────────────────────────────────────────────────────────

  if (verificationDoc?.status === 'approved') {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-xl mx-auto px-4 py-12">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
              <CheckCircle className="h-14 w-14 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">You&apos;re Verified! ✓</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                Ka pai! Your identity has been verified. You now have the{' '}
                <span className="text-green-600 font-semibold">✓ Verified</span> badge on your profile — this builds trust with homeowners and helps you win more jobs.
              </p>
              <Link href="/dashboard/worker" className="inline-flex mt-6">
                <Button>Back to Dashboard</Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (verificationDoc?.status === 'pending') {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-xl mx-auto px-4 py-12">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
              <Clock className="h-14 w-14 text-amber-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Review in Progress</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                Your verification is being reviewed. This usually takes 1–2 business days. We&apos;ll email you when it&apos;s done.
              </p>
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

  if (verificationDoc?.status === 'rejected') {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-xl mx-auto px-4 py-12">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
              <XCircle className="h-14 w-14 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Verification Unsuccessful</h1>
              {verificationDoc.rejectionReason && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4 text-left">
                  <p className="text-red-700 dark:text-red-400 text-sm font-medium">Reason:</p>
                  <p className="text-red-600 dark:text-red-300 text-sm mt-1">{verificationDoc.rejectionReason}</p>
                </div>
              )}
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">
                Please resubmit with clearer photos. Make sure your ID is fully visible and the selfie clearly shows you holding the ID.
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

  const StepIcon = STEP_INFO[currentStep].icon
  const currentUpload = uploads[currentStep]
  const allDone = !!uploads.front && !!uploads.selfie

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
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Verify Your Identity</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Get the <span className="text-green-600 font-medium">✓ Verified</span> badge on your profile
              </p>
            </div>
          </div>

          {/* Optional-paperwork reassurance */}
          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20 p-3 text-sm text-blue-800 dark:text-blue-200">
            <p>
              <span className="font-semibold">Only ID is required.</span> Insurance, background checks and
              certifications are optional — you can post and accept jobs without them, and add them later when
              you&apos;re ready to earn extra trust badges.
            </p>
          </div>

          {/* Progress steps */}
          <div className="flex items-center gap-2 mb-6">
            {STEP_ORDER.map((step, i) => {
              const done = !!uploads[step]
              const active = step === currentStep
              return (
                <div key={step} className="flex items-center gap-2 flex-1">
                  <button
                    onClick={() => setCurrentStep(step)}
                    className={`flex items-center gap-2 text-xs font-medium transition-colors ${
                      active
                        ? 'text-green-600'
                        : done
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-400'
                    }`}
                  >
                    <div
                      className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                        done
                          ? 'bg-green-500 border-green-500 text-white'
                          : active
                          ? 'border-green-500 text-green-600'
                          : 'border-gray-300 dark:border-gray-600 text-gray-400'
                      }`}
                    >
                      {done ? '✓' : i + 1}
                    </div>
                    <span className="hidden sm:block">{STEP_INFO[step].label}</span>
                  </button>
                  {i < STEP_ORDER.length - 1 && (
                    <div className={`flex-1 h-0.5 ${done ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
                  )}
                </div>
              )
            })}
          </div>

          {/* Upload card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StepIcon className="h-5 w-5 text-green-600" />
                {STEP_INFO[currentStep].label}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {STEP_INFO[currentStep].description}
              </p>

              {/* Preview */}
              {currentUpload ? (
                <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 aspect-video bg-gray-100 dark:bg-gray-900">
                  <Image
                    src={currentUpload.previewUrl}
                    alt={STEP_INFO[currentStep].label}
                    fill
                    className="object-contain"
                  />
                  <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Uploaded
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500 transition-colors aspect-video flex flex-col items-center justify-center gap-3 bg-gray-50 dark:bg-gray-900 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <LoadingSpinner size="md" />
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-gray-400" />
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Tap to upload photo
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">JPG, PNG up to 10 MB</p>
                      </div>
                    </>
                  )}
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="sr-only"
                onChange={handleFileSelect}
              />

              {/* Actions */}
              <div className="flex flex-col gap-2">
                {currentUpload && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    Replace Photo
                  </Button>
                )}

                {/* Navigation */}
                {currentStep === 'back' && !currentUpload && (
                  <Button variant="outline" onClick={handleSkipBack}>
                    Skip — I&apos;m using a passport
                  </Button>
                )}

                {currentStep !== 'selfie' && currentUpload && (
                  <Button onClick={handleNextStep}>
                    Next Step →
                  </Button>
                )}

                {currentStep === 'selfie' && currentUpload && (
                  <Button onClick={handleNextStep}>
                    Review &amp; Submit
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Summary / Submit */}
          {allDone && (
            <div className="mt-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Ready to submit</h3>
              <div className="grid grid-cols-3 gap-3">
                {STEP_ORDER.map((step) => {
                  const upload = uploads[step]
                  return upload ? (
                    <div key={step} className="relative rounded-lg overflow-hidden aspect-square bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                      <Image src={upload.previewUrl} alt={step} fill className="object-cover" />
                      <div className="absolute inset-0 flex items-end p-1.5">
                        <span className="text-[10px] font-medium bg-black/60 text-white px-1.5 py-0.5 rounded">
                          {STEP_INFO[step].label}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div key={step} className="aspect-square rounded-lg bg-gray-100 dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                      <span className="text-[10px] text-gray-400 text-center px-1">{STEP_INFO[step].label}</span>
                    </div>
                  )
                })}
              </div>
              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? 'Submitting…' : 'Submit for Verification'}
              </Button>
              <p className="text-xs text-gray-400 text-center">
                Your images are stored securely and only reviewed by our admin team.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
