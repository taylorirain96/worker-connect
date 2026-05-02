'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Briefcase, MessageSquare, Bell, User } from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'
import { useRole } from '@/context/RoleContext'
import { cn } from '@/lib/utils'

const tabs = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Jobs', href: '/jobs', icon: Briefcase },
  { label: 'Messages', href: '/messages', icon: MessageSquare },
  { label: 'Alerts', href: '/notifications', icon: Bell },
  { label: 'Profile', href: '/dashboard', icon: User },
]

export default function MobileTabBar() {
  const pathname = usePathname()
  const { user } = useAuth()
  const { isWorker } = useRole()

  // Only render when a user is signed in
  if (!user) return null

  const profileHref = isWorker ? '/dashboard/worker' : '/dashboard/homeowner'

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 safe-area-inset-bottom"
    >
      <ul className="flex items-center justify-around h-16 px-1">
        {tabs.map(({ label, href, icon: Icon }) => {
          const resolvedHref = label === 'Profile' ? profileHref : href
          const isActive =
            resolvedHref === '/'
              ? pathname === '/'
              : pathname.startsWith(resolvedHref)

          return (
            <li key={label} className="flex-1">
              <Link
                href={resolvedHref}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors w-full',
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-300'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 shrink-0',
                    isActive ? 'text-indigo-600 dark:text-indigo-400' : ''
                  )}
                  aria-hidden="true"
                />
                <span>{label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
