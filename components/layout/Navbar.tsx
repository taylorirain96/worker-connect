'use client'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { useAuth } from '@/components/providers/AuthProvider'
import { Sun, Moon, Menu, X, Wrench, ChevronDown } from 'lucide-react'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { getInitials } from '@/lib/utils'
import NotificationCenter from '@/components/notifications/NotificationCenter'
import { subscribeToTotalUnread } from '@/lib/services/messagingService'
import DualRoleToggle from '@/components/ui/DualRoleToggle'
import { useRole } from '@/context/RoleContext'

export default function Navbar() {
  const { theme, setTheme } = useTheme()
  const { user, profile } = useAuth()
  const { activeRole, isWorker, isEmployer } = useRole()
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [unreadMessages, setUnreadMessages] = useState(0)
  const router = useRouter()

  useEffect(() => {
    if (!user) return
    const unsub = subscribeToTotalUnread(user.uid, setUnreadMessages)
    return () => unsub()
  }, [user])

  const handleSignOut = async () => {
    try {
      const { signOut } = await import('firebase/auth')
      const { auth } = await import('@/lib/firebase')
      if (!auth) return
      await signOut(auth)
      toast.success('Signed out successfully')
      router.push('/')
    } catch {
      toast.error('Error signing out')
    }
  }

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <Wrench className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-primary-600">
              Quick<span className="text-accent-500">Trade</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            {isWorker && (
              <>
                <Link href="/jobs" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm font-medium">
                  Find Jobs
                </Link>
                <Link href="/jobs/matched" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm font-medium">
                  My Matches
                </Link>
                <Link href="/timesheets" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm font-medium">
                  Timesheets
                </Link>
              </>
            )}
            {isEmployer && (
              <>
                <Link href="/jobs/create" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm font-medium">
                  Post a Job
                </Link>
                <Link href="/workers" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm font-medium">
                  Find Workers
                </Link>
                <Link href="/jobs" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm font-medium">
                  Manage Listings
                </Link>
              </>
            )}
            <Link href="/services" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm font-medium">
              Services
            </Link>
            <Link href="/leaderboard" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm font-medium">
              🏆 Leaderboard
            </Link>
            <Link href="/how-it-works" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm font-medium">
              How It Works
            </Link>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {user && <DualRoleToggle />}

            {user ? (
              <div className="flex items-center space-x-2">
                <NotificationCenter />

                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-semibold">
                      {getInitials(user.displayName || user.email || 'U')}
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-500 hidden md:block" />
                  </button>

                  {profileOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                      <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                        <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.displayName || 'User'}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block capitalize ${
                            activeRole === 'worker'
                              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                              : 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400'
                          }`}>
                            {activeRole} view
                          </span>
                        </div>
                        <div className="py-1">
                          <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onClick={() => setProfileOpen(false)}>
                            Dashboard
                          </Link>
                          <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onClick={() => setProfileOpen(false)}>
                            Profile
                          </Link>
                          {isEmployer && (
                            <Link href="/dashboard/business/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onClick={() => setProfileOpen(false)}>
                              Business Profile
                            </Link>
                          )}
                          {isWorker && (
                            <Link href="/analytics" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onClick={() => setProfileOpen(false)}>
                              📊 Analytics
                            </Link>
                          )}
                          <Link href="/notifications" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onClick={() => setProfileOpen(false)}>
                            🔔 Notifications
                          </Link>
                          <Link href="/messages" className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onClick={() => setProfileOpen(false)}>
                            Messages
                            {unreadMessages > 0 && (
                              <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                                {unreadMessages > 9 ? '9+' : unreadMessages}
                              </span>
                            )}
                          </Link>
                          <Link href="/payments" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onClick={() => setProfileOpen(false)}>
                            Payments
                          </Link>
                          {isWorker && (
                            <Link href="/earnings" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onClick={() => setProfileOpen(false)}>
                              Earnings
                            </Link>
                          )}
                          {profile?.role === 'admin' && (
                            <>
                              <Link href="/admin" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onClick={() => setProfileOpen(false)}>
                                Admin Panel
                              </Link>
                              <Link href="/admin/analytics" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onClick={() => setProfileOpen(false)}>
                                📊 Platform Analytics
                              </Link>
                              <Link href="/admin/notifications" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onClick={() => setProfileOpen(false)}>
                                🔔 Notification Manager
                              </Link>
                            </>
                          )}
                          <div className="border-t border-gray-100 dark:border-gray-700 mt-1 pt-1">
                            <Link href="/settings/notifications" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onClick={() => setProfileOpen(false)}>
                              ⚙️ Notification Settings
                            </Link>
                            <button onClick={handleSignOut} className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                              Sign Out
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Link href="/auth/login" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition-colors text-sm font-medium">
                  Sign In
                </Link>
                <Link href="/auth/register" className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
                  Get Started
                </Link>
              </div>
            )}

            <button
              className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col space-y-1">
              {isWorker && (
                <>
                  <Link href="/jobs" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 px-3 py-2 rounded-lg transition-colors" onClick={() => setMenuOpen(false)}>
                    Find Jobs
                  </Link>
                  <Link href="/jobs/matched" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 px-3 py-2 rounded-lg transition-colors" onClick={() => setMenuOpen(false)}>
                    My Matches
                  </Link>
                  <Link href="/timesheets" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 px-3 py-2 rounded-lg transition-colors" onClick={() => setMenuOpen(false)}>
                    Timesheets
                  </Link>
                </>
              )}
              {isEmployer && (
                <>
                  <Link href="/jobs/create" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 px-3 py-2 rounded-lg transition-colors" onClick={() => setMenuOpen(false)}>
                    Post a Job
                  </Link>
                  <Link href="/workers" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 px-3 py-2 rounded-lg transition-colors" onClick={() => setMenuOpen(false)}>
                    Find Workers
                  </Link>
                  <Link href="/jobs" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 px-3 py-2 rounded-lg transition-colors" onClick={() => setMenuOpen(false)}>
                    Manage Listings
                  </Link>
                </>
              )}
              <Link href="/services" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 px-3 py-2 rounded-lg transition-colors" onClick={() => setMenuOpen(false)}>
                Services
              </Link>
              <Link href="/leaderboard" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 px-3 py-2 rounded-lg transition-colors" onClick={() => setMenuOpen(false)}>
                🏆 Leaderboard
              </Link>
              <Link href="/how-it-works" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 px-3 py-2 rounded-lg transition-colors" onClick={() => setMenuOpen(false)}>
                How It Works
              </Link>
              {!user && (
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
                  <Link href="/auth/login" className="block text-center px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium" onClick={() => setMenuOpen(false)}>
                    Sign In
                  </Link>
                  <Link href="/auth/register" className="block text-center bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium" onClick={() => setMenuOpen(false)}>
                    Get Started
                  </Link>
                </div>
              )}
              {user && (
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-1">
                  <div className="px-3 pb-2">
                    <DualRoleToggle />
                  </div>
                  <Link href="/dashboard" className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                  <Link href="/messages" className="flex items-center justify-between px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg" onClick={() => setMenuOpen(false)}>
                    Messages
                    {unreadMessages > 0 && (
                      <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                        {unreadMessages > 9 ? '9+' : unreadMessages}
                      </span>
                    )}
                  </Link>
                  {isWorker && (
                    <Link href="/analytics" className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg" onClick={() => setMenuOpen(false)}>
                      📊 Analytics
                    </Link>
                  )}
                  {profile?.role === 'admin' && (
                    <Link href="/admin/analytics" className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg" onClick={() => setMenuOpen(false)}>
                      📊 Platform Analytics
                    </Link>
                  )}
                  <button onClick={() => { handleSignOut(); setMenuOpen(false) }} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg">Sign Out</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
