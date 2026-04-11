'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { useAuth } from '@/components/providers/AuthProvider'

export type ActiveRole = 'worker' | 'employer'

interface RoleContextValue {
  activeRole: ActiveRole
  setActiveRole: (role: ActiveRole) => void
  toggleRole: () => void
  isWorker: boolean
  isEmployer: boolean
}

const RoleContext = createContext<RoleContextValue>({
  activeRole: 'worker',
  setActiveRole: () => {},
  toggleRole: () => {},
  isWorker: true,
  isEmployer: false,
})

const STORAGE_KEY = 'activeRole'

export function RoleProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth()
  const [activeRole, setActiveRoleState] = useState<ActiveRole>('worker')

  // Initialize from localStorage, then fall back to profile role
  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem(STORAGE_KEY) as ActiveRole | null
    if (stored === 'worker' || stored === 'employer') {
      setActiveRoleState(stored)
    } else if (profile?.role === 'employer') {
      setActiveRoleState('employer')
    }
  }, [profile])

  const setActiveRole = useCallback(
    (role: ActiveRole) => {
      setActiveRoleState(role)
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

  const toggleRole = useCallback(() => {
    setActiveRole(activeRole === 'worker' ? 'employer' : 'worker')
  }, [activeRole, setActiveRole])

  return (
    <RoleContext.Provider
      value={{
        activeRole,
        setActiveRole,
        toggleRole,
        isWorker: activeRole === 'worker',
        isEmployer: activeRole === 'employer',
      }}
    >
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  return useContext(RoleContext)
}
