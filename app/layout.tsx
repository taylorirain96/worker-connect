import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { RoleProvider } from '@/context/RoleContext'
import { NotificationProvider } from '@/context/NotificationContext'
import { Toaster } from 'react-hot-toast'
import { GoogleAnalytics } from '@next/third-parties/google'
import { SITE_URL } from '@/lib/seo/config'
import ClientProviders from './ClientProviders'

export const metadata: Metadata = {
  title: {
    default: 'QuickTrade | Find Trusted Trade Workers in New Zealand',
    template: '%s | QuickTrade NZ',
  },
  description:
    "QuickTrade is New Zealand's trusted marketplace for local tradespeople. Hire verified plumbers, electricians, builders, cleaners and more — fast, safe, and affordable.",
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    siteName: 'QuickTrade NZ',
    type: 'website',
    locale: 'en_NZ',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: "QuickTrade NZ — New Zealand's trusted home services marketplace",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@QuickTradeNZ',
    creator: '@QuickTradeNZ',
    images: ['/opengraph-image'],
  },
  verification: {
    google: 'enRA8wPdrXeyGokwFwib3l91iwklLPAdCdLruIhLJJc',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID
  return (
    <html lang="en-NZ" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#6366f1" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="QuickTrade" />
        <link rel="apple-touch-icon" href="/icons/icon-152.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192.png" />
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
              <NotificationProvider>
                {children}
                <Toaster position="top-right" />
                <ClientProviders />
              </NotificationProvider>
            </RoleProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
      {GA_ID ? <GoogleAnalytics gaId={GA_ID} /> : null}
    </html>
  )
}
