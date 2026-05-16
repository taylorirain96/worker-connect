import Script from 'next/script'
import { Users } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import WorkersListClient from './WorkersListClient'
import { getWorkersServer } from '@/lib/services/workerServerService'
import { SITE_URL, SITE_NAME } from '@/lib/seo/config'

// Re-query workers periodically rather than serving fully static HTML, so the
// JSON-LD ItemList stays reasonably fresh as new workers join.
export const revalidate = 300

export default async function WorkersPage() {
  const topWorkers = await getWorkersServer(20)

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Workers', item: `${SITE_URL}/workers` },
    ],
  }

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Verified Trade Workers',
    description:
      'Skilled tradespeople available on QuickTrade — plumbers, electricians, builders, cleaners and more.',
    itemListOrder: 'https://schema.org/ItemListOrderDescending',
    numberOfItems: topWorkers.length,
    itemListElement: topWorkers.map((worker, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${SITE_URL}/workers/${worker.uid}`,
      item: {
        '@type': 'Person',
        '@id': `${SITE_URL}/workers/${worker.uid}`,
        name: worker.displayName || 'QuickTrade Worker',
        url: `${SITE_URL}/workers/${worker.uid}`,
        ...(worker.photoURL ? { image: worker.photoURL } : {}),
        ...(worker.bio ? { description: worker.bio } : {}),
        ...(worker.location ? { address: { '@type': 'PostalAddress', addressLocality: worker.location } } : {}),
        ...(worker.skills && worker.skills.length > 0
          ? { knowsAbout: worker.skills }
          : {}),
        ...(typeof worker.rating === 'number' && (worker.reviewCount ?? 0) > 0
          ? {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: worker.rating,
                reviewCount: worker.reviewCount,
                bestRating: 5,
                worstRating: 1,
              },
            }
          : {}),
        worksFor: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
      },
    })),
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Script
        id="jsonld-workers-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {topWorkers.length > 0 && (
        <Script
          id="jsonld-workers-itemlist"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
      )}

      <Navbar />
      <main className="flex-1">
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="h-6 w-6 text-primary-600" />
              Find Workers
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Browse verified tradespeople across New Zealand.
            </p>
          </div>
        </div>

        <WorkersListClient initialWorkers={topWorkers} />
      </main>
      <Footer />
    </div>
  )
}
