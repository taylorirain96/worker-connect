import type { MetadataRoute } from 'next'
import { SERVICES as SEO_SERVICES, LOCATIONS } from '@/lib/seo/servicesData'
import { SERVICES as OLD_SERVICES } from '@/lib/seo/services'
import { NZ_REGIONS } from '@/lib/seo/regions'

const SITE_URL = 'https://quicktrade.co.nz'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString()

  const entries: MetadataRoute.Sitemap = [
    // Core static pages
    { url: SITE_URL, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${SITE_URL}/services`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
  ]

  // 17 new service pages (primary)
  for (const s of SEO_SERVICES) {
    entries.push({
      url: `${SITE_URL}/services/${s.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    })
  }

  // 170 new service+location pages (region/city format)
  for (const s of SEO_SERVICES) {
    for (const l of LOCATIONS) {
      entries.push({
        url: `${SITE_URL}/services/${s.slug}/nz/${l.regionSlug}/${l.citySlug}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    }
  }

  // Legacy service pages (old slugs not in new set — keep for crawlability)
  const newSlugs = new Set(SEO_SERVICES.map((s) => s.slug))
  for (const s of OLD_SERVICES) {
    if (!newSlugs.has(s.id)) {
      entries.push({
        url: `${SITE_URL}/services/${s.id}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.6,
      })
      // Legacy location pages
      for (const r of NZ_REGIONS) {
        entries.push({
          url: `${SITE_URL}/services/${s.id}/nz/${r.slug}`,
          lastModified: now,
          changeFrequency: 'weekly',
          priority: 0.5,
        })
      }
    }
  }

  // Authority pages
  entries.push(
    { url: `${SITE_URL}/press`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/partners`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    {
      url: `${SITE_URL}/reports/nz-home-services-price-index`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  )

  return entries
}
