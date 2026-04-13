'use client'
import { useState, useEffect } from 'react'

interface CountdownResult {
  days: number
  hours: number
  minutes: number
  seconds: number
  isExpired: boolean
  /** true when under 24 hours remaining */
  isUrgent: boolean
}

export function useCountdown(expiresAt: string): CountdownResult {
  const getRemaining = () => {
    const diff = new Date(expiresAt).getTime() - Date.now()
    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true, isUrgent: true }
    }
    const totalSeconds = Math.floor(diff / 1000)
    const days = Math.floor(totalSeconds / 86400)
    const hours = Math.floor((totalSeconds % 86400) / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    const isUrgent = diff < 24 * 60 * 60 * 1000
    return { days, hours, minutes, seconds, isExpired: false, isUrgent }
  }

  const [state, setState] = useState<CountdownResult>(getRemaining)

  useEffect(() => {
    if (state.isExpired) return
    const id = setInterval(() => {
      setState(getRemaining())
    }, 1000)
    return () => clearInterval(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expiresAt])

  return state
}
