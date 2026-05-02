'use client'

import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isIOS() {
  if (typeof navigator === 'undefined') return false
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

function isInStandaloneMode() {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window.navigator as any).standalone === true
  )
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)
  const [iosPrompt, setIosPrompt] = useState(false)

  useEffect(() => {
    // Register the PWA caching service worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Silently ignore registration failures (e.g. in development with strict CSP)
      })
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Already installed or dismissed permanently — don't show
    if (isInStandaloneMode()) return
    try {
      if (localStorage.getItem('pwa-prompt-dismissed')) return
    } catch {
      return
    }

    const ios = isIOS()

    if (ios) {
      // Show iOS instructions after 30 seconds
      const timer = setTimeout(() => setIosPrompt(true), 30_000)
      return () => clearTimeout(timer)
    }

    // Android / Chrome — listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Show after 30 seconds
      setTimeout(() => setVisible(true), 30_000)
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
      localStorage.setItem('pwa-prompt-dismissed', '1')
    } catch {
      // localStorage unavailable — dismiss for current session only
    }
    setVisible(false)
    setIosPrompt(false)
  }

  // iOS install instructions
  if (iosPrompt) {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm sm:max-w-md">
        <div className="rounded-xl bg-slate-800 border border-indigo-500/30 px-4 py-4 shadow-lg text-sm text-gray-100">
          <div className="flex items-start justify-between gap-3 mb-2">
            <p className="font-semibold text-indigo-400">Install WorkerConnect</p>
            <button
              onClick={handleDismiss}
              aria-label="Dismiss install prompt"
              className="rounded-lg bg-slate-700 hover:bg-slate-600 px-2 py-1 text-xs font-medium transition-colors shrink-0"
            >
              ✕
            </button>
          </div>
          <p className="text-gray-300 leading-snug">
            Tap{' '}
            <span className="inline-block font-semibold text-white">
              Share ↑
            </span>{' '}
            then{' '}
            <span className="font-semibold text-white">Add to Home Screen</span>{' '}
            to install WorkerConnect for quick access.
          </p>
        </div>
      </div>
    )
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm sm:max-w-md">
      <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-800 border border-indigo-500/30 px-4 py-3 shadow-lg text-sm text-gray-100">
        <p className="flex-1 leading-snug">
          Install <span className="font-semibold text-indigo-400">WorkerConnect</span> for quick
          access
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
