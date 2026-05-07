'use client'
import { useState, useEffect, useCallback } from 'react'
import { Heart } from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface FavouriteButtonProps {
  workerId: string
  /** Initial state — pass true if you already know this worker is favourited */
  initialFavourited?: boolean
  /** Called after the state changes so parents can react */
  onToggle?: (favourited: boolean) => void
  className?: string
  size?: 'sm' | 'md'
}

export default function FavouriteButton({
  workerId,
  initialFavourited = false,
  onToggle,
  className = '',
  size = 'md',
}: FavouriteButtonProps) {
  const { user, profile } = useAuth()
  const router = useRouter()
  const [favourited, setFavourited] = useState(initialFavourited)
  const [saving, setSaving] = useState(false)

  // Keep in sync if parent passes a new initial value (e.g. after data loads)
  useEffect(() => {
    setFavourited(initialFavourited)
  }, [initialFavourited])

  const handleToggle = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      if (!user) {
        router.push('/auth/login')
        return
      }

      // Only homeowners can favourite workers
      if (profile?.role && profile.role !== 'homeowner') return

      // Optimistic UI update
      const newState = !favourited
      setFavourited(newState)
      setSaving(true)

      try {
        const method = newState ? 'POST' : 'DELETE'
        const res = await fetch('/api/favourites', {
          method,
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user.uid,
          },
          body: JSON.stringify({ workerId }),
        })

        if (!res.ok) {
          throw new Error('Request failed')
        }

        toast.success(newState ? 'Added to favourites' : 'Removed from favourites')
        onToggle?.(newState)
      } catch {
        // Revert optimistic update on failure
        setFavourited(!newState)
        toast.error('Could not update favourites. Please try again.')
      } finally {
        setSaving(false)
      }
    },
    [user, profile, favourited, workerId, onToggle, router]
  )

  // Don't show the button for the worker's own profile or non-homeowners
  if (user?.uid === workerId) return null
  if (profile && profile.role !== 'homeowner') return null

  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'
  const btnSize = size === 'sm' ? 'h-7 w-7' : 'h-9 w-9'

  return (
    <button
      type="button"
      aria-label={favourited ? 'Remove from favourites' : 'Add to favourites'}
      aria-pressed={favourited}
      disabled={saving}
      onClick={handleToggle}
      className={`inline-flex items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 disabled:opacity-60 ${btnSize} ${
        favourited
          ? 'bg-rose-100 text-rose-600 hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:hover:bg-rose-900/50'
          : 'bg-gray-100 text-gray-400 hover:bg-rose-100 hover:text-rose-500 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-rose-900/30 dark:hover:text-rose-400'
      } ${className}`}
    >
      <Heart
        className={`${iconSize} transition-all ${favourited ? 'fill-current' : ''}`}
      />
    </button>
  )
}
