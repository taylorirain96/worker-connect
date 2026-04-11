import type { ServiceDefinition } from './services'
import type { NZRegion } from './regions'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://quicktrade.co.nz'

/**
 * CollectionPage / WebPage JSON-LD for /services/[service]
 */
export function buildServicePageJsonLd(service: ServiceDefinition, canonicalUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${service.label} Services`,
    description: service.description,
    url: canonicalUrl,
    about: {
      '@type': 'Service',
      name: service.label,
      description: service.description,
      keywords: service.keywords.join(', '),
    },
    publisher: {
      '@type': 'Organization',
      name: 'QuickTrade',
      url: SITE_URL,
    },
  }
}

/**
 * Service + LocalBusiness JSON-LD for /services/[service]/[country]/[region]
 */
export function buildServiceLocationJsonLd(
  service: ServiceDefinition,
  region: NZRegion,
  countryName: string,
  canonicalUrl: string,
) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        name: `${service.label} in ${region.city}`,
        description: `Find trusted ${service.label.toLowerCase()} professionals in ${region.city}, ${region.region}, ${countryName}. Browse profiles, compare rates, and hire with confidence.`,
        areaServed: {
          '@type': 'City',
          name: region.city,
          containedInPlace: {
            '@type': 'AdministrativeArea',
            name: region.region,
            containedInPlace: {
              '@type': 'Country',
              name: countryName,
            },
          },
          ...(region.geo
            ? {
                geo: {
                  '@type': 'GeoCoordinates',
                  latitude: region.geo.lat,
                  longitude: region.geo.lng,
                },
              }
            : {}),
        },
        provider: {
          '@type': 'Organization',
          name: 'QuickTrade',
          url: SITE_URL,
        },
        url: canonicalUrl,
      },
      {
        '@type': 'WebPage',
        url: canonicalUrl,
        name: `${service.label} Services in ${region.city} | QuickTrade`,
        description: `Hire ${service.label.toLowerCase()} professionals in ${region.city}, ${countryName}.`,
        about: {
          '@type': 'Service',
          name: service.label,
        },
      },
    ],
  }
}
