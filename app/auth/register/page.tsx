'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { Suspense } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { getDashboardPath } from '@/lib/auth/redirects'

const registerSchema = z
  .object({
    displayName: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    role: z.enum(['worker', 'employer']),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type RegisterFormData = z.infer<typeof registerSchema>

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultRole = (searchParams.get('role') as 'worker' | 'employer') || 'worker'
  const { user, profile, loading } = useAuth()

  // Redirect away if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.replace(getDashboardPath(profile))
    }
  }, [user, profile, loading, router])

  const [showPassword, setShowPassword] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: defaultRole },
  })

  const selectedRole = watch('role')

  const createUserProfile = async (uid: string, email: string | null, displayName: string, role: 'worker' | 'employer') => {
    const { doc, setDoc, serverTimestamp } = await import('firebase/firestore')
    const { db } = await import('@/lib/firebase')
    if (!db) {
      console.warn('Firestore not initialized')
      return
    }
    const now = serverTimestamp()
    const baseFields = {
      uid,
      email,
      displayName,
      photoURL: null,
      role,
      createdAt: now,
      updatedAt: now,
      profileComplete: false,
      verified: false,
    }
    const workerFields = role === 'worker'
      ? {
          availability: 'available' as const,
          skills: [],
          bio: '',
          location: '',
          rating: 0,
          reviewCount: 0,
          completedJobs: 0,
          weeklyPoints: 0,
        }
      : {}
    await setDoc(doc(db, 'users', uid), { ...baseFields, ...workerFields })
  }

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth')
      const { auth } = await import('@/lib/firebase')
      if (!auth) {
        toast.error('Authentication service not available. Please configure Firebase.')
        return
      }
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password)
      await updateProfile(userCredential.user, { displayName: data.displayName })
      await createUserProfile(userCredential.user.uid, data.email, data.displayName, data.role)
      toast.success('Account created successfully!')
      router.push(data.role === 'employer' ? '/dashboard/employer' : '/dashboard/worker')
    } catch (error: unknown) {
      const err = error as { code?: string }
      if (err.code === 'auth/email-already-in-use') {
        toast.error('Email already in use. Please sign in instead.')
      } else {
        toast.error('Failed to create account. Please try again.')
      }
    }
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    try {
      const { signInWithPopup, GoogleAuthProvider } = await import('firebase/auth')
      const { auth } = await import('@/lib/firebase')
      if (!auth) {
        toast.error('Authentication service not available. Please configure Firebase.')
        return
      }
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const user = result.user
      await createUserProfile(
        user.uid,
        user.email,
        user.displayName || 'User',
        selectedRole
      )
      toast.success('Account created successfully!')
      router.push(selectedRole === 'employer' ? '/dashboard/employer' : '/dashboard/worker')
    } catch (error: unknown) {
      const err = error as { code?: string }
      console.error('Google sign-up error:', error)
      if (err.code === 'auth/popup-blocked') {
        toast.error('Popup was blocked. Please allow popups and try again.')
      } else if (err.code === 'auth/network-request-failed') {
        toast.error('Network error. Please check your connection and try again.')
      } else if (err.code === 'auth/popup-closed-by-user') {
        toast.error('Sign-up cancelled.')
      } else {
        toast.error(`Failed to sign up with Google${err.code ? ` (${err.code})` : ''}`)
      }
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Radial glow backdrop */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,102,241,0.12) 0%, transparent 70%)' }}
      />
      <div className="relative sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex items-center justify-center space-x-2 mb-6">
          <span className="text-2xl font-bold text-white">
            ⚡ QuickTrade
          </span>
        </Link>
        <h2 className="text-center text-2xl font-bold text-white">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
            Sign in
          </Link>
        </p>
      </div>

      <div className="relative mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-2xl shadow-2xl py-8 px-4 sm:px-10">
          {/* Role Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              I want to...
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'worker', label: 'Find Work', emoji: '👷', desc: 'I am a skilled worker' },
                { value: 'employer', label: 'Hire Workers', emoji: '🏢', desc: 'I need work done' },
              ].map(({ value, label, emoji, desc }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setValue('role', value as 'worker' | 'employer')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedRole === value
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="text-2xl mb-1">{emoji}</div>
                  <div className="font-semibold text-sm text-white">{label}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{desc}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-700 rounded-lg text-sm font-medium text-gray-200 bg-gray-800 hover:bg-gray-700 transition-colors disabled:opacity-50 mb-6"
          >
            {googleLoading ? (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            Continue with Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-900 text-gray-500">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                <input
                  id="displayName"
                  type="text"
                  autoComplete="name"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 text-white placeholder:text-gray-500 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  {...register('displayName')}
                />
              </div>
              {errors.displayName && <p className="mt-1 text-sm text-red-400">{errors.displayName.message}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 text-white placeholder:text-gray-500 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  {...register('email')}
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-800 border border-gray-700 text-white placeholder:text-gray-500 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">At least 8 characters</p>
              {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 text-white placeholder:text-gray-500 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  {...register('confirmPassword')}
                />
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-400">{errors.confirmPassword.message}</p>}
            </div>

            <p className="text-xs text-gray-500">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                Privacy Policy
              </Link>
              .
            </p>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isSubmitting ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>}>
      <RegisterForm />
    </Suspense>
  )
}
