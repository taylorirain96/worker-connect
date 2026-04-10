import type { MetadataRoute } from 'next'
import { SERVICES, LOCATIONS } from '@/lib/seo/servicesData'

const BASE = 'https://quicktrade.co.nz'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString()
  const entries: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE}/services`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/press`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/partners`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    {
      url: `${BASE}/reports/nz-home-services-price-index`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]

  for (const s of SERVICES) {
    entries.push({
      url: `${BASE}/services/${s.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    })
    for (const l of LOCATIONS) {
      entries.push({
        url: `${BASE}/services/${s.slug}/nz/${l.regionSlug}/${l.citySlug}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    }
  }

  return entries
}
