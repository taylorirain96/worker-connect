'use client'
import { useState, useEffect } from 'react'
import { Sparkles, X } from 'lucide-react'
import Link from 'next/link'

interface AIUpgradePromptProps {
  role: 'worker' | 'employer'
}

export default function AIUpgradePrompt({ role }: AIUpgradePromptProps) {
  const key = `ai_prompt_dismissed_${role}`
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && !sessionStorage.getItem(key)) {
      setVisible(true)
    }
  }, [key])

  const handleDismiss = () => {
    sessionStorage.setItem(key, '1')
    setVisible(false)
  }

  if (!visible) return null

  const message =
    role === 'worker'
      ? '✨ Pro members can write their bio, CV and cover letters with AI — from $19/mo'
      : '✨ Pro members can write job posts with AI — from $49/mo'

  return (
    <div className="flex items-center justify-between gap-3 mt-2 px-3 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-700 dark:text-indigo-300">
      <span className="flex items-center gap-1.5">
        <Sparkles className="h-3.5 w-3.5 flex-shrink-0" />
        <span>
          {message}{' '}
          <Link href="/pricing" className="font-semibold underline hover:no-underline">
            See plans
          </Link>
        </span>
      </span>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss"
        className="text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-200 flex-shrink-0"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
