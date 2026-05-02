'use client'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function PostJobSplitPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-3xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              What are you looking for?
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              Choose the option that fits you best
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Homeowner Card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-8 flex flex-col items-center text-center hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-lg transition-all group">
              <div className="text-5xl mb-4">🏠</div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                I need something done
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                Fencing, plumbing, painting, cleaning, building...
              </p>
              <Link
                href="/post/homeowner"
                className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-center transition-colors group-hover:bg-indigo-700"
              >
                Post My Job →
              </Link>
              <p className="text-xs text-gray-400 mt-3">Free to post · No credit card needed</p>
            </div>

            {/* Employer Card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-8 flex flex-col items-center text-center hover:border-violet-400 dark:hover:border-violet-500 hover:shadow-lg transition-all group">
              <div className="text-5xl mb-4">🏢</div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                I&apos;m hiring staff or contractors
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                Full-time, part-time, contract roles...
              </p>
              <Link
                href="/jobs/create"
                className="w-full py-3 px-6 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl text-center transition-colors group-hover:bg-violet-700"
              >
                Post a Role →
              </Link>
              <p className="text-xs text-gray-400 mt-3">For businesses &amp; employers</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
