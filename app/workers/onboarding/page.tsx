'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { z } from 'zod'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import OnboardingStep from '@/components/onboarding/OnboardingStep'
import OnboardingProgress from '@/components/onboarding/OnboardingProgress'
import StripeConnectButton from '@/components/onboarding/StripeConnectButton'
import VerificationUpload from '@/components/onboarding/VerificationUpload'
import ProfilePhotoUpload from '@/components/onboarding/ProfilePhotoUpload'
import LocationSelector from '@/components/global/LocationSelector'
import Button from '@/components/ui/Button'
import { CheckCircle, Sparkles } from 'lucide-react'
import {
  formatLocalizedMobile,
  getMobilePlaceholder,
  isValidRegion,
  normalizeLocalizedMobile,
} from '@/lib/locationOptions'
import {
  localizedProfileFields,
  toLocalizedProfileMetadata,
} from '@/lib/validation/localizedProfile'
import type { Country, OnboardingChecklistItem } from '@/types'
import { useAuth } from '@/components/providers/AuthProvider'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

// ─── Step definitions ────────────────────────────────────────────────────────
const STEPS = [
  { id: 'welcome', title: 'Welcome to QuickTrade', description: 'Let\'s get your profile set up so clients can find you.' },
  { id: 'stripe', title: 'Connect Payment Account', description: 'Link your Stripe account to receive payments from clients.' },
  { id: 'verification', title: 'ID Verification', description: 'Verify your identity to build trust with clients.' },
  { id: 'profile_info', title: 'Profile Information', description: 'Tell clients about yourself.' },
  { id: 'skills', title: 'Skills & Hourly Rate', description: 'Showcase your expertise and set your rate.' },
  { id: 'profile_photo', title: 'Profile Photo', description: 'Add a professional photo so clients can recognize you.' },
  { id: 'review', title: 'Review & Complete', description: 'Almost done! Review your profile before going live.' },
] as const

type StepId = typeof STEPS[number]['id']

interface FormData {
  name: string
  bio: string
  country: Country
  phone: string
  region: string
  city: string
  skills: string
  hourlyRate: string
  profilePhoto: string
  verificationId: string
}

const onboardingProfileSchema = z.object({
  name: z.string().trim().min(2, 'Full name must be at least 2 characters'),
  bio: z.string().trim().min(20, 'Bio must be at least 20 characters'),
  ...localizedProfileFields,
}).superRefine((data, ctx) => {
  if (!isValidRegion(data.country, data.region)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['region'],
      message: data.country === 'AU' ? 'Please select a valid state or territory' : 'Please select a valid region',
    })
  }

  if (!normalizeLocalizedMobile(data.phone, data.country)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['phone'],
      message: data.country === 'AU'
        ? 'Enter a valid Australian mobile number starting with +61 or 04'
        : 'Enter a valid New Zealand mobile number starting with +64 or 02',
    })
  }
})

