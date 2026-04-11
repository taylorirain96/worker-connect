'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/components/providers/AuthProvider'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import toast from 'react-hot-toast'
import { Camera, User, MapPin, DollarSign, Globe, Phone, Building2, X, Sparkles } from 'lucide-react'
import Image from 'next/image'
import { JOB_CATEGORIES } from '@/lib/utils'
import { updateUserProfile } from '@/lib/users/updateProfile'
import { getInitials } from '@/lib/utils'
import { hasWorkerAI } from '@/lib/subscriptions'
import CVSection from '@/components/cv/CVSection'
import AIUpgradePrompt from '@/components/ui/AIUpgradePrompt'

const MAX_AVATAR_SIZE = 5 * 1024 * 1024 // 5 MB

const workerSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
  bio: z.string().max(500, 'Bio must be under 500 characters').optional().or(z.literal('')),
  location: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  hourlyRate: z.coerce.number().min(0, 'Must be a positive number').optional(),
  availability: z.enum(['available', 'busy', 'unavailable']),
})

const employerSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
  companyName: z.string().optional().or(z.literal('')),
  bio: z.string().max(500, 'Bio must be under 500 characters').optional().or(z.literal('')),
  location: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
})

type WorkerFormData = z.infer<typeof workerSchema>
type EmployerFormData = z.infer<typeof employerSchema>

function SkillTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="hover:text-primary-900 dark:hover:text-primary-100 transition-colors"
        aria-label={`Remove ${label}`}
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  )
}

