export interface Service {
  slug: string
  name: string
  namePlural: string
  description: string
  synonyms?: string[]
}

export const SERVICES: Service[] = [
  { slug: 'plumbing', name: 'Plumbing', namePlural: 'Plumbers', description: 'Professional plumbing services including repairs, installations, and maintenance.' },
  { slug: 'electrical', name: 'Electrical', namePlural: 'Electricians', description: 'Licensed electricians for wiring, installations, and electrical repairs.' },
  { slug: 'heat-pumps-air-conditioning', name: 'Heat Pumps & Air Conditioning', namePlural: 'Heat Pump Installers', description: 'Heat pump supply, installation, and servicing. Also known as air conditioning and aircon installation.', synonyms: ['air conditioning', 'aircon', 'HVAC'] },
  { slug: 'handyman', name: 'Handyman', namePlural: 'Handymen', description: 'General handyman services for repairs, maintenance, and small home improvement jobs.' },
  { slug: 'cleaning', name: 'Cleaning', namePlural: 'Cleaners', description: 'Professional house cleaning, end-of-tenancy cleaning, and commercial cleaning services.' },
  { slug: 'moving-removalists', name: 'Moving & Removalists', namePlural: 'Removalists', description: 'Local and long-distance moving services, furniture removal, and packing assistance.' },
  { slug: 'landscaping-gardening', name: 'Landscaping & Gardening', namePlural: 'Landscapers', description: 'Garden design, landscaping, lawn mowing, and tree trimming services.' },
  { slug: 'painting', name: 'Painting', namePlural: 'Painters', description: 'Interior and exterior painting services for homes and businesses.' },
  { slug: 'roofing', name: 'Roofing', namePlural: 'Roofers', description: 'Roof repairs, re-roofing, spouting, and gutter services.' },
  { slug: 'flooring', name: 'Flooring', namePlural: 'Flooring Specialists', description: 'Timber, carpet, vinyl, and tile flooring installation and repairs.' },
  { slug: 'locksmith', name: 'Locksmith', namePlural: 'Locksmiths', description: 'Emergency lockout service, lock replacement, and security upgrades.' },
  { slug: 'pest-control', name: 'Pest Control', namePlural: 'Pest Controllers', description: 'Residential and commercial pest inspections, treatments, and prevention.' },
  { slug: 'rubbish-removal', name: 'Rubbish Removal', namePlural: 'Rubbish Removal Specialists', description: 'Rubbish removal, green waste, and hard rubbish collection services.' },
  { slug: 'appliance-repair', name: 'Appliance Repair', namePlural: 'Appliance Repair Technicians', description: 'Repairs for washing machines, ovens, dishwashers, fridges, and more.' },
  { slug: 'car-detailing', name: 'Car Detailing', namePlural: 'Car Detailers', description: 'Full car detailing, interior and exterior cleaning, and paint correction.' },
  { slug: 'plasterer', name: 'Plastering', namePlural: 'Plasterers', description: 'Interior plastering, stopping, finishing, and patch repairs.' },
  { slug: 'builder', name: 'Building', namePlural: 'Builders', description: 'Home renovations, extensions, decks, and small construction projects.' },
]

export interface Location {
  regionSlug: string
  citySlug: string
  cityName: string
  regionName: string
}

export const LOCATIONS: Location[] = [
  { regionSlug: 'marlborough', citySlug: 'blenheim', cityName: 'Blenheim', regionName: 'Marlborough' },
  { regionSlug: 'nelson', citySlug: 'nelson', cityName: 'Nelson', regionName: 'Nelson' },
  { regionSlug: 'wellington', citySlug: 'wellington', cityName: 'Wellington', regionName: 'Wellington' },
  { regionSlug: 'canterbury', citySlug: 'christchurch', cityName: 'Christchurch', regionName: 'Canterbury' },
  { regionSlug: 'auckland', citySlug: 'auckland', cityName: 'Auckland', regionName: 'Auckland' },
  { regionSlug: 'waikato', citySlug: 'hamilton', cityName: 'Hamilton', regionName: 'Waikato' },
  { regionSlug: 'bay-of-plenty', citySlug: 'tauranga', cityName: 'Tauranga', regionName: 'Bay of Plenty' },
  { regionSlug: 'otago', citySlug: 'dunedin', cityName: 'Dunedin', regionName: 'Otago' },
  { regionSlug: 'otago', citySlug: 'queenstown', cityName: 'Queenstown', regionName: 'Otago' },
  { regionSlug: 'manawatu-whanganui', citySlug: 'palmerston-north', cityName: 'Palmerston North', regionName: 'Manawatū-Whanganui' },
]

export const NEARBY_MESH: Record<string, string[]> = {
  'marlborough/blenheim': ['nelson/nelson'],
  'nelson/nelson': ['marlborough/blenheim'],
  'wellington/wellington': ['manawatu-whanganui/palmerston-north'],
  'manawatu-whanganui/palmerston-north': ['wellington/wellington'],
  'canterbury/christchurch': ['otago/dunedin'],
  'otago/dunedin': ['canterbury/christchurch', 'otago/queenstown'],
  'otago/queenstown': ['otago/dunedin'],
  'waikato/hamilton': ['auckland/auckland', 'bay-of-plenty/tauranga'],
  'auckland/auckland': ['waikato/hamilton'],
  'bay-of-plenty/tauranga': ['waikato/hamilton'],
}

/** Look up a service by slug */
export function getServiceBySlug(slug: string): Service | undefined {
  return SERVICES.find((s) => s.slug === slug)
}

/** Look up a location by regionSlug + citySlug */
export function getLocation(regionSlug: string, citySlug: string): Location | undefined {
  return LOCATIONS.find((l) => l.regionSlug === regionSlug && l.citySlug === citySlug)
}
