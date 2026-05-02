'use client'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function PostJobPage() {
  return (
    <div className="min-h-screen bg-[#0a0f1e] flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        {/* Radial glow */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,102,241,0.12) 0%, transparent 70%)' }}
        />
        <div className="relative w-full max-w-4xl">
          <h1 className="text-3xl sm:text-4xl font-bold text-white text-center mb-3">
            What are you here to do?
          </h1>
          <p className="text-gray-400 text-center mb-12 text-base">
            Choose the option that best describes you
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Homeowner card */}
            <div className="group bg-gray-900/80 backdrop-blur-sm border border-gray-800 hover:border-indigo-500/60 rounded-2xl p-8 flex flex-col items-center text-center transition-all duration-200 hover:bg-gray-900/90 shadow-lg">
              <div className="text-6xl mb-4">🏠</div>
              <h2 className="text-xl font-bold text-white mb-2">I need something done</h2>
              <p className="text-gray-400 text-sm mb-8">
                Fencing, plumbing, painting, cleaning...
              </p>
              <Link
                href="/post/homeowner"
                className="mt-auto w-full py-3 px-6 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl transition-all text-sm text-center"
              >
                Post My Job →
              </Link>
            </div>

            {/* Employer card */}
            <div className="group bg-gray-900/80 backdrop-blur-sm border border-gray-800 hover:border-indigo-500/60 rounded-2xl p-8 flex flex-col items-center text-center transition-all duration-200 hover:bg-gray-900/90 shadow-lg">
              <div className="text-6xl mb-4">🏢</div>
              <h2 className="text-xl font-bold text-white mb-2">I&apos;m hiring staff or contractors</h2>
              <p className="text-gray-400 text-sm mb-8">
                Full-time, part-time, contract roles...
              </p>
              <Link
                href="/jobs/create"
                className="mt-auto w-full py-3 px-6 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white font-semibold rounded-xl transition-all text-sm text-center"
              >
                Post a Role →
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
