export interface NZRegion {
  /** URL slug — lowercase, no spaces */
  slug: string
  /** Human-readable city/town name */
  city: string
  /** Administrative region name */
  region: string
  /** Country code */
  country: 'nz'
  /** Lat/lng for structured data — centroid of city */
  geo?: { lat: number; lng: number }
}

export const NZ_REGIONS: NZRegion[] = [
  {
    slug: 'blenheim',
    city: 'Blenheim',
    region: 'Marlborough',
    country: 'nz',
    geo: { lat: -41.5135, lng: 173.9612 },
  },
  {
    slug: 'auckland',
    city: 'Auckland',
    region: 'Auckland',
    country: 'nz',
    geo: { lat: -36.8485, lng: 174.7633 },
  },
  {
    slug: 'wellington',
    city: 'Wellington',
    region: 'Wellington',
    country: 'nz',
    geo: { lat: -41.2866, lng: 174.7756 },
  },
  {
    slug: 'christchurch',
    city: 'Christchurch',
    region: 'Canterbury',
    country: 'nz',
    geo: { lat: -43.5321, lng: 172.6362 },
  },
  {
    slug: 'hamilton',
    city: 'Hamilton',
    region: 'Waikato',
    country: 'nz',
    geo: { lat: -37.7826, lng: 175.2528 },
  },
  {
    slug: 'tauranga',
    city: 'Tauranga',
    region: 'Bay of Plenty',
    country: 'nz',
    geo: { lat: -37.6878, lng: 176.1651 },
  },
  {
    slug: 'dunedin',
    city: 'Dunedin',
    region: 'Otago',
    country: 'nz',
    geo: { lat: -45.8788, lng: 170.5028 },
  },
  {
    slug: 'nelson',
    city: 'Nelson',
    region: 'Nelson',
    country: 'nz',
    geo: { lat: -41.2706, lng: 173.284 },
  },
  {
    slug: 'queenstown',
    city: 'Queenstown',
    region: 'Otago',
    country: 'nz',
    geo: { lat: -45.0312, lng: 168.6626 },
  },
  {
    slug: 'napier',
    city: 'Napier',
    region: "Hawke's Bay",
    country: 'nz',
    geo: { lat: -39.4928, lng: 176.9121 },
  },
  {
    slug: 'palmerston-north',
    city: 'Palmerston North',
    region: 'Manawatū-Whanganui',
    country: 'nz',
    geo: { lat: -40.3523, lng: 175.6082 },
  },
]

export const COUNTRY_NAMES: Record<string, string> = {
  nz: 'New Zealand',
  au: 'Australia',
  us: 'United States',
}

/** Find a region by slug */
export function getNZRegion(slug: string): NZRegion | undefined {
  return NZ_REGIONS.find((r) => r.slug === slug)
}
