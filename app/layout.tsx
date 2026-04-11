import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { RoleProvider } from '@/context/RoleContext'
import { Toaster } from 'react-hot-toast'
import dynamic from 'next/dynamic'

const SupportChatbot = dynamic(() => import('@/components/chat/SupportChatbot'), { ssr: false })

export const metadata: Metadata = {
  title: 'QuickTrade | Find Trusted Trade Workers in New Zealand',
  description:
    'QuickTrade connects Marlborough, Nelson and Wellington businesses with verified, reviewed trade workers. Hire electricians, plumbers, builders and more — fast.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://quicktrade-pi.vercel.app'),
  alternates: {
    canonical: '/',
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
    </html>
  )
}