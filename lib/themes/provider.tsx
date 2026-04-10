'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import type { RoleTheme } from '@/lib/themes'

interface RoleThemeContextValue {
  roleTheme: RoleTheme
  setRoleTheme: (theme: RoleTheme) => void
}

const RoleThemeContext = createContext<RoleThemeContextValue>({
  roleTheme: 'worker',
  setRoleTheme: () => {},
})

export function useRoleTheme() {
  return useContext(RoleThemeContext)
}

interface RoleThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: RoleTheme
}

export function RoleThemeProvider({ children, defaultTheme = 'worker' }: RoleThemeProviderProps) {
  const [roleTheme, setRoleThemeState] = useState<RoleTheme>(defaultTheme)

  const setRoleTheme = (theme: RoleTheme) => {
    setRoleThemeState(theme)
    if (typeof window !== 'undefined') {
      localStorage.setItem('roleTheme', theme)
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem('roleTheme') as RoleTheme | null
    if (stored === 'worker' || stored === 'employer') {
      setRoleThemeState(stored)
    }
  }, [])

  return (
    <RoleThemeContext.Provider value={{ roleTheme, setRoleTheme }}>
      <div data-role-theme={roleTheme}>{children}</div>
    </RoleThemeContext.Provider>
  )
}
