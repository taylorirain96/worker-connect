import Link from 'next/link'
import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Home, Search, Briefcase } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Page Not Found | QuickTrade NZ',
  description: 'The page you were looking for could not be found. Browse jobs, find workers, or return to the QuickTrade homepage.',
  robots: { index: false },
}

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen luxury-bg">
      <Navbar />

      <main className="relative flex-1 flex items-center justify-center px-4 py-20 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 40% at 50% 30%, rgba(99,102,241,0.12) 0%, transparent 70%)',
          }}
        />
        <div className="relative max-w-lg w-full text-center">
          <p className="text-8xl font-extrabold tracking-tight bg-gradient-to-br from-indigo-400 via-violet-400 to-purple-500 bg-clip-text text-transparent select-none">
            404
          </p>

          <h1 className="mt-4 text-2xl font-bold text-white">
            Page not found
          </h1>

          <p className="mt-3 text-gray-400 text-sm leading-relaxed max-w-sm mx-auto">
            The page you&apos;re looking for doesn&apos;t exist or may have been moved. Here are
            some helpful links to get you back on track.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors w-full sm:w-auto justify-center"
            >
              <Home className="h-4 w-4" />
              Go home
            </Link>

            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors w-full sm:w-auto justify-center"
            >
              <Briefcase className="h-4 w-4" />
              Browse jobs
            </Link>

            <Link
              href="/workers"
              className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors w-full sm:w-auto justify-center"
            >
              <Search className="h-4 w-4" />
              Find workers
            </Link>
          </div>

          <p className="mt-8 text-xs text-gray-500">
            Need help?{' '}
            <Link href="/contact" className="text-indigo-400 hover:text-indigo-300 transition-colors">
              Contact support
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
