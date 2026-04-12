import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { RoleProvider } from '@/context/RoleContext'
import { Toaster } from 'react-hot-toast'
import dynamic from 'next/dynamic'
import { GoogleAnalytics } from '@next/third-parties/google'
import { SITE_URL } from '@/lib/seo/config'

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
      <head>
        <link rel="preconnect" href="https://firestore.googleapis.com" />
        <link rel="preconnect" href="https://identitytoolkit.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'Organization',
                  '@id': `${SITE_URL}/#organization`,
                  name: 'QuickTrade',
                  url: SITE_URL,
                  logo: {
                    '@type': 'ImageObject',
                    url: `${SITE_URL}/logo.png`,
                  },
                  description:
                    "New Zealand's trusted marketplace for local tradespeople. Hire verified plumbers, electricians, builders, cleaners and more.",
                  areaServed: {
                    '@type': 'Country',
                    name: 'New Zealand',
                  },
                  sameAs: [],
                },
                {
                  '@type': 'WebSite',
                  '@id': `${SITE_URL}/#website`,
                  url: SITE_URL,
                  name: 'QuickTrade NZ',
                  publisher: {
                    '@id': `${SITE_URL}/#organization`,
                  },
                  potentialAction: {
                    '@type': 'SearchAction',
                    target: {
                      '@type': 'EntryPoint',
                      urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
                    },
                    'query-input': 'required name=search_term_string',
                  },
                },
              ],
            }),
          }}
        />
      </head>
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