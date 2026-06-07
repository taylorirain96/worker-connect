import Image from 'next/image'
import Link from 'next/link'

export default function MarketingNavbar() {
  return (
    <nav className="bg-white/95 dark:bg-gray-800/95 backdrop-blur border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/icons/icon-192.png"
              alt="QuickTrade logo"
              width={32}
              height={32}
              sizes="32px"
              priority
            />
            <span className="text-xl font-bold text-primary-600">
              Quick<span className="text-accent-500">Trade</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-5">
            <Link href="/services" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              Services
            </Link>
            <Link href="/workers" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              Find Workers
            </Link>
            <Link href="/jobs/create" className="inline-flex items-center bg-gradient-to-r from-indigo-700 to-violet-700 hover:from-indigo-600 hover:to-violet-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-all shadow-sm shadow-indigo-500/30">
              Post a Job
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/auth/login" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              Sign In
            </Link>
            <Link href="/auth/register" className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
