'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'

const CATEGORIES = [
  { id: 'plumbing', label: 'Plumbing', emoji: '🔧' },
  { id: 'electrical', label: 'Electrical', emoji: '⚡' },
  { id: 'building', label: 'Building', emoji: '🏗️' },
  { id: 'painting', label: 'Painting', emoji: '🎨' },
  { id: 'cleaning', label: 'Cleaning', emoji: '🧹' },
  { id: 'garden', label: 'Garden', emoji: '🌿' },
  { id: 'other', label: 'Other', emoji: '🛠️' },
]

const URGENCY_OPTIONS = [
  { id: 'asap', label: 'ASAP' },
  { id: 'this_week', label: 'This week' },
  { id: 'flexible', label: 'Flexible' },
]

const MAX_TITLE_LENGTH = 80

export default function HomeownerPostPage() {
  const router = useRouter()
  const { user } = useAuth()

  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [location, setLocation] = useState('')
  const [urgency, setUrgency] = useState('')
  const [budget, setBudget] = useState('')
  const [budgetUnsure, setBudgetUnsure] = useState(false)
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) {
      toast.error('Please describe what needs doing')
      return
    }
    if (!category) {
      toast.error('Please choose a category')
      return
    }
    if (!location.trim()) {
      toast.error('Please enter your location')
      return
    }
    if (!urgency) {
      toast.error('Please select when you need it done')
      return
    }
    if (!user && (!name.trim() || !contact.trim())) {
      toast.error('Please enter your name and contact details')
      return
    }

    setSubmitting(true)
    try {
      const { collection, addDoc, serverTimestamp, doc, setDoc } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase')
      if (!db) {
        toast.error('Service unavailable. Please try again.')
        setSubmitting(false)
        return
      }

      let uid = user?.uid ?? null
      let posterName = user?.displayName ?? name.trim()

      // If not logged in, create a Firebase auth account and Firestore user doc.
      // A cryptographically random temporary password is generated; users can
      // reset it via the standard "Forgot Password" flow if they want full access later.
      if (!user) {
        const email = contact.includes('@') ? contact.trim() : null
        const phone = !contact.includes('@') ? contact.trim() : null
        // Use a UUID-based synthetic email to avoid collisions with phone-based contacts
        const randomId = crypto.randomUUID().replace(/-/g, '').slice(0, 12)
        const loginEmail = email ?? `guest-${randomId}@workerconnect.nz`
        // Generate a cryptographically secure temporary password with required character types
        // distributed randomly throughout (not appended as a fixed suffix).
        const pwBytes = new Uint8Array(20)
        crypto.getRandomValues(pwBytes)
        const lowerChars = 'abcdefghijklmnopqrstuvwxyz'
        const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        const digitChars = '0123456789'
        const specialChars = '!@#$%^&*'
        const allChars = lowerChars + upperChars + digitChars + specialChars
        // Build base password from random bytes
        const pwArr = Array.from(pwBytes.slice(0, 16), (b) => allChars[b % allChars.length])
        // Ensure at least one of each required type, replacing positions at random indices
        const reqBytes = new Uint8Array(4)
        crypto.getRandomValues(reqBytes)
        pwArr[reqBytes[0] % 16] = upperChars[reqBytes[0] % upperChars.length]
        pwArr[reqBytes[1] % 16] = lowerChars[reqBytes[1] % lowerChars.length]
        pwArr[reqBytes[2] % 16] = digitChars[reqBytes[2] % digitChars.length]
        pwArr[reqBytes[3] % 16] = specialChars[reqBytes[3] % specialChars.length]
        const tempPassword = pwArr.join('')

        const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth')
        const { auth } = await import('@/lib/firebase')
        if (!auth) {
          toast.error('Authentication service not available.')
          setSubmitting(false)
          return
        }
        const cred = await createUserWithEmailAndPassword(auth, loginEmail, tempPassword)
        await updateProfile(cred.user, { displayName: name.trim() })
        uid = cred.user.uid
        posterName = name.trim()

        const now = serverTimestamp()
        await setDoc(doc(db, 'users', uid), {
          uid,
          email: loginEmail,
          displayName: posterName,
          photoURL: null,
          role: 'homeowner',
          phone: phone ?? '',
          createdAt: now,
          updatedAt: now,
          profileComplete: true,
          verified: false,
        })
      }

      // Save the job to Firestore
      await addDoc(collection(db, 'jobs'), {
        title: description.trim().slice(0, MAX_TITLE_LENGTH),
        description: description.trim(),
        category,
        location: location.trim(),
        urgency,
        budget: budgetUnsure ? null : (budget ? Number(budget) : null),
        budgetUnsure,
        budgetType: 'fixed',
        status: 'open',
        jobType: 'homeowner',
        employerId: uid,
        employerName: posterName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        applicantsCount: 0,
      })

      toast.success('Job posted! Workers will be in touch soon.')
      router.push('/dashboard/homeowner')
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string }
      if (e.code === 'auth/email-already-in-use') {
        toast.error('An account with that email already exists. Please sign in.')
      } else {
        toast.error('Something went wrong. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex flex-col">
      <Navbar />
      <main className="flex-1 px-4 py-10">
        {/* Radial glow */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,102,241,0.12) 0%, transparent 70%)' }}
        />
        <div className="relative max-w-xl mx-auto">
          <Link href="/post" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-white mb-6 transition-colors">
            ← Back
          </Link>
          <h1 className="text-2xl font-bold text-white mb-1">Tell us what you need done</h1>
          <p className="text-gray-400 text-sm mb-8">It&apos;s free to post — workers come to you.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                What needs doing? <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. I need a plumber to fix a leaking tap in the kitchen..."
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white placeholder:text-gray-500 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors resize-none"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                      category === cat.id
                        ? 'border-indigo-500 bg-indigo-500/10'
                        : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                    }`}
                  >
                    <span className="text-2xl">{cat.emoji}</span>
                    <span className="text-xs text-gray-300 font-medium">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Where are you? <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Auckland Central, Wellington..."
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white placeholder:text-gray-500 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>

            {/* Urgency */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                When do you need it? <span className="text-red-400">*</span>
              </label>
              <div className="flex gap-3">
                {URGENCY_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setUrgency(opt.id)}
                    className={`flex-1 py-2.5 px-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      urgency === opt.id
                        ? 'border-indigo-500 bg-indigo-500/10 text-white'
                        : 'border-gray-700 hover:border-gray-600 text-gray-300 bg-gray-800/50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Budget (optional)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  disabled={budgetUnsure}
                  placeholder="e.g. 300"
                  min="0"
                  className="w-full pl-8 pr-4 py-3 bg-gray-800 border border-gray-700 text-white placeholder:text-gray-500 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                />
              </div>
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={budgetUnsure}
                  onChange={(e) => {
                    setBudgetUnsure(e.target.checked)
                    if (e.target.checked) setBudget('')
                  }}
                  className="rounded border-gray-600 bg-gray-800 text-indigo-500 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-400">Not sure yet</span>
              </label>
            </div>

            {/* Contact details — only shown when not logged in */}
            {!user && (
              <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-4 space-y-4">
                <p className="text-sm font-medium text-gray-300">Your details so workers can reach you</p>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Your name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="First name"
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 text-white placeholder:text-gray-500 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Phone or email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="021 123 4567 or name@email.com"
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 text-white placeholder:text-gray-500 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-base"
            >
              {submitting ? 'Posting…' : 'Post My Job →'}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  )
}
