'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Wrench, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useAuth } from '@/components/providers/AuthProvider'
import { getDashboardPath } from '@/lib/auth/redirects'
import type { UserProfile } from '@/types'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const { user, profile, loading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  // Redirect away if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.replace(getDashboardPath(profile))
    }
  }, [user, profile, loading, router])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      const { signInWithEmailAndPassword } = await import('firebase/auth')
      const { auth, db } = await import('@/lib/firebase')
      if (!auth) {
        toast.error('Authentication service not available. Please configure Firebase.')
        return
      }
      const credential = await signInWithEmailAndPassword(auth, data.email, data.password)
      toast.success('Welcome back!')
      // Fetch profile to determine role-based redirect
      let dashboardPath = '/dashboard'
      if (db) {
        try {
          const { doc, getDoc } = await import('firebase/firestore')
          const docSnap = await getDoc(doc(db, 'users', credential.user.uid))
          if (docSnap.exists()) {
            const userProfile = docSnap.data() as UserProfile
            dashboardPath = getDashboardPath(userProfile)
          }
        } catch {
          // Fall back to generic dashboard if profile fetch fails
        }
      }
      router.push(dashboardPath)
    } catch (error: unknown) {
      const err = error as { code?: string }
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        toast.error('Invalid email or password')
      } else if (err.code === 'auth/too-many-requests') {
        toast.error('Too many failed attempts. Please try again later or reset your password.')
      } else {
        toast.error('An error occurred. Please try again.')
      }
    }
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    try {
      const { signInWithPopup, GoogleAuthProvider } = await import('firebase/auth')
      const { auth, db } = await import('@/lib/firebase')
      if (!auth) {
        toast.error('Authentication service not available. Please configure Firebase.')
        return
      }
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      toast.success('Welcome back!')
      // Fetch profile to determine role-based redirect
      let dashboardPath = '/dashboard'
      if (db) {
        try {
          const { doc, getDoc } = await import('firebase/firestore')
          const docSnap = await getDoc(doc(db, 'users', result.user.uid))
          if (docSnap.exists()) {
            const userProfile = docSnap.data() as UserProfile
            dashboardPath = getDashboardPath(userProfile)
          }
        } catch {
          // Fall back to generic dashboard if profile fetch fails
        }
      }
      router.push(dashboardPath)
    } catch (error: unknown) {
      const err = error as { code?: string }
      console.error('Google sign-in error:', error)
      if (err.code === 'auth/popup-blocked') {
        toast.error('Popup was blocked. Please allow popups and try again.')
      } else if (err.code === 'auth/network-request-failed') {
        toast.error('Network error. Please check your connection and try again.')
      } else if (err.code === 'auth/popup-closed-by-user') {
        toast.error('Sign-in cancelled.')
      } else {
        toast.error(`Failed to sign in with Google${err.code ? ` (${err.code})` : ''}`)
      }
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex items-center justify-center space-x-2 mb-6">
          <Wrench className="h-8 w-8 text-primary-600" />
          <span className="text-2xl font-bold text-primary-600">
            Quick<span className="text-accent-500">Trade</span>
          </span>
        </Link>
        <h2 className="text-center text-2xl font-bold text-gray-900 dark:text-white">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="font-medium text-primary-600 hover:text-primary-500">
            Get started for free
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-sm rounded-xl sm:px-10 border border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-6"
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
              <div className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              id="email"
              autoComplete="email"
              leftIcon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <div>
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                leftIcon={<Lock className="h-4 w-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="pointer-events-auto text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
                error={errors.password?.message}
                {...register('password')}
              />
              <div className="flex justify-end mt-1">
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-primary-600 hover:text-primary-500"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
