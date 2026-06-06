'use client'

import Link from 'next/link'
import { Briefcase, Sparkles } from 'lucide-react'
import { useRole } from '@/context/RoleContext'

/**
 * Permanent cross-promo banner on the Tradie dashboard reminding tradies
 * that they can post a quick labor shift in Client mode without having to
 * "log in to a different app". Tapping the CTA flips the hat to Client
 * and routes straight to the post-a-job flow.
 */
export default function CrossHatCTA() {
  const { setActiveHat } = useRole()

  return (
    <div className="rounded-xl border border-violet-200 bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 dark:border-violet-800 p-4 flex items-center gap-3">
      <div className="h-10 w-10 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center flex-shrink-0">
        <Briefcase className="h-5 w-5 text-violet-600 dark:text-violet-300" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1">
          Need a hand on a job?
          <Sparkles className="h-3.5 w-3.5 text-violet-500" />
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
          Flip to Client mode and post a quick labor shift in 30 seconds — same account, same wallet.
        </p>
      </div>
      <Link
        href="/jobs/post"
        onClick={() => setActiveHat('client')}
        className="text-xs font-semibold px-3 py-1.5 rounded-full bg-violet-600 hover:bg-violet-700 text-white flex-shrink-0"
      >
        Post a shift →
      </Link>
    </div>
  )
}
