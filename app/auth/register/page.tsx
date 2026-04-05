'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Wrench, Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Suspense } from 'react'

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

  const createUserProfile = async (uid: string, email: string | null, displayName: string, role: string) => {
    const { doc, setDoc } = await import('firebase/firestore')
    const { db } = await import('@/lib/firebase')
    if (!db) {
      console.warn('Firestore not initialized')
      return
    }
    await setDoc(doc(db, 'users', uid), {
      uid,
      email,
      displayName,
      photoURL: null,
      role,
      createdAt: new Date().toISOString(),
      profileComplete: false,
      availability: 'available',
      skills: [],
      rating: 0,
      reviewCount: 0,
      completedJobs: 0,
      verified: false,
    })
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
      router.push('/dashboard')
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
      router.push('/dashboard')
    } catch {
      toast.error('Failed to sign up with Google')
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
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-medium text-primary-600 hover:text-primary-500">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-sm rounded-xl sm:px-10 border border-gray-200 dark:border-gray-700">
          {/* Role Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{emoji}</div>
                  <div className="font-semibold text-sm text-gray-900 dark:text-white">{label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 mb-6"
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
              label="Full Name"
              type="text"
              autoComplete="name"
              leftIcon={<User className="h-4 w-4" />}
              error={errors.displayName?.message}
              {...register('displayName')}
            />

            <Input
              label="Email address"
              type="email"
              autoComplete="email"
              leftIcon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
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
              helperText="At least 8 characters"
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              leftIcon={<Lock className="h-4 w-4" />}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <p className="text-xs text-gray-500">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="text-primary-600 hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-primary-600 hover:underline">
                Privacy Policy
              </Link>
              .
            </p>

            <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
              Create Account
            </Button>
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
