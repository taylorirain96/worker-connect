import type { MetadataRoute } from 'next'
import { SERVICES } from '@/lib/seo/services'
import { NZ_REGIONS } from '@/lib/seo/regions'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://worker-connect.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/services`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ]

  // /services/[service]
  const serviceRoutes: MetadataRoute.Sitemap = SERVICES.map((service) => ({
    url: `${SITE_URL}/services/${service.id}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // /services/[service]/nz/[region]
  const locationRoutes: MetadataRoute.Sitemap = SERVICES.flatMap((service) =>
    NZ_REGIONS.map((region) => ({
      url: `${SITE_URL}/services/${service.id}/nz/${region.slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  )

  return [...staticRoutes, ...serviceRoutes, ...locationRoutes]
}
