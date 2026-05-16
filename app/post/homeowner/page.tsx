'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import toast from 'react-hot-toast'

const CATEGORIES = [
  { id: 'plumbing', label: 'Plumbing', emoji: '🔧' },
  { id: 'electrical', label: 'Electrical', emoji: '⚡' },
  { id: 'carpentry', label: 'Building', emoji: '🔨' },
  { id: 'painting', label: 'Painting', emoji: '🖌️' },
  { id: 'cleaning', label: 'Cleaning', emoji: '🧹' },
  { id: 'landscaping', label: 'Garden', emoji: '🌿' },
  { id: 'general', label: 'Other', emoji: '🛠️' },
]

const TIMING_OPTIONS = [
  { id: 'asap', label: 'ASAP', desc: 'As soon as possible' },
  { id: 'this_week', label: 'This week', desc: 'Within the next 7 days' },
  { id: 'flexible', label: "I'm flexible", desc: 'No rush, when available' },
]

export default function HomeownerJobFormPage() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const propertyId = searchParams.get('propertyId')?.trim() || undefined
  const propertyAddress = searchParams.get('address')?.trim() || ''

  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [location, setLocation] = useState(propertyAddress)
  const [timing, setTiming] = useState('')
  const [budget, setBudget] = useState('')
  const [notSureBudget, setNotSureBudget] = useState(false)
  const [guestName, setGuestName] = useState('')
  const [guestContact, setGuestContact] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const isLoggedIn = !!user

  const isValid =
    description.trim().length >= 10 &&
    category &&
    location.trim().length >= 2 &&
    timing &&
    (isLoggedIn || (guestName.trim().length >= 2 && guestContact.trim().length >= 3))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return
    setSubmitting(true)

    try {
      let uid = user?.uid
      let displayName = user?.displayName || user?.email || 'Homeowner'
      let email = user?.email || null

      // If not logged in, create a silent homeowner account
      if (!isLoggedIn) {
        displayName = guestName.trim()
        const isEmail = guestContact.includes('@')
        email = isEmail ? guestContact.trim() : null
        const phone = !isEmail ? guestContact.trim() : undefined

        // Create account silently
        const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth')
        const { auth } = await import('@/lib/firebase')
        if (!auth) throw new Error('Auth not available')

        // Generate a cryptographically secure random password for the silent account
        const randomBytes = new Uint8Array(24)
        crypto.getRandomValues(randomBytes)
        const tempPassword = Array.from(randomBytes, (b) => b.toString(16).padStart(2, '0')).join('')
        const randomId = crypto.randomUUID().replace(/-/g, '')
        const randomEmail = email || `ho-${randomId}@quicktrade-guest.nz`

        const cred = await createUserWithEmailAndPassword(auth, randomEmail, tempPassword)
        await updateProfile(cred.user, { displayName })

        // Create minimal profile in Firestore
        const { doc, setDoc, serverTimestamp } = await import('firebase/firestore')
        const { db } = await import('@/lib/firebase')
        if (db) {
          await setDoc(doc(db, 'users', cred.user.uid), {
            uid: cred.user.uid,
            email: randomEmail,
            displayName,
            photoURL: null,
            role: 'homeowner',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            profileComplete: true,
            verified: false,
            ...(phone ? { phone } : {}),
          })
        }
        uid = cred.user.uid
        email = randomEmail
      }

      if (!uid) throw new Error('No user ID')

      // Post the job
      const { saveJob } = await import('@/lib/services/jobService')
      const jobId = await saveJob({
        title: description.trim().slice(0, 80) || 'Home job',
        description: description.trim(),
        category: category as import('@/types').JobCategory,
        location: location.trim(),
        budget: notSureBudget || !budget ? 0 : Number(budget),
        budgetType: 'fixed',
        urgency: timing === 'asap' ? 'high' : timing === 'this_week' ? 'medium' : 'low',
        skills: [],
        employerId: uid,
        employerName: displayName,
        status: 'open',
        propertyId,
      })

      if (propertyId) {
        const { db } = await import('@/lib/firebase')
        const { doc, updateDoc, increment, serverTimestamp } = await import('firebase/firestore')
        if (db) {
          await updateDoc(doc(db, 'properties', propertyId), {
            activeJobCount: increment(1),
            totalJobsPosted: increment(1),
            updatedAt: serverTimestamp(),
            lastJobId: jobId,
          })
        }
      }

      toast.success("Your job is posted! You'll get notified when tradies send you quotes.")
      router.push(propertyId ? `/dashboard/homeowner?propertyId=${encodeURIComponent(propertyId)}` : '/dashboard/homeowner')
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <main className="flex-1 py-10 px-4">
        <div className="max-w-xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              What do you need done?
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Tell us about your job and get quotes from local tradies — free!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Description */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
              <label className="block text-base font-semibold text-gray-900 dark:text-white mb-3">
                1. Describe the job
              </label>
              <textarea
                rows={4}
                placeholder="e.g. I need a leaking tap fixed in the bathroom. It's been dripping for a week."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                required
              />
            </div>

            {/* Step 2: Category */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
              <label className="block text-base font-semibold text-gray-900 dark:text-white mb-3">
                2. What type of job is it?
              </label>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 text-center transition-all ${
                      category === cat.id
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <span className="text-2xl">{cat.emoji}</span>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 leading-tight">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Location */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
              <label className="block text-base font-semibold text-gray-900 dark:text-white mb-3">
                3. Where are you?
              </label>
              <input
                type="text"
                placeholder="e.g. Blenheim, Marlborough"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            {/* Step 4: Timing */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
              <label className="block text-base font-semibold text-gray-900 dark:text-white mb-3">
                4. When do you need it?
              </label>
              <div className="grid grid-cols-3 gap-3">
                {TIMING_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setTiming(opt.id)}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      timing === opt.id
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="font-semibold text-sm text-gray-900 dark:text-white">{opt.label}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 5: Budget (optional) */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
              <label className="block text-base font-semibold text-gray-900 dark:text-white mb-1">
                5. Rough budget? <span className="text-gray-400 font-normal text-sm">(optional)</span>
              </label>
              <p className="text-sm text-gray-500 mb-3">Tradies can still quote even if you skip this</p>
              <label className="flex items-center gap-2 mb-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notSureBudget}
                  onChange={(e) => {
                    setNotSureBudget(e.target.checked)
                    if (e.target.checked) setBudget('')
                  }}
                  className="w-4 h-4 rounded accent-indigo-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Not sure yet</span>
              </label>
              {!notSureBudget && (
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}
            </div>

            {/* Step 6: Contact info (only if not logged in) */}
            {!isLoggedIn && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                <label className="block text-base font-semibold text-gray-900 dark:text-white mb-3">
                  6. How can tradies reach you?
                </label>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Your name"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Phone number or email"
                    value={guestContact}
                    onChange={(e) => setGuestContact(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">We&apos;ll create a free account so you can track your quotes</p>
              </div>
            )}

            <button
              type="submit"
              disabled={!isValid || submitting}
              className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl text-lg transition-colors"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Posting your job...
                </span>
              ) : (
                'Post My Job — Free 🚀'
              )}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  )
}
