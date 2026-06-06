'use client'

import dynamic from 'next/dynamic'

const PWAInstallPrompt = dynamic(() => import('@/components/PWAInstallPrompt'), { ssr: false })
const MobileTabBar = dynamic(() => import('@/components/MobileTabBar'), { ssr: false })
const NotificationPrompt = dynamic(
  () => import('@/components/notifications/NotificationPrompt'),
  { ssr: false }
)

export default function ClientProviders() {
  return (
    <>
      <PWAInstallPrompt />
      <MobileTabBar />
      <NotificationPrompt />
    </>
  )
}