// ─── Inner component (uses useSearchParams) ──────────────────────────────────
function OnboardingContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()

  // Use authenticated user UID, falling back to query param only for admin pre-fills
  const workerId = user?.uid ?? searchParams.get('workerId')

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login?redirect=/workers/onboarding')
    }
  }, [authLoading, user, router])

  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [completion, setCompletion] = useState(0)
  const [checklist, setChecklist] = useState<OnboardingChecklistItem[]>([])
  const [completed, setCompleted] = useState(false)
  const [verificationId, setVerificationId] = useState<string | null>(null)

  const [form, setForm] = useState<FormData>({
    name: '',
    bio: '',
    country: 'NZ',
    phone: '',
    region: '',
    city: '',
    skills: '',
    hourlyRate: '',
    profilePhoto: '',
    verificationId: '',
  })
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FormData, string>>>({})

  const currentStep = STEPS[currentStepIndex]

  useEffect(() => {
    if (!profile) return

    setForm((prev) => ({
      ...prev,
      name: prev.name || profile.displayName || '',
      bio: prev.bio || profile.bio || '',
      country: profile.country ?? prev.country,
      phone: prev.phone || (profile.phone ? formatLocalizedMobile(profile.phone, profile.country ?? 'NZ') : ''),
      region: prev.region || profile.region || '',
      city: prev.city || profile.city || '',
      skills: prev.skills || (profile.skills?.join(', ') ?? ''),
      hourlyRate: prev.hourlyRate || (profile.hourlyRate ? String(profile.hourlyRate) : ''),
      profilePhoto: prev.profilePhoto || profile.photoURL || '',
    }))
  }, [profile])

  // Load progress & checklist on mount
  useEffect(() => {
    async function loadProgress() {
      try {
        const [progressRes, checklistRes] = await Promise.all([
          fetch(`/api/workers/onboarding?workerId=${workerId}`),
          fetch(`/api/workers/onboarding?workerId=${workerId}&action=checklist`),
        ])
        if (progressRes.ok) {
          const data = await progressRes.json()
          setCompletion(data.completion ?? 0)
        }
        if (checklistRes.ok) {
          const data = await checklistRes.json()
          setChecklist(data.checklist ?? [])
        }
      } catch {
        // Fallback — leave defaults
      }
    }
    loadProgress()
  }, [workerId])

  // Show loading spinner while auth is resolving
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Redirect handled via useEffect above; return null while redirecting
  if (!user || !workerId) return null

  async function saveStep(stepId: StepId, data: Record<string, unknown>) {
    try {
      const res = await fetch('/api/workers/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workerId, step: stepId, data }),
      })
      if (res.ok) {
        const json = await res.json()
        setCompletion(json.completion ?? completion)
      }
    } catch {
      // Non-blocking — continue even on network failure
    }
  }

  async function handleNext() {
    setLoading(true)
    try {
      const step = currentStep.id

      if (step === 'profile_info') {
        const parsed = onboardingProfileSchema.safeParse(form)
        if (!parsed.success) {
          const nextErrors: Partial<Record<keyof FormData, string>> = {}
          for (const issue of parsed.error.issues) {
            const field = issue.path[0] as keyof FormData | undefined
            if (field && !nextErrors[field]) {
              nextErrors[field] = issue.message
            }
          }
          setFormErrors(nextErrors)
          return
        }

        setFormErrors({})
        const profileMetadata = toLocalizedProfileMetadata(parsed.data)
        await saveStep('profile_info', {
          name: parsed.data.name.trim(),
          bio: parsed.data.bio.trim(),
          phone: profileMetadata.phone,
          location: profileMetadata.location,
          country: profileMetadata.country,
          region: profileMetadata.region,
          city: profileMetadata.city,
        })
      } else if (step === 'skills') {
        const skillsArray = form.skills.split(',').map((s) => s.trim()).filter(Boolean)
        await saveStep('skills', {
          skills: skillsArray,
          hourlyRate: form.hourlyRate ? parseFloat(form.hourlyRate) : undefined,
        })
      } else if (step === 'profile_photo') {
        if (form.profilePhoto) {
          await saveStep('profile_photo', { profilePhoto: form.profilePhoto })
        }
      } else if (step === 'review') {
        // Final step — mark complete
        await saveStep('review', {})
        setCompleted(true)
        return
      }

      setCurrentStepIndex((i) => i + 1)
    } finally {
      setLoading(false)
    }
  }

  function handleBack() {
    setCurrentStepIndex((i) => Math.max(0, i - 1))
  }

  function clearFieldError(field: keyof FormData) {
    setFormErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  function updateTextField(field: keyof FormData) {
    return (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      clearFieldError(field)
      setForm((prev) => ({ ...prev, [field]: event.target.value }))
    }
  }

  function handleCountryChange(country: Country) {
    clearFieldError('country')
    clearFieldError('region')
    clearFieldError('phone')
    setForm((prev) => ({
      ...prev,
      country,
      region: '',
      phone: prev.phone ? formatLocalizedMobile(prev.phone, country) : '',
    }))
  }

  // ─── Success screen ────────────────────────────────────────────────────────
  if (completed) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <Sparkles className="h-10 w-10 text-green-600 dark:text-green-400" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            You&apos;re all set! 🎉
          </h1>
          <p className="max-w-md text-gray-500 dark:text-gray-400">
            Your profile is now live. Clients can discover you and send you job requests.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="primary" size="lg" onClick={() => (window.location.href = '/workers')}>
            Browse Jobs
          </Button>
          <Button variant="outline" size="lg" onClick={() => (window.location.href = '/profile')}>
            View Profile
          </Button>
        </div>
      </div>
    )
  }

  // ─── Step content ──────────────────────────────────────────────────────────
  function renderStepContent() {
    switch (currentStep.id) {
      case 'welcome':
        return (
          <div className="space-y-4">
            <div className="rounded-xl border border-primary-100 bg-primary-50 p-6 dark:border-primary-900 dark:bg-primary-900/20">
              <h3 className="mb-3 font-semibold text-primary-800 dark:text-primary-300">
                What you&apos;ll need to complete:
              </h3>
              <ul className="space-y-2 text-sm text-primary-700 dark:text-primary-400">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 shrink-0" aria-hidden="true" /> Stripe payment account
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 shrink-0" aria-hidden="true" /> Government ID or other verification
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 shrink-0" aria-hidden="true" /> Profile photo
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 shrink-0" aria-hidden="true" /> Skills &amp; hourly rate
                </li>
              </ul>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              This takes about 5–10 minutes. You can pause and resume at any time.
            </p>
          </div>
        )

      case 'stripe':
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Connect your Stripe account to receive payments securely. Stripe handles all payment
              processing and protects your financial information.
            </p>
            <StripeConnectButton
              workerId={workerId!}
              email={user?.email ?? ''}
              country={form.country}
              onSuccess={() => setCurrentStepIndex((i) => i + 1)}
            />
          </div>
        )

      case 'verification':
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Upload a government-issued ID to verify your identity. This builds trust with clients
              and unlocks more job opportunities.
            </p>
            {verificationId ? (
              <VerificationUpload
                verificationId={verificationId}
                verificationType="government_id"
                onSuccess={() => setCurrentStepIndex((i) => i + 1)}
              />
            ) : (
              <Button
                variant="outline"
                size="md"
                loading={loading}
                onClick={async () => {
                  setLoading(true)
                  try {
                    const res = await fetch('/api/workers/verification', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        action: 'start',
                        workerId,
                        verificationType: 'government_id',
                      }),
                    })
                    const data = await res.json()
                    if (res.ok) setVerificationId(data.verificationId)
                  } finally {
                    setLoading(false)
                  }
                }}
              >
                Start Verification
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentStepIndex((i) => i + 1)}
            >
              Skip for now
            </Button>
          </div>
        )

      case 'profile_info':
        return (
          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={updateTextField('name')}
                placeholder="e.g., Sam Wilson"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
              {formErrors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.name}</p>}
            </div>
            <div>
              <label
                htmlFor="bio"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Bio
              </label>
              <textarea
                id="bio"
                value={form.bio}
                onChange={updateTextField('bio')}
                rows={3}
                placeholder="Tell clients about your experience and expertise…"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
              {formErrors.bio && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.bio}</p>}
            </div>
            <LocationSelector
              country={form.country}
              region={form.region}
              city={form.city}
              onCountryChange={handleCountryChange}
              onRegionChange={(region) => {
                clearFieldError('region')
                setForm((prev) => ({ ...prev, region }))
              }}
              onCityChange={(city) => {
                clearFieldError('city')
                setForm((prev) => ({ ...prev, city }))
              }}
              errors={{
                country: formErrors.country,
                region: formErrors.region,
                city: formErrors.city,
              }}
            />
            <div>
              <label
                htmlFor="phone"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Mobile number
              </label>
              <input
                id="phone"
                type="tel"
                inputMode="tel"
                value={form.phone}
                onChange={(event) => {
                  clearFieldError('phone')
                  setForm((prev) => ({ ...prev, phone: event.target.value }))
                }}
                onBlur={(event) => setForm((prev) => ({ ...prev, phone: formatLocalizedMobile(event.target.value, prev.country) }))}
                placeholder={getMobilePlaceholder(form.country)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {form.country === 'AU' ? 'Use +61 or 04 for Australian mobiles.' : 'Use +64 or 02 for New Zealand mobiles.'}
              </p>
              {formErrors.phone && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.phone}</p>}
            </div>
          </div>
        )

      case 'skills':
        return (
          <div className="space-y-4">
            <div>
              <label
                htmlFor="skills"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Skills <span className="text-gray-400">(comma-separated)</span>
              </label>
              <input
                id="skills"
                type="text"
                value={form.skills}
                onChange={updateTextField('skills')}
                placeholder="Plumbing, Electrical, HVAC"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label
                htmlFor="hourlyRate"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Hourly Rate ({form.country === 'AU' ? 'AUD' : 'NZD'})
              </label>
              <input
                id="hourlyRate"
                type="number"
                min="0"
                step="5"
                value={form.hourlyRate}
                onChange={updateTextField('hourlyRate')}
                placeholder="65"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>
        )

      case 'profile_photo':
        return (
          <ProfilePhotoUpload
            currentPhotoUrl={null}
            displayName={form.name || 'Worker'}
            onUpload={(url) => setForm((prev) => ({ ...prev, profilePhoto: url }))}
          />
        )

      case 'review':
        return (
          <div className="space-y-4">
            <OnboardingProgress completion={completion} checklist={checklist} />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your profile is ready to go live. You can always update it from your profile settings.
            </p>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Overall progress indicator */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>
            Step {currentStepIndex + 1} of {STEPS.length}
          </span>
          <span>{completion}% complete</span>
        </div>
        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700"
          role="progressbar"
          aria-valuenow={Math.round(((currentStepIndex + 1) / STEPS.length) * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Step ${currentStepIndex + 1} of ${STEPS.length}`}
        >
          <div
            className="h-full rounded-full bg-primary-600 transition-all duration-500"
            style={{ width: `${Math.round(((currentStepIndex + 1) / STEPS.length) * 100)}%` }}
          />
        </div>
      </div>

      {/* Step card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <OnboardingStep
          title={currentStep.title}
          description={currentStep.description}
          onNext={handleNext}
          onBack={handleBack}
          loading={loading}
          isFirst={currentStepIndex === 0}
          isLast={currentStepIndex === STEPS.length - 1}
          nextLabel={currentStepIndex === STEPS.length - 1 ? 'Complete Setup' : 'Continue'}
        >
          {renderStepContent()}
        </OnboardingStep>
      </div>
    </div>
  )
}

// ─── Page wrapper with Suspense for useSearchParams ───────────────────────────
export default function WorkerOnboardingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="flex min-h-[60vh] items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
            </div>
          }
        >
          <OnboardingContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
