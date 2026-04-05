'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import type { User } from 'firebase/auth'
import type { UserProfile } from '@/types'

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    let unsubscribe: (() => void) | undefined

    const initAuth = async () => {
      try {
        const { auth, db } = await import('@/lib/firebase')
        const { onAuthStateChanged } = await import('firebase/auth')
        const { doc, getDoc } = await import('firebase/firestore')

        unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          setUser(firebaseUser)
          if (firebaseUser) {
            try {
              const docRef = doc(db, 'users', firebaseUser.uid)
              const docSnap = await getDoc(docRef)
              if (docSnap.exists()) {
                setProfile(docSnap.data() as UserProfile)
              }
            } catch (error) {
              console.error('Error fetching user profile:', error)
            }
          } else {
            setProfile(null)
          }
          setLoading(false)
        })
      } catch (error) {
        console.error('Auth initialization error:', error)
        setLoading(false)
      }
    }

    initAuth()
    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [mounted])

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
