export interface Service {
  slug: string
  name: string
  namePlural: string
  description: string
  synonyms?: string[]
}

export interface Location {
  regionSlug: string
  citySlug: string
  cityName: string
  regionName: string
}

export const SERVICES: Service[] = [
  {
    slug: 'plumbing',
    name: 'Plumbing',
    namePlural: 'Plumbers',
    description:
      'Professional plumbing services including pipe repairs, hot-water cylinders, drainage, and fixture installation across New Zealand.',
  },
  {
    slug: 'electrical',
    name: 'Electrical',
    namePlural: 'Electricians',
    description:
      'Licensed electrical services including wiring, switchboard upgrades, lighting installation, and EV charger fitting.',
  },
  {
    slug: 'heat-pumps-air-conditioning',
    name: 'Heat Pumps & Air Conditioning',
    namePlural: 'Heat Pump Installers',
    description:
      'Expert heat pump installation, servicing, and air conditioning solutions for homes and businesses throughout New Zealand.',
    synonyms: ['air conditioning', 'aircon', 'HVAC'],
  },
  {
    slug: 'handyman',
    name: 'Handyman',
    namePlural: 'Handymen',
    description:
      'General home repairs, furniture assembly, maintenance tasks, and odd jobs handled by experienced handymen.',
  },
  {
    slug: 'cleaning',
    name: 'Cleaning',
    namePlural: 'Cleaners',
    description:
      'Professional house cleaning, end-of-tenancy, office cleaning, and carpet cleaning services.',
  },
  {
    slug: 'moving-removalists',
    name: 'Moving & Removalists',
    namePlural: 'Removalists',
    description:
      'Reliable moving and removalist services for house moves, furniture removal, and interstate relocations.',
  },
  {
    slug: 'landscaping-gardening',
    name: 'Landscaping & Gardening',
    namePlural: 'Landscapers',
    description:
      'Full landscaping and gardening services including lawn mowing, garden design, tree pruning, and irrigation.',
  },
  {
    slug: 'painting',
    name: 'Painting',
    namePlural: 'Painters',
    description:
      'Interior and exterior painting services, wallpaper removal, and surface preparation by skilled painters.',
  },
  {
    slug: 'roofing',
    name: 'Roofing',
    namePlural: 'Roofers',
    description:
      'Roof repairs, replacement, iron roofing, and gutter installation by certified New Zealand roofers.',
  },
  {
    slug: 'flooring',
    name: 'Flooring',
    namePlural: 'Flooring Specialists',
    description:
      'Hardwood, laminate, tile, and vinyl flooring installation and repair by flooring specialists.',
  },
  {
    slug: 'locksmith',
    name: 'Locksmith',
    namePlural: 'Locksmiths',
    description:
      'Lock changes, key cutting, safe opening, and security upgrades by professional locksmiths.',
  },
  {
    slug: 'pest-control',
    name: 'Pest Control',
    namePlural: 'Pest Controllers',
    description:
      'Wasp, rodent, cockroach, and general pest elimination services for homes and businesses.',
  },
  {
    slug: 'rubbish-removal',
    name: 'Rubbish Removal',
    namePlural: 'Rubbish Removal Specialists',
    description:
      'Fast and affordable rubbish removal for homes and businesses — a convenient alternative to skip bins.',
  },
  {
    slug: 'appliance-repair',
    name: 'Appliance Repair',
    namePlural: 'Appliance Repair Technicians',
    description:
      'Washing machines, dryers, dishwashers, ovens, and other household appliances repaired quickly.',
  },
  {
    slug: 'car-detailing',
    name: 'Car Detailing',
    namePlural: 'Car Detailers',
    description:
      'Professional car detailing, interior cleaning, paint correction, and protective coatings.',
  },
  {
    slug: 'plasterer',
    name: 'Plastering',
    namePlural: 'Plasterers',
    description:
      'Interior plastering, gib stopping, plasterboard installation, and decorative finishes.',
  },
  {
    slug: 'builder',
    name: 'Building',
    namePlural: 'Builders',
    description:
      'Residential and commercial building services including renovations, extensions, and new builds.',
  },
]

export const LOCATIONS: Location[] = [
  {
    regionSlug: 'marlborough',
    citySlug: 'blenheim',
    cityName: 'Blenheim',
    regionName: 'Marlborough',
  },
  {
    regionSlug: 'nelson',
    citySlug: 'nelson',
    cityName: 'Nelson',
    regionName: 'Nelson',
  },
  {
    regionSlug: 'wellington',
    citySlug: 'wellington',
    cityName: 'Wellington',
    regionName: 'Wellington',
  },
  {
    regionSlug: 'canterbury',
    citySlug: 'christchurch',
    cityName: 'Christchurch',
    regionName: 'Canterbury',
  },
  {
    regionSlug: 'auckland',
    citySlug: 'auckland',
    cityName: 'Auckland',
    regionName: 'Auckland',
  },
  {
    regionSlug: 'waikato',
    citySlug: 'hamilton',
    cityName: 'Hamilton',
    regionName: 'Waikato',
  },
  {
    regionSlug: 'bay-of-plenty',
    citySlug: 'tauranga',
    cityName: 'Tauranga',
    regionName: 'Bay of Plenty',
  },
  {
    regionSlug: 'otago',
    citySlug: 'dunedin',
    cityName: 'Dunedin',
    regionName: 'Otago',
  },
  {
    regionSlug: 'otago',
    citySlug: 'queenstown',
    cityName: 'Queenstown',
    regionName: 'Otago',
  },
  {
    regionSlug: 'manawatu-whanganui',
    citySlug: 'palmerston-north',
    cityName: 'Palmerston North',
    regionName: 'Manawatū-Whanganui',
  },
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

/** Find a service by slug */
export function getServiceBySlug(slug: string): Service | undefined {
  return SERVICES.find((s) => s.slug === slug)
}

/** Find a location by regionSlug + citySlug */
export function getLocation(regionSlug: string, citySlug: string): Location | undefined {
  return LOCATIONS.find((l) => l.regionSlug === regionSlug && l.citySlug === citySlug)
}

/** Get nearby locations for a given regionSlug/citySlug key */
export function getNearbyLocations(regionSlug: string, citySlug: string): Location[] {
  const key = `${regionSlug}/${citySlug}`
  const nearbySlugs = NEARBY_MESH[key] ?? []
  return nearbySlugs
    .map((s) => {
      const [r, c] = s.split('/')
      return getLocation(r, c)
    })
    .filter((l): l is Location => l !== undefined)
}
