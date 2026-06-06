'use client'

import Link from 'next/link'
import { HardHat, Briefcase } from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'
import { useRole } from '@/context/RoleContext'
import DualRoleToggle from '@/components/ui/DualRoleToggle'

interface ProfileHatHeaderProps {
  /**
   * If provided, show this user's profile (read-only header) instead of the
   * signed-in user. The hat toggle is only shown for the signed-in user's
   * own header.
   */
  displayName?: string
  email?: string
  avatarUrl?: string | null
  /** Hide the toggle even on the signed-in user's own header. */
  hideToggle?: boolean
  className?: string
}

/**
 * Shared "who has a profile" strip used at the top of every profile page.
 * Shows the user's avatar, name, the current "hat" they are wearing
 * (Tradie or Client), and — for their own profile — a one-click toggle
 * to flip between posting and taking jobs.
 */
export default function ProfileHatHeader({
  displayName,
  email,
  avatarUrl,
  hideToggle = false,
  className = '',
}: ProfileHatHeaderProps) {
  const { user } = useAuth()
  const { activeHat, isTradie } = useRole()

  const name = displayName ?? user?.displayName ?? user?.email ?? 'User'
  const mail = email ?? user?.email ?? ''
  const initial = (name?.charAt(0) || 'U').toUpperCase()

  const hatLabel = isTradie ? 'Tradie · Taking jobs' : 'Client · Posting jobs'
  const HatIcon = isTradie ? HardHat : Briefcase
  const badgeClasses = isTradie
    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
    : 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300'

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center gap-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 ${className}`}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt={name} className="h-14 w-14 rounded-full object-cover flex-shrink-0" />
        ) : (
          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
            {initial}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-base font-semibold text-gray-900 dark:text-white truncate">{name}</p>
          {mail && <p className="text-xs text-gray-500 truncate">{mail}</p>}
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full mt-1 ${badgeClasses}`}
          >
            <HatIcon className="h-3 w-3" />
            {hatLabel}
          </span>
        </div>
      </div>

      {!hideToggle && user && (
        <div className="flex sm:flex-col items-end gap-2">
          <DualRoleToggle showHint />
          <Link
            href={activeHat === 'tradie' ? '/dashboard/worker' : '/dashboard/employer'}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Go to {activeHat === 'tradie' ? 'Tradie' : 'Client'} dashboard →
          </Link>
        </div>
      )}
    </div>
  )
}
