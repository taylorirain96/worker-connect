'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useAuth } from '@/components/providers/AuthProvider'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '@/lib/firebase'
import { JOB_CATEGORIES } from '@/lib/utils'
import toast from 'react-hot-toast'
import {
  Building2, Upload, Globe, Users, Shield, ArrowLeft, CheckCircle,
} from 'lucide-react'
import Link from 'next/link'

const NZBN_REGEX = /^\d{13}$/
/** ABN: 11 digits, optionally grouped as "XX XXX XXX XXX" */
const ABN_REGEX = /^\d{11}$/
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

/** Normalise a user-typed website URL by prepending https:// if no protocol present. */
function normaliseWebsite(url: string): string {
  if (!url) return ''
  return url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`
}
const COMPANY_SIZES = [
  { value: '1', label: '1 (Solo)' },
  { value: '2-5', label: '2–5 employees' },
  { value: '6-20', label: '6–20 employees' },
  { value: '21-100', label: '21–100 employees' },
  { value: '100+', label: '100+ employees' },
]

interface FormState {
  companyName: string
  nzbn: string
  abn: string
  companyDescription: string
  companySize: string
  website: string
  companyLogoUrl: string
  companyTrades: string[]
}

export default function BusinessProfilePage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState<FormState>({
    companyName: '',
    nzbn: '',
    abn: '',
    companyDescription: '',
    companySize: '',
    website: '',
    companyLogoUrl: '',
    companyTrades: [],
  })
  const [loadingData, setLoadingData] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [loading, user, router])

  useEffect(() => {
    if (!user?.uid || !db) {
      setLoadingData(false)
      return
    }
    async function fetchProfile() {
      try {
        const snap = await getDoc(doc(db!, 'users', user!.uid))
        if (snap.exists()) {
          const data = snap.data()
          setForm({
            companyName: (data.companyName as string | undefined) ?? '',
            nzbn: (data.nzbn as string | undefined) ?? '',
            abn: (data.abn as string | undefined) ?? '',
            companyDescription: (data.companyDescription as string | undefined) ?? '',
            companySize: (data.companySize as string | undefined) ?? '',
            website: (data.website as string | undefined) ?? '',
            companyLogoUrl: (data.companyLogoUrl as string | undefined) ?? '',
            companyTrades: (data.companyTrades as string[] | undefined) ?? [],
          })
        }
      } catch (err) {
        console.error('[business-profile] fetch error:', err)
      } finally {
        setLoadingData(false)
      }
    }
    fetchProfile()
  }, [user])

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user || !storage) return

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error('Please upload a JPEG, PNG, WebP, or GIF image')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Logo must be under 5 MB')
      return
    }

    setUploadingLogo(true)
    try {
      const ext = MIME_TO_EXT[file.type] ?? 'jpg'
      const path = `business-logos/${user.uid}/logo-${Date.now()}.${ext}`
      const fileRef = storageRef(storage, path)
      await uploadBytes(fileRef, file, { contentType: file.type })
      const url = await getDownloadURL(fileRef)
      setForm((prev) => ({ ...prev, companyLogoUrl: url }))
      toast.success('Logo uploaded!')
    } catch (err) {
      console.error('[business-profile] logo upload error:', err)
      toast.error('Failed to upload logo')
    } finally {
      setUploadingLogo(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const toggleTrade = (tradeId: string) => {
    setForm((prev) => ({
      ...prev,
      companyTrades: prev.companyTrades.includes(tradeId)
        ? prev.companyTrades.filter((t) => t !== tradeId)
        : [...prev.companyTrades, tradeId],
    }))
  }

  const handleSave = async () => {
    if (!user || !db) return

    // Validate NZBN
    if (form.nzbn && !NZBN_REGEX.test(form.nzbn)) {
      toast.error('NZBN must be exactly 13 digits')
      return
    }

    // Validate ABN
    if (form.abn && !ABN_REGEX.test(form.abn)) {
      toast.error('ABN must be exactly 11 digits (omit spaces)')
      return
    }

    // Validate website URL
    if (form.website) {
      try {
        new URL(normaliseWebsite(form.website))
      } catch {
        toast.error('Please enter a valid website URL')
        return
      }
    }

    setSaving(true)
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        companyName: form.companyName,
        nzbn: form.nzbn,
        abn: form.abn,
        companyDescription: form.companyDescription,
        companySize: form.companySize,
        website: normaliseWebsite(form.website),
        companyLogoUrl: form.companyLogoUrl,
        companyTrades: form.companyTrades,
        updatedAt: new Date().toISOString(),
      })
      toast.success('Business profile saved!')
    } catch (err) {
      console.error('[business-profile] save error:', err)
      toast.error('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading || loadingData) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </main>
        <Footer />
      </div>
    )
  }

  if (!user || profile?.role !== 'employer') {
    return null
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-8">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              href="/dashboard/employer"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Building2 className="h-6 w-6 text-indigo-600" />
              Business Profile
            </h1>
            <p className="text-gray-500 mt-1">
              Your company details are shown on your job listings to attract better candidates.
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Company Identity */}
          <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-indigo-600" />
              Company Identity
            </h2>

            {/* Logo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company Logo
              </label>
              <div className="flex items-center gap-4">
                {form.companyLogoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.companyLogoUrl}
                    alt="Company logo"
                    className="h-16 w-16 rounded-xl object-cover border border-gray-200 dark:border-gray-600"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center border border-gray-200 dark:border-gray-600">
                    <Building2 className="h-7 w-7 text-gray-400" />
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingLogo}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                  >
                    <Upload className="h-4 w-4" />
                    {uploadingLogo ? 'Uploading…' : 'Upload Logo'}
                  </button>
                  <p className="text-xs text-gray-400">JPEG, PNG or WebP · Max 5 MB</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
              </div>
            </div>

            <Input
              label="Company Name"
              placeholder="e.g., Smith Plumbing Ltd"
              value={form.companyName}
              onChange={(e) => setForm((prev) => ({ ...prev, companyName: e.target.value }))}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                NZBN{' '}
                <span className="text-gray-400 font-normal">(New Zealand Business Number — 13 digits)</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={13}
                placeholder="9429000000000"
                value={form.nzbn}
                onChange={(e) => setForm((prev) => ({ ...prev, nzbn: e.target.value.replace(/\D/g, '') }))}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono"
              />
              {form.nzbn && !NZBN_REGEX.test(form.nzbn) && (
                <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                  NZBN must be exactly 13 digits
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ABN{' '}
                <span className="text-gray-400 font-normal">(Australian Business Number — 11 digits, AU employers only)</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={11}
                placeholder="51824753556"
                value={form.abn}
                onChange={(e) => setForm((prev) => ({ ...prev, abn: e.target.value.replace(/\D/g, '') }))}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono"
              />
              {form.abn && !ABN_REGEX.test(form.abn) && (
                <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                  ABN must be exactly 11 digits (no spaces)
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Company Description
              </label>
              <textarea
                rows={4}
                placeholder="Tell candidates about your company, what you do, and why they should work with you…"
                value={form.companyDescription}
                onChange={(e) => setForm((prev) => ({ ...prev, companyDescription: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              />
            </div>
          </section>

          {/* Company Details */}
          <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3 flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" />
              Company Details
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Company Size
              </label>
              <select
                value={form.companySize}
                onChange={(e) => setForm((prev) => ({ ...prev, companySize: e.target.value }))}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select company size</option>
                {COMPANY_SIZES.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <Input
                label="Website"
                placeholder="https://yourcompany.co.nz"
                value={form.website}
                onChange={(e) => setForm((prev) => ({ ...prev, website: e.target.value }))}
                className="flex-1"
              />
            </div>
          </section>

          {/* Trade Focus */}
          <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3 flex items-center gap-2">
              <Shield className="h-5 w-5 text-indigo-600" />
              Trade Focus
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Select the trade categories your business hires for.
            </p>
            <div className="flex flex-wrap gap-2">
              {JOB_CATEGORIES.map((cat) => {
                const selected = form.companyTrades.includes(cat.id)
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleTrade(cat.id)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium border transition-colors ${
                      selected
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-indigo-400'
                    }`}
                  >
                    {selected && <CheckCircle className="h-3.5 w-3.5" />}
                    {cat.label}
                  </button>
                )
              })}
            </div>
          </section>

          {/* Save */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard/employer')}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              loading={saving}
              className="flex-1"
              size="lg"
            >
              Save Business Profile
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
