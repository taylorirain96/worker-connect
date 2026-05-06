'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log only the error message and digest to avoid leaking sensitive stack info in production
    if (process.env.NODE_ENV === 'development') {
      console.error('[App Error]', error)
    } else {
      console.error('[App Error]', error.message, error.digest ?? '')
    }
  }, [error])

  return (
    <div className="relative flex flex-col min-h-screen luxury-bg items-center justify-center px-4 py-20 overflow-hidden">
      {/* Glow backdrop */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 30%, rgba(239,68,68,0.08) 0%, transparent 70%)',
        }}
      />

      <div className="relative max-w-md w-full text-center">
        {/* Icon */}
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-500/10 border border-red-500/20 mb-6 mx-auto">
          <AlertTriangle className="h-8 w-8 text-red-400" />
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold text-white mb-3">Something went wrong</h1>

        {/* Sub-text */}
        <p className="text-gray-400 text-sm leading-relaxed mb-2">
          An unexpected error occurred. This has been logged and we&apos;ll look into it.
        </p>

        {error.digest && (
          <p className="text-xs text-gray-600 font-mono mb-8">
            Error ID: {error.digest}
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors w-full sm:w-auto justify-center"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors w-full sm:w-auto justify-center"
          >
            <Home className="h-4 w-4" />
            Return home
          </Link>
        </div>
      </div>
    </div>
  )
}
