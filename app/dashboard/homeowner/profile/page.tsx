'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { ArrowLeft, Camera, User, Phone, MapPin, Save, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '@/lib/firebase'

const BIO_MAX = 300

interface FormState {
  displayName: string
  phone: string
  location: string
  bio: string
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Avatar skeleton */}
      <Card>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 py-2">
            <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
            <div className="space-y-2 w-full">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-48" />
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Fields skeleton */}
      <Card>
        <CardContent>
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Input helpers ────────────────────────────────────────────────────────────

const inputClass =
  'w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 ' +
  'px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 ' +
  'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition'

const labelClass = 'block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5'

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomeownerProfilePage() {
  const router = useRouter()
  const { user, profile, loading } = useAuth()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)

  const [form, setForm] = useState<FormState>({
    displayName: '',
    phone: '',
    location: '',
    bio: '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Guard: redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login')
    }
  }, [loading, user, router])

  // Pre-populate form from profile
  useEffect(() => {
    if (profile) {
      setForm({
        displayName: profile.displayName ?? '',
        phone: profile.phone ?? '',
        location: profile.location ?? '',
        bio: profile.bio ?? '',
      })
    }
  }, [profile])

  // ─── Avatar upload ──────────────────────────────────────────────────────────

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return

    // Optimistic local preview
    const objectUrl = URL.createObjectURL(file)
    setAvatarPreview(objectUrl)

    setAvatarUploading(true)
    try {
      if (!storage) throw new Error('Storage not initialised')
      const storageRef = ref(storage, `avatars/${user.uid}`)
      await uploadBytes(storageRef, file)
      const downloadUrl = await getDownloadURL(storageRef)
      setAvatarPreview(downloadUrl)

      // Persist avatar URL via profile API
      await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'x-user-id': user.uid, 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoURL: downloadUrl }),
      })
      toast.success('Photo updated ✓')
    } catch {
      setAvatarPreview(null)
      toast.error('Photo upload failed. Please try again.')
    } finally {
      setAvatarUploading(false)
      // Reset input so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // ─── Form save ──────────────────────────────────────────────────────────────

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    if (!form.displayName.trim()) {
      toast.error('Full name is required.')
      return
    }

    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'x-user-id': user.uid, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: form.displayName.trim(),
          phone: form.phone.trim(),
          location: form.location.trim(),
          bio: form.bio.trim(),
        }),
      })
      if (!res.ok) throw new Error('Save failed')
      toast.success('Profile updated ✓')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      toast.error('Could not save profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // ─── Derived values ─────────────────────────────────────────────────────────

  const displayedAvatar = avatarPreview ?? profile?.photoURL ?? null
  const initials = (profile?.displayName ?? profile?.email ?? '?')
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">
        {/* Back link */}
        <Link
          href="/dashboard/homeowner"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to dashboard
        </Link>

        {/* Page heading */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Edit Profile
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Keep your profile up to date so tradies know who they&apos;re working with.
          </p>
        </div>

        {loading ? (
          <ProfileSkeleton />
        ) : (
          <form onSubmit={handleSave} className="space-y-6" noValidate>
            {/* ── Avatar card ── */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
                  Profile Photo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  {/* Avatar with camera overlay */}
                  <div className="relative shrink-0 group">
                    <div className="w-24 h-24 rounded-full overflow-hidden ring-2 ring-indigo-500/30 ring-offset-2 ring-offset-white dark:ring-offset-gray-900">
                      {displayedAvatar ? (
                        <Image
                          src={displayedAvatar}
                          alt="Profile avatar"
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-2xl font-bold select-none">
                          {initials || <User className="w-8 h-8 opacity-80" />}
                        </div>
                      )}
                    </div>

                    {/* Camera button */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={avatarUploading}
                      aria-label="Change profile photo"
                      className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {avatarUploading ? (
                        <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Camera className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </div>

                  {/* Helper text */}
                  <div className="text-center sm:text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {profile?.displayName ?? 'Your Name'}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                      {profile?.email}
                    </p>
                    <p className="mt-2 text-xs text-gray-400 dark:text-gray-500 max-w-xs">
                      JPG, PNG or WebP. Click the camera icon to upload a new photo.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ── Details card ── */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
                  Personal Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  {/* Full Name */}
                  <div>
                    <label htmlFor="displayName" className={labelClass}>
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        Full Name
                        <span className="text-red-500 ml-0.5">*</span>
                      </span>
                    </label>
                    <input
                      id="displayName"
                      type="text"
                      required
                      autoComplete="name"
                      placeholder="e.g. Sarah Thompson"
                      value={form.displayName}
                      onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
                      className={inputClass}
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className={labelClass}>
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" />
                        Phone Number
                      </span>
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="e.g. 021 123 4567"
                      value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                      className={inputClass}
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label htmlFor="location" className={labelClass}>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        Location
                      </span>
                    </label>
                    <input
                      id="location"
                      type="text"
                      autoComplete="address-level2"
                      placeholder="e.g. Auckland, NZ"
                      value={form.location}
                      onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                      className={inputClass}
                    />
                  </div>

                  {/* Bio */}
                  <div>
                    <label htmlFor="bio" className={labelClass}>
                      About / Bio
                    </label>
                    <textarea
                      id="bio"
                      rows={4}
                      maxLength={BIO_MAX}
                      placeholder="Tell tradies a bit about you and your home..."
                      value={form.bio}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, bio: e.target.value.slice(0, BIO_MAX) }))
                      }
                      className={`${inputClass} resize-none`}
                    />
                    <p
                      className={`mt-1 text-right text-xs tabular-nums ${
                        form.bio.length >= BIO_MAX
                          ? 'text-red-500 dark:text-red-400'
                          : 'text-gray-400 dark:text-gray-500'
                      }`}
                    >
                      {form.bio.length} / {BIO_MAX}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ── Save button ── */}
            <div className="flex items-center justify-end gap-3 pb-4">
              <Link
                href="/dashboard/homeowner"
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                Cancel
              </Link>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={saving}
                disabled={saving || avatarUploading}
                className="bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 min-w-[140px]"
              >
                {saved ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Saved
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </main>

      <Footer />
    </div>
  )
}
