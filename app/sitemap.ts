import type { MetadataRoute } from 'next'
import { SERVICES, LOCATIONS } from '@/lib/seo/servicesData'
import { SITE_URL } from '@/lib/seo/config'
import { getAllPosts } from '@/lib/blog/posts'
import { AU_CITIES } from '@/lib/utils'

const BASE = SITE_URL

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString()
  const entries: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE}/jobs`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/workers`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/services`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/pricing`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/auth/register`, lastModified: now, changeFrequency: 'yearly', priority: 0.7 },
    { url: `${BASE}/auth/login`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${BASE}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/press`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/partners`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    {
      url: `${BASE}/reports/nz-home-services-price-index`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]

  entries.push({ url: `${BASE}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 })
  for (const post of getAllPosts()) {
    entries.push({ url: `${BASE}/blog/${post.slug}`, lastModified: post.date, changeFrequency: 'monthly', priority: 0.7 })
  }

  entries.push({ url: `${BASE}/apprenticeships`, lastModified: now, changeFrequency: 'daily', priority: 0.8 })
  entries.push({ url: `${BASE}/au`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 })
  entries.push({ url: `${BASE}/api-docs`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 })

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
    for (const city of AU_CITIES) {
      const citySlug = city.toLowerCase().replace(/\s+/g, '-')
      entries.push({
        url: `${BASE}/services/${s.slug}/au/${citySlug}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    }
  }

  return entries
}
