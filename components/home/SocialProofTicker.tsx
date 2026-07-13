'use client'
import { useState, useEffect } from 'react'

interface ActivityItem {
  type: 'job_posted' | 'booking_made' | 'review_left'
  label: string
  location?: string
  timeAgo: string
}

export default function SocialProofTicker() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    fetch('/api/platform/live-activity')
      .then((r) => r.json())
      .then((data: { activities?: ActivityItem[] }) => {
        if (data.activities?.length) setActivities(data.activities)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (activities.length < 2) return
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setCurrentIndex((i) => (i + 1) % activities.length)
        setVisible(true)
      }, 400)
    }, 4000)
    return () => clearInterval(interval)
  }, [activities])

  if (activities.length === 0) return null

  const current = activities[currentIndex]

  return (
    <div className="w-full bg-slate-900/80 border-b border-slate-800/60 py-2 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center gap-3">
        <span
          className={`text-sm text-slate-400 transition-opacity duration-400 ${visible ? 'opacity-100' : 'opacity-0'}`}
        >
          {current.label}
          {current.location && (
            <span className="text-slate-400"> · {current.location}</span>
          )}
          <span className="text-slate-400 ml-2">{current.timeAgo}</span>
        </span>
      </div>
    </div>
  )
}
