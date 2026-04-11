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
    if (typeof window !== 'undefined') {
      const dismissed = sessionStorage.getItem(key)
      if (!dismissed) setVisible(true)
    }
  }, [key])

  const dismiss = () => {
    sessionStorage.setItem(key, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="flex items-center justify-between gap-3 mt-2 px-3 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800">
      <p className="text-xs text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
        <Sparkles className="h-3.5 w-3.5 flex-shrink-0" />
        {role === 'worker'
          ? <><span>Pro members write their bio, CV and cover letters with AI — </span><Link href="/pricing" className="underline font-medium">from $19/mo</Link></>
          : <><span>Pro members write job posts with AI — </span><Link href="/pricing" className="underline font-medium">from $49/mo</Link></>
        }
      </p>
      <button onClick={dismiss} className="text-indigo-400 hover:text-indigo-600 flex-shrink-0">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
