import type { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/blog/posts'
import { adminDb } from '@/lib/firebase-admin'
import { absoluteUrl } from '@/lib/seo/config'
import { LOCATIONS, SERVICES } from '@/lib/seo/servicesData'
import { AU_CITIES } from '@/lib/utils'

const now = new Date().toISOString()

function asIsoDate(value: unknown) {
  if (!value) return now
  if (typeof value === 'string') return value
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'object' && value !== null && 'toDate' in value && typeof value.toDate === 'function') {
    return value.toDate().toISOString()
  }
  return now
}

function staticEntry(
  path: string,
  priority: number,
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'],
): MetadataRoute.Sitemap[number] {
  return {
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency,
    priority,
  }
}

async function getWorkerEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    const snap = await adminDb.collection('users').where('role', '==', 'worker').get()
    return snap.docs.map((doc) => {
      const data = doc.data()
      return {
        url: absoluteUrl(`/workers/${doc.id}`),
        lastModified: asIsoDate(data.updatedAt ?? data.createdAt),
        changeFrequency: 'weekly',
        priority: 0.7,
      }
    })
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    staticEntry('/', 1.0, 'weekly'),
    staticEntry('/workers', 0.9, 'daily'),
    staticEntry('/jobs', 0.9, 'daily'),
    staticEntry('/services', 0.9, 'weekly'),
    staticEntry('/packages', 0.8, 'weekly'),
    staticEntry('/how-it-works', 0.8, 'monthly'),
    staticEntry('/pricing', 0.8, 'monthly'),
    staticEntry('/about', 0.7, 'monthly'),
    staticEntry('/contact', 0.7, 'monthly'),
    staticEntry('/help', 0.7, 'monthly'),
    staticEntry('/blog', 0.8, 'weekly'),
    staticEntry('/partners', 0.6, 'monthly'),
    staticEntry('/press', 0.6, 'monthly'),
    staticEntry('/privacy', 0.4, 'yearly'),
    staticEntry('/terms', 0.4, 'yearly'),
    staticEntry('/au', 0.7, 'weekly'),
    staticEntry('/apprenticeships', 0.7, 'weekly'),
    staticEntry('/reports/nz-home-services-price-index', 0.7, 'monthly'),
    staticEntry('/api-docs', 0.4, 'monthly'),
  ]

  for (const post of getAllPosts()) {
    entries.push({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: post.date,
      changeFrequency: 'monthly',
      priority: 0.7,
    })
  }

  const uniqueRegions = Array.from(
    new Map(LOCATIONS.map((location) => [location.regionSlug, location])).values(),
  )

  for (const service of SERVICES) {
    entries.push({
      url: absoluteUrl(`/services/${service.slug}`),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    })

    for (const region of uniqueRegions) {
      entries.push({
        url: absoluteUrl(`/services/${service.slug}/nz/${region.regionSlug}`),
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.75,
      })
    }

    for (const location of LOCATIONS) {
      entries.push({
        url: absoluteUrl(`/services/${service.slug}/nz/${location.regionSlug}/${location.citySlug}`),
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    }

    for (const city of AU_CITIES) {
      const citySlug = city.toLowerCase().replace(/\s+/g, '-')
      entries.push({
        url: absoluteUrl(`/services/${service.slug}/au/${citySlug}`),
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.65,
      })
    }
  }

  entries.push(...(await getWorkerEntries()))

  return entries
}
