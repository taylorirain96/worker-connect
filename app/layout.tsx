import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { RoleProvider } from '@/context/RoleContext'
import { Toaster } from 'react-hot-toast'
import dynamic from 'next/dynamic'
import { GoogleAnalytics } from '@next/third-parties/google'

const SupportChatbot = dynamic(() => import('@/components/chat/SupportChatbot'), { ssr: false })

export const metadata: Metadata = {
  title: {
    default: 'QuickTrade | Find Trusted Trade Workers in New Zealand',
    template: '%s | QuickTrade NZ',
  },
  description:
    "QuickTrade is New Zealand's trusted marketplace for local tradespeople. Hire verified plumbers, electricians, builders, cleaners and more — fast, safe, and affordable.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://quicktrade-pi.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    siteName: 'QuickTrade NZ',
    type: 'website',
    locale: 'en_NZ',
  },
  verification: {
    google: 'enRA8wPdrXeyGokwFwib3l91iwklLPAdCdLruIhLJJc',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-NZ" suppressHydrationWarning>
      <body className="font-sans bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <RoleProvider>
              {children}
              <Toaster position="top-right" />
              <SupportChatbot />
            </RoleProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
      <GoogleAnalytics gaId="G-VNY47FMBTR" />
    </html>
  )
}