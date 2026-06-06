'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '@/components/providers/AuthProvider'

/**
 * The user-facing "hat" the user is currently wearing.
 * - `tradie`  → does the work / takes jobs (formerly `worker`)
 * - `client`  → posts work / hires (formerly `employer`)
 *
 * `worker`/`employer` are kept as legacy aliases so existing call sites
 * keep working unchanged.
 */
export type Hat = 'tradie' | 'client'
export type ActiveRole = 'worker' | 'employer'

const HAT_TO_ROLE: Record<Hat, ActiveRole> = { tradie: 'worker', client: 'employer' }
const ROLE_TO_HAT: Record<ActiveRole, Hat> = { worker: 'tradie', employer: 'client' }

interface RoleContextValue {
  /** Legacy alias of the active hat as `worker | employer`. */
  activeRole: ActiveRole
  /** The active hat in user-facing terms. */
  activeHat: Hat
  setActiveRole: (role: ActiveRole) => void
  setActiveHat: (hat: Hat) => void
  toggleRole: () => void
  isWorker: boolean
  isEmployer: boolean
  isTradie: boolean
  isClient: boolean
}

const RoleContext = createContext<RoleContextValue>({
  activeRole: 'worker',
  activeHat: 'tradie',
  setActiveRole: () => {},
  setActiveHat: () => {},
  toggleRole: () => {},
  isWorker: true,
  isEmployer: false,
  isTradie: true,
  isClient: false,
})

const STORAGE_KEY = 'activeRole'

function getInitialRole(): ActiveRole {
  if (typeof window === 'undefined') return 'worker'
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'worker' || stored === 'employer') return stored
  if (stored === 'tradie') return 'worker'
  if (stored === 'client') return 'employer'
  return 'worker'
}

/**
 * Map any concrete profile.role to the hat that role most naturally
 * starts in. Workers/tradies/jobseekers default to the Tradie hat,
 * homeowners/employers/property managers default to the Client hat.
 */
function defaultHatForRole(role?: string | null): Hat {
  if (role === 'employer' || role === 'homeowner' || role === 'property_manager') return 'client'
  return 'tradie'
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth()
  const [activeRole, setActiveRoleState] = useState<ActiveRole>(getInitialRole)
  const [explicitlySet, setExplicitlySet] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(STORAGE_KEY) !== null
  })

  // Only infer from profile if the user has never explicitly toggled
  useEffect(() => {
    if (explicitlySet) return
    if (!profile?.role) return
    const hat = defaultHatForRole(profile.role)
    setActiveRoleState(HAT_TO_ROLE[hat])
  }, [profile, explicitlySet])

  const setActiveRole = useCallback(
    (role: ActiveRole, opts?: { silent?: boolean }) => {
      setExplicitlySet(true)
      setActiveRoleState((prev) => {
        if (prev !== role && !opts?.silent && typeof window !== 'undefined') {
          toast.success(
            role === 'worker'
              ? '🦺 You are now taking jobs (Tradie mode)'
              : '📋 You are now posting jobs (Client mode)',
            { id: 'hat-switch' },
          )
        }
        return role
      })
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, role)
      }
      // Optionally persist to server-side profile (non-critical)
      if (user?.uid) {
        fetch('/api/user/role', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid: user.uid, activeRole: role }),
        }).catch(() => {
          // localStorage is the primary persistence mechanism
        })
      }
    },
    [user],
  )

  const setActiveHat = useCallback(
    (hat: Hat) => {
      setActiveRole(HAT_TO_ROLE[hat])
    },
    [setActiveRole],
  )

  const toggleRole = useCallback(() => {
    setActiveRole(activeRole === 'worker' ? 'employer' : 'worker')
  }, [activeRole, setActiveRole])

  const activeHat = ROLE_TO_HAT[activeRole]

  return (
    <RoleContext.Provider
      value={{
        activeRole,
        activeHat,
        setActiveRole,
        setActiveHat,
        toggleRole,
        isWorker: activeRole === 'worker',
        isEmployer: activeRole === 'employer',
        isTradie: activeHat === 'tradie',
        isClient: activeHat === 'client',
      }}
    >
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  return useContext(RoleContext)
}
