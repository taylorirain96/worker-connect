export type ServiceGroup =
  | 'Trades & Repairs'
  | 'Home Improvement'
  | 'Cleaning'
  | 'Moving & Delivery'
  | 'Outdoor & Garden'
  | 'Auto Services'
  | 'Tech Help'
  | 'Personal Services'
  | 'Business Services'
  | 'Events'
  | 'Other'

export interface ServiceDefinition {
  id: string
  label: string
  group: ServiceGroup
  description: string
  keywords: string[]
  /** Emoji icon for the UI */
  icon: string
}

export const SERVICES: ServiceDefinition[] = [
  // ── Trades & Repairs ─────────────────────────────────────────────────────
  {
    id: 'plumbing',
    label: 'Plumbing',
    group: 'Trades & Repairs',
    description: 'Pipe repairs, hot-water cylinders, drainage, and fixture installation.',
    keywords: ['plumber', 'plumbing', 'leaking pipe', 'hot water cylinder', 'drainage'],
    icon: '🔧',
  },
  {
    id: 'electrical',
    label: 'Electrical',
    group: 'Trades & Repairs',
    description: 'Wiring, switchboard upgrades, lighting, and EV charger installation.',
    keywords: ['electrician', 'electrical', 'wiring', 'lighting', 'switchboard'],
    icon: '⚡',
  },
  {
    id: 'hvac',
    label: 'Heat Pumps & HVAC',
    group: 'Trades & Repairs',
    description: 'Heat pump installation, servicing, ventilation, and air-conditioning.',
    keywords: ['heat pump', 'hvac', 'air conditioning', 'ventilation', 'heating'],
    icon: '❄️',
  },
  {
    id: 'roofing',
    label: 'Roofing',
    group: 'Trades & Repairs',
    description: 'Roof repairs, replacement, iron roofing, and gutter installation.',
    keywords: ['roofer', 'roofing', 'roof repair', 'gutters', 'iron roof'],
    icon: '🏠',
  },
  {
    id: 'locksmith',
    label: 'Locksmith',
    group: 'Trades & Repairs',
    description: 'Lock changes, key cutting, safe opening, and security upgrades.',
    keywords: ['locksmith', 'lock', 'key cutting', 'security', 'deadbolt'],
    icon: '🔑',
  },
  // ── Home Improvement ─────────────────────────────────────────────────────
  {
    id: 'carpentry',
    label: 'Carpentry',
    group: 'Home Improvement',
    description: 'Decking, framing, cabinetry, and custom woodwork.',
    keywords: ['carpenter', 'carpentry', 'decking', 'framing', 'cabinetry'],
    icon: '🪚',
  },
  {
    id: 'painting',
    label: 'Painting',
    group: 'Home Improvement',
    description: 'Interior and exterior painting, wallpaper removal, and plastering.',
    keywords: ['painter', 'painting', 'interior painting', 'exterior painting', 'wallpaper'],
    icon: '🎨',
  },
  {
    id: 'flooring',
    label: 'Flooring',
    group: 'Home Improvement',
    description: 'Hardwood, laminate, tile, and vinyl flooring installation and repair.',
    keywords: ['flooring', 'hardwood floors', 'tile', 'laminate', 'vinyl flooring'],
    icon: '🪵',
  },
  {
    id: 'handyman',
    label: 'Handyman',
    group: 'Home Improvement',
    description: 'General home repairs, assembly, maintenance, and odd jobs.',
    keywords: ['handyman', 'general repairs', 'home maintenance', 'odd jobs', 'assembly'],
    icon: '🛠️',
  },
  // ── Cleaning ─────────────────────────────────────────────────────────────
  {
    id: 'cleaning',
    label: 'Cleaning',
    group: 'Cleaning',
    description: 'House cleaning, end-of-tenancy, office cleaning, and carpet cleaning.',
    keywords: ['cleaner', 'cleaning', 'house cleaning', 'end of tenancy', 'carpet cleaning'],
    icon: '🧹',
  },
  {
    id: 'pest-control',
    label: 'Pest Control',
    group: 'Cleaning',
    description: 'Wasp, rodent, cockroach, and general pest elimination.',
    keywords: ['pest control', 'exterminator', 'wasps', 'rodents', 'cockroaches'],
    icon: '🐛',
  },
  // ── Moving & Delivery ────────────────────────────────────────────────────
  {
    id: 'moving',
    label: 'Moving & Removals',
    group: 'Moving & Delivery',
    description: 'Furniture removal, house moves, and interstate relocations.',
    keywords: ['removalist', 'moving', 'furniture removal', 'relocation', 'house move'],
    icon: '📦',
  },
  {
    id: 'junk-removal',
    label: 'Rubbish & Junk Removal',
    group: 'Moving & Delivery',
    description: 'Furniture disposal, skip-bin alternative, and property clearances.',
    keywords: ['rubbish removal', 'junk removal', 'skip bin', 'property clearance', 'disposal'],
    icon: '🗑️',
  },
  // ── Outdoor & Garden ─────────────────────────────────────────────────────
  {
    id: 'landscaping',
    label: 'Landscaping & Gardens',
    group: 'Outdoor & Garden',
    description: 'Lawn mowing, garden design, tree pruning, and irrigation.',
    keywords: ['landscaper', 'landscaping', 'lawn mowing', 'garden design', 'tree pruning'],
    icon: '🌿',
  },
]

export const SERVICE_GROUPS: ServiceGroup[] = [
  'Trades & Repairs',
  'Home Improvement',
  'Cleaning',
  'Moving & Delivery',
  'Outdoor & Garden',
  'Auto Services',
  'Tech Help',
  'Personal Services',
  'Business Services',
  'Events',
  'Other',
]

/** Look up a service by its URL slug id */
export function getService(id: string): ServiceDefinition | undefined {
  return SERVICES.find((s) => s.id === id)
}

/** Get all services belonging to a top-level group */
export function getServicesByGroup(group: ServiceGroup): ServiceDefinition[] {
  return SERVICES.filter((s) => s.group === group)
}

/** Services grouped for the hub page */
export function getServicesGrouped(): Record<ServiceGroup, ServiceDefinition[]> {
  const result = {} as Record<ServiceGroup, ServiceDefinition[]>
  for (const group of SERVICE_GROUPS) {
    const services = getServicesByGroup(group)
    if (services.length > 0) result[group] = services
  }
  return result
}
