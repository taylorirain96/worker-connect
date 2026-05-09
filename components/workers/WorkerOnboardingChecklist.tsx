'use client'

import Link from 'next/link'
import { CheckCircle, Circle, ChevronRight, X } from 'lucide-react'
import type { UserProfile } from '@/types'
import { useState } from 'react'

interface ChecklistItem {
  id: string
  label: string
  description: string
  href: string
  done: boolean
}

interface Props {
  profile: UserProfile
}

function buildChecklist(profile: UserProfile): ChecklistItem[] {
  return [
    {
      id: 'photo',
      label: 'Add a profile photo',
      description: 'Workers with photos get 5× more views',
      href: '/settings/profile',
      done: Boolean(profile.photoURL),
    },
    {
      id: 'bio',
      label: 'Write a bio',
      description: 'Tell clients what makes you stand out',
      href: '/settings/profile',
      done: Boolean(profile.bio && profile.bio.trim().length > 0),
    },
    {
      id: 'skills',
      label: 'Add your skills',
      description: 'Help our AI match you to the right jobs',
      href: '/settings/profile',
      done: Boolean(profile.skills && profile.skills.length > 0),
    },
    {
      id: 'licence',
      label: 'Upload a trade licence or certification',
      description: 'Verified workers earn more and get hired faster',
      href: '/dashboard/worker/trade-licences',
      done: false, // checked separately via API — default to not done
    },
    {
      id: 'package',
      label: 'Create your first service package',
      description: 'Offer fixed-price services for instant booking',
      href: '/dashboard/worker/service-packages',
      done: false, // checked separately via API — default to not done
    },
  ]
}

export default function WorkerOnboardingChecklist({ profile }: Props) {
  const [dismissed, setDismissed] = useState(false)

  const checklist = buildChecklist(profile)
  const completedCount = checklist.filter((item) => item.done).length
  const allDone = completedCount === checklist.length
  const progressPct = Math.round((completedCount / checklist.length) * 100)

  // Hide when dismissed or all done
  if (dismissed || allDone) return null

  return (
    <div className="bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-700 rounded-xl p-5 mb-6 relative">
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss onboarding checklist"
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="mb-4 pr-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          🚀 Get started on QuickTrade
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Complete these steps to start getting hired.
        </p>
        <div className="flex items-center gap-3 mt-3">
          <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-2 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
            {completedCount}/{checklist.length} done
          </span>
        </div>
      </div>

      <ul className="space-y-2">
        {checklist.map((item) => (
          <li key={item.id}>
            <Link
              href={item.done ? '#' : item.href}
              onClick={(e) => item.done && e.preventDefault()}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                item.done
                  ? 'opacity-60 cursor-default'
                  : 'hover:bg-indigo-50 dark:hover:bg-indigo-900/20 cursor-pointer'
              }`}
            >
              {item.done ? (
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              ) : (
                <Circle className="h-5 w-5 text-gray-300 dark:text-gray-600 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${item.done ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                  {item.label}
                </p>
                {!item.done && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.description}</p>
                )}
              </div>
              {!item.done && <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
