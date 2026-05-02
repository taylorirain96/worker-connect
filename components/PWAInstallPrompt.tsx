'use client'

import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      if (sessionStorage.getItem('pwa-prompt-dismissed')) return
    } catch {
      // sessionStorage unavailable (e.g. private browsing with strict settings)
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setVisible(false)
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    try {
      sessionStorage.setItem('pwa-prompt-dismissed', '1')
    } catch {
      // sessionStorage unavailable — dismiss for the current session anyway
    }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm sm:max-w-md">
      <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-800 border border-indigo-500/30 px-4 py-3 shadow-lg text-sm text-gray-100">
        <p className="flex-1 leading-snug">
          Install <span className="font-semibold text-indigo-400">WorkerConnect</span> for the best
          experience
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleInstall}
            className="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 text-xs font-medium transition-colors"
          >
            Install
          </button>
          <button
            onClick={handleDismiss}
            aria-label="Dismiss install prompt"
            className="rounded-lg bg-slate-700 hover:bg-slate-600 px-3 py-1.5 text-xs font-medium transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}