export default function EditProfilePage() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()

  const [saving, setSaving] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [showBioAI, setShowBioAI] = useState(false)
  const [bioAILoading, setBioAILoading] = useState(false)
  const [bioAIInputs, setBioAIInputs] = useState({ trade: '', years: '', strengths: '', extra: '' })

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  // Initialise skill tags from profile
  useEffect(() => {
    if (profile?.skills) {
      setSelectedSkills(profile.skills)
    }
  }, [profile])

  // ── Worker form ──────────────────────────────────────────────────────────────
  const workerForm = useForm<WorkerFormData>({
    resolver: zodResolver(workerSchema),
    defaultValues: {
      displayName: profile?.displayName || user?.displayName || '',
      bio: profile?.bio || '',
      location: profile?.location || '',
      phone: profile?.phone || '',
      website: profile?.website || '',
      hourlyRate: profile?.hourlyRate,
      availability: profile?.availability ?? 'available',
    },
  })

  // ── Employer form ────────────────────────────────────────────────────────────
  const employerForm = useForm<EmployerFormData>({
    resolver: zodResolver(employerSchema),
    defaultValues: {
      displayName: profile?.displayName || user?.displayName || '',
      companyName: profile?.companyName || '',
      bio: profile?.bio || '',
      location: profile?.location || '',
      phone: profile?.phone || '',
      website: profile?.website || '',
    },
  })

  // Reset form defaults once profile loads (handles async profile fetch)
  useEffect(() => {
    if (!profile) return
    workerForm.reset({
      displayName: profile.displayName || user?.displayName || '',
      bio: profile.bio || '',
      location: profile.location || '',
      phone: profile.phone || '',
      website: profile.website || '',
      hourlyRate: profile.hourlyRate,
      availability: profile.availability ?? 'available',
    })
    employerForm.reset({
      displayName: profile.displayName || user?.displayName || '',
      companyName: profile.companyName || '',
      bio: profile.bio || '',
      location: profile.location || '',
      phone: profile.phone || '',
      website: profile.website || '',
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile])

  // ── Avatar upload ────────────────────────────────────────────────────────────
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    if (file.size > MAX_AVATAR_SIZE) {
      toast.error('Image must be smaller than 5 MB')
      return
    }

    // Show local preview immediately
    const objectUrl = URL.createObjectURL(file)
    setAvatarPreview(objectUrl)

    if (!user) return
    setAvatarUploading(true)
    try {
      const { storage } = await import('@/lib/firebase')
      if (!storage) {
        toast.error('Storage is not configured')
        return
      }
      const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage')
      const { updateProfile: firebaseUpdateProfile } = await import('firebase/auth')

      const ext = file.name.split('.').pop() ?? 'jpg'
      const storageRef = ref(storage, `avatars/${user.uid}/${Date.now()}.${ext}`)
      await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(storageRef)

      // Update Firebase Auth profile
      await firebaseUpdateProfile(user, { photoURL: downloadURL })

      // Update Firestore
      await updateUserProfile(user.uid, { photoURL: downloadURL })

      setAvatarPreview(downloadURL)
      toast.success('Avatar updated!')
    } catch {
      toast.error('Failed to upload avatar')
      setAvatarPreview(null)
    } finally {
      setAvatarUploading(false)
      // Reset input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // ── Worker submit ─────────────────────────────────────────────────────────────
  const onWorkerSubmit = async (data: WorkerFormData) => {
    if (!user) return
    setSaving(true)
    try {
      const { updateProfile: firebaseUpdateProfile } = await import('firebase/auth')

      if (data.displayName !== (profile?.displayName || user.displayName)) {
        await firebaseUpdateProfile(user, { displayName: data.displayName })
      }

      await updateUserProfile(user.uid, {
        displayName: data.displayName,
        bio: data.bio || '',
        location: data.location || '',
        phone: data.phone || '',
        website: data.website || '',
        skills: selectedSkills,
        hourlyRate: data.hourlyRate,
        availability: data.availability,
        profileComplete: true,
      })

      toast.success('Profile saved!')
    } catch {
      toast.error('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  // ── Employer submit ───────────────────────────────────────────────────────────
  const onEmployerSubmit = async (data: EmployerFormData) => {
    if (!user) return
    setSaving(true)
    try {
      const { updateProfile: firebaseUpdateProfile } = await import('firebase/auth')

      if (data.displayName !== (profile?.displayName || user.displayName)) {
        await firebaseUpdateProfile(user, { displayName: data.displayName })
      }

      await updateUserProfile(user.uid, {
        displayName: data.displayName,
        companyName: data.companyName || '',
        bio: data.bio || '',
        location: data.location || '',
        phone: data.phone || '',
        website: data.website || '',
        profileComplete: true,
      })

      toast.success('Profile saved!')
    } catch {
      toast.error('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  // ── Skill tag helpers ─────────────────────────────────────────────────────────
  const toggleSkill = (skillId: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skillId) ? prev.filter((s) => s !== skillId) : [...prev, skillId]
    )
  }

  const handleAIBio = async () => {
    if (!user || !bioAIInputs.trade.trim()) return
    setBioAILoading(true)
    try {
      const res = await fetch('/api/ai/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'worker_bio',
          userId: user.uid,
          userRole: 'worker',
          inputs: bioAIInputs,
        }),
      })
      const data = await res.json() as { text?: string }
      if (data.text) {
        workerForm.setValue('bio', data.text)
        setShowBioAI(false)
        toast.success('Bio generated! Feel free to edit it.')
      } else {
        toast.error('Failed to generate bio')
      }
    } catch {
      toast.error('AI generation failed')
    } finally {
      setBioAILoading(false)
    }
  }

  // ── Loading skeleton ──────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!user) return null

  const avatarSrc = avatarPreview || user.photoURL || null
  const initials = getInitials(user.displayName || user.email || 'U')
  const isWorker = profile?.role === 'worker'

  // ── Shared avatar section ─────────────────────────────────────────────────────
  const AvatarSection = (
    <Card>
      <CardHeader>
        <CardTitle>Profile Photo</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-5">
          <div className="relative flex-shrink-0">
            {avatarSrc ? (
              <Image
                src={avatarSrc}
                alt="Profile photo"
                width={80}
                height={80}
                unoptimized={avatarSrc.startsWith('blob:')}
                className="h-20 w-20 rounded-full object-cover border-2 border-primary-200 dark:border-primary-700"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-primary-600 flex items-center justify-center text-white text-2xl font-bold border-2 border-primary-200 dark:border-primary-700">
                {initials}
              </div>
            )}
            {avatarUploading && (
              <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              JPG, PNG or WebP · Max 5 MB
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              loading={avatarUploading}
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2"
            >
              <Camera className="h-4 w-4" />
              Change Photo
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  // ── Worker form ───────────────────────────────────────────────────────────────
  if (isWorker) {
    const { register, handleSubmit, formState: { errors } } = workerForm
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <User className="h-6 w-6 text-primary-600" />
                Edit Profile
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Keep your profile up to date to attract more opportunities
              </p>
            </div>

            <form onSubmit={handleSubmit(onWorkerSubmit)} className="space-y-6">
              {AvatarSection}

              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    label="Full Name"
                    placeholder="e.g., Sam Wilson"
                    leftIcon={<User className="h-4 w-4" />}
                    error={errors.displayName?.message}
                    required
                    {...register('displayName')}
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Bio
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Tell employers about yourself, your experience, and what you can offer…"
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      {...register('bio')}
                    />
                    {errors.bio && <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>}
                    {hasWorkerAI(profile) && (
                      <div className="mt-2">
                        {!showBioAI ? (
                          <button
                            type="button"
                            onClick={() => setShowBioAI(true)}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 border border-indigo-200 dark:border-indigo-800 rounded-lg px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 transition-colors"
                          >
                            <Sparkles className="h-3.5 w-3.5" />
                            Improve my bio with AI
                          </button>
                        ) : (
                          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 rounded-xl p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                                <Sparkles className="h-4 w-4" /> AI Bio Writer
                              </p>
                              <button type="button" onClick={() => setShowBioAI(false)} aria-label="Close AI Bio Writer" className="text-gray-400 hover:text-gray-600">✕</button>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">What&apos;s your trade / skill?</label>
                              <input
                                type="text"
                                value={bioAIInputs.trade}
                                onChange={(e) => setBioAIInputs(p => ({ ...p, trade: e.target.value }))}
                                placeholder="e.g. Licensed Plumber, Electrician"
                                className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Years of experience</label>
                              <input
                                type="text"
                                value={bioAIInputs.years}
                                onChange={(e) => setBioAIInputs(p => ({ ...p, years: e.target.value }))}
                                placeholder="e.g. 8"
                                className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">What are you known for / best at?</label>
                              <input
                                type="text"
                                value={bioAIInputs.strengths}
                                onChange={(e) => setBioAIInputs(p => ({ ...p, strengths: e.target.value }))}
                                placeholder="e.g. Fast leak repairs, tidy work, always on time"
                                className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Anything else? <span className="text-gray-400">(optional)</span></label>
                              <input
                                type="text"
                                value={bioAIInputs.extra}
                                onChange={(e) => setBioAIInputs(p => ({ ...p, extra: e.target.value }))}
                                placeholder="e.g. Based in Auckland, available weekends"
                                className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              />
                            </div>
                            <button
                              type="button"
                              disabled={!bioAIInputs.trade.trim() || bioAILoading}
                              onClick={handleAIBio}
                              className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                            >
                              {bioAILoading ? <><div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating...</> : <><Sparkles className="h-4 w-4" /> Generate Bio</>}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    {!hasWorkerAI(profile) && (
                      <AIUpgradePrompt role="worker" />
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Location"
                      placeholder="e.g., Blenheim, Marlborough"
                      leftIcon={<MapPin className="h-4 w-4" />}
                      {...register('location')}
                    />
                    <Input
                      label="Phone"
                      placeholder="e.g., +64 21 000 0000"
                      type="tel"
                      leftIcon={<Phone className="h-4 w-4" />}
                      {...register('phone')}
                    />
                  </div>

                  <Input
                    label="Website"
                    placeholder="https://yourwebsite.com"
                    type="url"
                    leftIcon={<Globe className="h-4 w-4" />}
                    error={errors.website?.message}
                    {...register('website')}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Worker Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Hourly Rate ($)"
                      type="number"
                      min="0"
                      placeholder="e.g., 65"
                      leftIcon={<DollarSign className="h-4 w-4" />}
                      helperText="Your rate per hour"
                      error={errors.hourlyRate?.message}
                      {...register('hourlyRate')}
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Availability
                      </label>
                      <select
                        className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        {...register('availability')}
                      >
                        <option value="available">✅ Available — Open to new jobs</option>
                        <option value="busy">🟡 Busy — Limited availability</option>
                        <option value="unavailable">🔴 Unavailable — Not taking jobs</option>
                      </select>
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Skills
                    </label>
                    {selectedSkills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {selectedSkills.map((skill) => {
                          const cat = JOB_CATEGORIES.find((c) => c.id === skill)
                          return (
                            <SkillTag
                              key={skill}
                              label={cat ? `${cat.icon} ${cat.label}` : skill}
                              onRemove={() => toggleSkill(skill)}
                            />
                          )
                        })}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {JOB_CATEGORIES.map((cat) => {
                        const selected = selectedSkills.includes(cat.id)
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => toggleSkill(cat.id)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                              selected
                                ? 'bg-primary-600 border-primary-600 text-white'
                                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-primary-400 dark:hover:border-primary-500'
                            }`}
                          >
                            <span>{cat.icon}</span>
                            {cat.label}
                          </button>
                        )
                      })}
                    </div>
                    <p className="mt-1.5 text-xs text-gray-500">Click to select / deselect skills</p>
                  </div>
                </CardContent>
              </Card>

              {user && (
                <CVSection userId={user.uid} profile={profile} hasAI={hasWorkerAI(profile)} />
              )}

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" loading={saving} className="flex-1" size="lg">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // ── Employer form ─────────────────────────────────────────────────────────────
  const { register, handleSubmit, formState: { errors } } = employerForm
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <User className="h-6 w-6 text-primary-600" />
              Edit Profile
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Keep your company profile up to date to attract the best workers
            </p>
          </div>

          <form onSubmit={handleSubmit(onEmployerSubmit)} className="space-y-6">
            {AvatarSection}

            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Contact Name"
                  placeholder="e.g., Jane Smith"
                  leftIcon={<User className="h-4 w-4" />}
                  error={errors.displayName?.message}
                  required
                  {...register('displayName')}
                />

                <Input
                  label="Company Name"
                  placeholder="e.g., Smith Building Ltd"
                  leftIcon={<Building2 className="h-4 w-4" />}
                  error={errors.companyName?.message}
                  {...register('companyName')}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    About / Bio
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Describe your company, what you do, and the kind of workers you're looking for…"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    {...register('bio')}
                  />
                  {errors.bio && <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Location"
                    placeholder="e.g., Blenheim, Marlborough"
                    leftIcon={<MapPin className="h-4 w-4" />}
                    {...register('location')}
                  />
                  <Input
                    label="Phone"
                    placeholder="e.g., +64 21 000 0000"
                    type="tel"
                    leftIcon={<Phone className="h-4 w-4" />}
                    {...register('phone')}
                  />
                </div>

                <Input
                  label="Website"
                  placeholder="https://yourcompany.com"
                  type="url"
                  leftIcon={<Globe className="h-4 w-4" />}
                  error={errors.website?.message}
                  {...register('website')}
                />
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" loading={saving} className="flex-1" size="lg">
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  )
}
