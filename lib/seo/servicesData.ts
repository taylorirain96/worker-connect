export interface Service {
  slug: string
  name: string
  namePlural: string
  description: string
  synonyms?: string[]
}

export interface ServiceFAQ {
  question: string
  answer: string
}

export interface ServiceDetails {
  priceFrom: number
  priceTo: number
  priceUnit: string
  commonJobs: string[]
  whyHire: string[]
  faqs: ServiceFAQ[]
  trustSignals?: string[]
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
  {
    slug: 'solar-installation',
    name: 'Solar Installation',
    namePlural: 'Solar Installers',
    description:
      'Solar panel supply and installation for homes and businesses across New Zealand, including grid-tied and off-grid systems.',
  },
  {
    slug: 'fencing',
    name: 'Fencing',
    namePlural: 'Fencing Contractors',
    description:
      'Timber, steel, and aluminium fencing installation and repairs for residential and commercial properties.',
  },
  {
    slug: 'waterproofing',
    name: 'Waterproofing',
    namePlural: 'Waterproofing Specialists',
    description:
      'Membrane waterproofing, deck coatings, basement tanking, and wet-area waterproofing for NZ homes and buildings.',
  },
  {
    slug: 'tiling',
    name: 'Tiling',
    namePlural: 'Tilers',
    description:
      'Professional floor and wall tiling for bathrooms, kitchens, and outdoor areas across New Zealand.',
  },
  {
    slug: 'concreting',
    name: 'Concreting',
    namePlural: 'Concreters',
    description:
      'Driveways, paths, slabs, and decorative concrete work by experienced NZ concreters.',
  },
  {
    slug: 'insulation',
    name: 'Insulation',
    namePlural: 'Insulation Installers',
    description:
      'Ceiling, underfloor, and wall insulation installation to meet NZ Healthy Homes standards and improve energy efficiency.',
  },
  {
    slug: 'asbestos-removal',
    name: 'Asbestos Removal',
    namePlural: 'Asbestos Removal Specialists',
    description:
      'Licensed asbestos identification, testing, and safe removal in compliance with NZ WorkSafe regulations.',
  },
  {
    slug: 'carpet-cleaning',
    name: 'Carpet Cleaning',
    namePlural: 'Carpet Cleaners',
    description:
      'Professional steam and dry carpet cleaning for homes and offices across New Zealand — removes stains, allergens, and odours.',
  },
  {
    slug: 'window-cleaning',
    name: 'Window Cleaning',
    namePlural: 'Window Cleaners',
    description:
      'Residential and commercial window cleaning services — streak-free results for single-storey and multi-storey properties.',
  },
  {
    slug: 'pool-maintenance',
    name: 'Pool Maintenance',
    namePlural: 'Pool Maintenance Specialists',
    description:
      'Regular pool cleaning, chemical balancing, filter servicing, and repairs for residential pools across New Zealand.',
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
  {
    regionSlug: 'hawkes-bay',
    citySlug: 'napier',
    cityName: 'Napier',
    regionName: "Hawke's Bay",
  },
  {
    regionSlug: 'hawkes-bay',
    citySlug: 'hastings',
    cityName: 'Hastings',
    regionName: "Hawke's Bay",
  },
  {
    regionSlug: 'bay-of-plenty',
    citySlug: 'rotorua',
    cityName: 'Rotorua',
    regionName: 'Bay of Plenty',
  },
  {
    regionSlug: 'taranaki',
    citySlug: 'new-plymouth',
    cityName: 'New Plymouth',
    regionName: 'Taranaki',
  },
  {
    regionSlug: 'northland',
    citySlug: 'whangarei',
    cityName: 'Whangārei',
    regionName: 'Northland',
  },
  {
    regionSlug: 'southland',
    citySlug: 'invercargill',
    cityName: 'Invercargill',
    regionName: 'Southland',
  },
  {
    regionSlug: 'wellington',
    citySlug: 'lower-hutt',
    cityName: 'Lower Hutt',
    regionName: 'Wellington',
  },
  {
    regionSlug: 'gisborne',
    citySlug: 'gisborne',
    cityName: 'Gisborne',
    regionName: 'Gisborne',
  },
  {
    regionSlug: 'canterbury',
    citySlug: 'timaru',
    cityName: 'Timaru',
    regionName: 'Canterbury',
  },
  {
    regionSlug: 'manawatu-whanganui',
    citySlug: 'whanganui',
    cityName: 'Whanganui',
    regionName: 'Manawatū-Whanganui',
  },
  {
    regionSlug: 'wellington',
    citySlug: 'upper-hutt',
    cityName: 'Upper Hutt',
    regionName: 'Wellington',
  },
  {
    regionSlug: 'wellington',
    citySlug: 'porirua',
    cityName: 'Porirua',
    regionName: 'Wellington',
  },
]

export const NEARBY_MESH: Record<string, string[]> = {
  'marlborough/blenheim': ['nelson/nelson'],
  'nelson/nelson': ['marlborough/blenheim'],
  'wellington/wellington': ['manawatu-whanganui/palmerston-north', 'wellington/lower-hutt'],
  'manawatu-whanganui/palmerston-north': ['wellington/wellington', 'taranaki/new-plymouth'],
  'canterbury/christchurch': ['otago/dunedin'],
  'otago/dunedin': ['canterbury/christchurch', 'otago/queenstown', 'southland/invercargill'],
  'otago/queenstown': ['otago/dunedin'],
  'waikato/hamilton': ['auckland/auckland', 'bay-of-plenty/tauranga', 'bay-of-plenty/rotorua'],
  'auckland/auckland': ['waikato/hamilton', 'northland/whangarei'],
  'bay-of-plenty/tauranga': ['waikato/hamilton', 'bay-of-plenty/rotorua'],
  'hawkes-bay/napier': ['hawkes-bay/hastings'],
  'hawkes-bay/hastings': ['hawkes-bay/napier'],
  'bay-of-plenty/rotorua': ['bay-of-plenty/tauranga', 'waikato/hamilton'],
  'taranaki/new-plymouth': ['manawatu-whanganui/palmerston-north'],
  'northland/whangarei': ['auckland/auckland'],
  'southland/invercargill': ['otago/dunedin'],
  'wellington/lower-hutt': ['wellington/wellington'],
  'gisborne/gisborne': [],
  'canterbury/timaru': ['canterbury/christchurch', 'otago/dunedin'],
  'manawatu-whanganui/whanganui': ['manawatu-whanganui/palmerston-north'],
  'wellington/upper-hutt': ['wellington/wellington', 'wellington/lower-hutt', 'wellington/porirua'],
  'wellington/porirua': ['wellington/wellington', 'wellington/upper-hutt'],
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

export const SERVICE_DETAILS: Record<string, ServiceDetails> = {
  plumbing: {
    priceFrom: 90,
    priceTo: 250,
    priceUnit: 'per hour',
    commonJobs: [
      'Leaking tap repair',
      'Blocked drain clearing',
      'Hot-water cylinder replacement',
      'Toilet installation',
      'Pipe burst repair',
      'Bathroom renovation plumbing',
    ],
    whyHire: [
      'Licensed plumbers ensure work meets NZ building code',
      'Prevent water damage with correct repairs',
      'Warranty on parts and labour',
      'Emergency call-outs available',
    ],
    faqs: [
      {
        question: 'How much does a plumber cost in New Zealand?',
        answer:
          'Most NZ plumbers charge between $90–$250 per hour including GST. Call-out fees typically range from $80–$150. Fixed-price quotes are available for larger jobs like hot-water cylinder replacements.',
      },
      {
        question: 'Do plumbers need to be licensed in NZ?',
        answer:
          'Yes. In New Zealand, most plumbing work must be carried out by or supervised by a registered and licensed plumber under the Plumbers, Gasfitters and Drainlayers Act 2006.',
      },
      {
        question: 'How long does it take to fix a leaking pipe?',
        answer:
          'A straightforward leaking pipe repair typically takes 1–2 hours. Complex burst pipes or wall-concealed leaks may take half a day or longer.',
      },
      {
        question: 'Can I get a same-day plumber?',
        answer:
          'Many QuickTrade plumbers offer same-day or emergency appointments. Post your job and check each professional\'s availability in their profile.',
      },
    ],
    trustSignals: [
      'Licensed & registered professionals',
      'Background-checked workers',
      'Real verified reviews',
      'Secure payments via QuickTrade',
    ],
  },
  electrical: {
    priceFrom: 95,
    priceTo: 280,
    priceUnit: 'per hour',
    commonJobs: [
      'Switchboard upgrade',
      'New power outlet installation',
      'LED lighting installation',
      'EV charger fitting',
      'Smoke alarm installation',
      'Fault finding & repairs',
    ],
    whyHire: [
      'Only licensed electricians can legally do mains wiring in NZ',
      'Electrical safety certificates provided',
      'Reduces risk of electrical fires and electrocution',
      'Work inspected and signed off to NZ standards',
    ],
    faqs: [
      {
        question: 'How much does an electrician cost in NZ?',
        answer:
          'NZ electricians typically charge $95–$280 per hour. Call-out fees are usually $80–$150. Simple jobs like replacing a light switch may be quoted as a fixed price.',
      },
      {
        question: 'Do I need a licensed electrician in New Zealand?',
        answer:
          'Yes. All electrical work connected to the mains supply must be carried out by a registered electrician under the Electricity Act 1992. DIY electrical work is illegal and unsafe.',
      },
      {
        question: 'How long does a switchboard upgrade take?',
        answer:
          'A full switchboard upgrade typically takes 4–8 hours depending on the size of your home and complexity of existing wiring.',
      },
      {
        question: 'Can an electrician install an EV charger at home?',
        answer:
          'Yes. A licensed electrician can install a dedicated EV charging circuit and wall-box. This usually takes 2–4 hours and requires a new circuit from your switchboard.',
      },
    ],
    trustSignals: [
      'Licensed & registered electricians',
      'ESC certificates provided',
      'Insured professionals',
      'Verified customer reviews',
    ],
  },
  'heat-pumps-air-conditioning': {
    priceFrom: 1200,
    priceTo: 4500,
    priceUnit: 'per unit installed',
    commonJobs: [
      'Heat pump installation',
      'Air conditioning installation',
      'Annual heat pump service',
      'Filter cleaning & maintenance',
      'Fault diagnosis & repair',
      'Multi-head heat pump systems',
    ],
    whyHire: [
      'Correct sizing ensures maximum energy efficiency',
      'Professional installation protects your warranty',
      'Compliance with NZ building regulations',
      'Ongoing servicing extends equipment lifespan',
    ],
    faqs: [
      {
        question: 'How much does a heat pump cost to install in NZ?',
        answer:
          'A standard single-room heat pump installation in NZ costs $1,200–$4,500 fully installed. Price varies by brand, capacity, and installation complexity.',
      },
      {
        question: 'How often should a heat pump be serviced?',
        answer:
          'Heat pumps should be serviced at least once a year. Regular servicing (filter cleaning, coil inspection, refrigerant check) keeps efficiency high and prevents breakdowns.',
      },
      {
        question: 'What size heat pump do I need?',
        answer:
          'Room size, insulation, and climate all affect sizing. A qualified installer will measure your space and recommend the correct kW capacity — typically 2.5 kW for a small bedroom up to 7+ kW for an open-plan living area.',
      },
      {
        question: 'Can I get a Warmer Kiwi Homes subsidy for my heat pump?',
        answer:
          'Yes. Eligible homeowners may receive a government subsidy of up to 80% off the cost of a heat pump through the Warmer Kiwi Homes programme. Ask your installer about eligibility.',
      },
    ],
    trustSignals: [
      'Authorised brand installers',
      'Manufacturer warranty preserved',
      'Certified refrigerant handling',
      'Energy efficiency advice included',
    ],
  },
  handyman: {
    priceFrom: 60,
    priceTo: 120,
    priceUnit: 'per hour',
    commonJobs: [
      'Furniture assembly',
      'TV wall mounting',
      'Door & window repairs',
      'Fence repairs',
      'Gutter cleaning',
      'Shelf installation',
    ],
    whyHire: [
      'Save time on a long list of small jobs',
      'Experienced with a wide range of tasks',
      'Own tools and materials',
      'Flexible scheduling including weekends',
    ],
    faqs: [
      {
        question: 'How much does a handyman cost in NZ?',
        answer:
          'Handymen in New Zealand typically charge $60–$120 per hour. Many offer a half-day or full-day rate that works out cheaper for multiple jobs.',
      },
      {
        question: 'What jobs can a handyman do?',
        answer:
          'Handymen handle a wide range of tasks including furniture assembly, TV mounting, minor repairs, painting touch-ups, gutter clearing, and general maintenance — anything that doesn\'t require a licensed trade.',
      },
      {
        question: 'Do handymen need to be licensed?',
        answer:
          'For general maintenance tasks, no license is required. However, electrical and plumbing work must be carried out by licensed tradespeople regardless of scope.',
      },
      {
        question: 'How do I prepare for a handyman visit?',
        answer:
          'Write a list of all the jobs you need done, gather any materials or fixtures you\'ve purchased, and clear the work areas. The more prepared you are, the more a handyman can accomplish in a single visit.',
      },
    ],
    trustSignals: [
      'Background-checked professionals',
      'Fully insured',
      'Punctual & reliable',
      'Real customer reviews',
    ],
  },
  cleaning: {
    priceFrom: 35,
    priceTo: 65,
    priceUnit: 'per hour',
    commonJobs: [
      'Regular house cleaning',
      'End-of-tenancy clean',
      'Spring cleaning',
      'Office cleaning',
      'Carpet steam cleaning',
      'Window cleaning',
    ],
    whyHire: [
      'Professional-grade equipment and products',
      'Consistent results every visit',
      'Fully insured — protected against accidental damage',
      'Flexible scheduling and frequency',
    ],
    faqs: [
      {
        question: 'How much does house cleaning cost in NZ?',
        answer:
          'House cleaning in New Zealand costs $35–$65 per hour. A standard 3-bedroom home takes 3–4 hours for a regular clean, or 5–7 hours for a deep or end-of-tenancy clean.',
      },
      {
        question: 'What is included in an end-of-tenancy clean?',
        answer:
          'An end-of-tenancy clean covers all rooms top-to-bottom: oven and appliances, inside cupboards, skirting boards, windows, bathrooms, and carpets. It\'s designed to meet landlord or property management standards.',
      },
      {
        question: 'Do I need to provide cleaning products?',
        answer:
          'Most professional cleaners bring their own commercial-grade products and equipment. Let them know if you prefer eco-friendly or fragrance-free products when booking.',
      },
      {
        question: 'How often should I have my home professionally cleaned?',
        answer:
          'For regular maintenance, fortnightly or monthly cleans work well for most households. Busy families or those with pets often opt for weekly visits.',
      },
    ],
    trustSignals: [
      'Fully insured cleaners',
      'Background-checked staff',
      'Satisfaction guarantee',
      'Consistent team each visit',
    ],
  },
  painting: {
    priceFrom: 35,
    priceTo: 75,
    priceUnit: 'per hour',
    commonJobs: [
      'Interior house painting',
      'Exterior house painting',
      'Ceiling painting',
      'Feature wall painting',
      'Wallpaper removal & prep',
      'Fence & deck staining',
    ],
    whyHire: [
      'Professional finish without drips or roller marks',
      'Correct surface preparation extends paint life',
      'Access to trade-quality paints at better prices',
      'Work completed faster than DIY',
    ],
    faqs: [
      {
        question: 'How much does house painting cost in NZ?',
        answer:
          'Painters in NZ charge $35–$75 per hour. Interior painting for an average 3-bedroom home costs $2,000–$5,000+ depending on condition, prep work, and number of coats.',
      },
      {
        question: 'How long does exterior painting last?',
        answer:
          'A professionally applied exterior paint job typically lasts 8–12 years with quality paint. UV exposure, climate, and surface condition all affect longevity.',
      },
      {
        question: 'What paint preparation is required?',
        answer:
          'Good preparation is key: washing, sanding, filling holes, applying primer, and masking. Professional painters allocate significant time to prep, which is why results last longer.',
      },
      {
        question: 'Can painters match existing paint colours?',
        answer:
          'Yes. Professional painters can colour-match existing paint using spectrophotometers at paint stores, or identify paint codes from product labels.',
      },
    ],
    trustSignals: [
      'Trade-qualified painters',
      'Quality paint brands used',
      'Fixed-price quotes available',
      'Insured & reliable',
    ],
  },
  roofing: {
    priceFrom: 500,
    priceTo: 3000,
    priceUnit: 'per job',
    commonJobs: [
      'Roof leak repairs',
      'Iron roof replacement',
      'Tile roof repair',
      'Gutter replacement',
      'Fascia & soffit repairs',
      'Roof cleaning & moss treatment',
    ],
    whyHire: [
      'Working at height is dangerous — professionals have the right safety gear',
      'Correct repairs prevent costly water damage to ceilings and walls',
      'Knowledge of NZ building code for roofing',
      'Manufacturer warranties on new roofing materials',
    ],
    faqs: [
      {
        question: 'How much does a roof repair cost in NZ?',
        answer:
          'Minor roof repairs in NZ typically cost $500–$1,500. A full roof replacement for an average home ranges from $15,000–$40,000+ depending on materials and size.',
      },
      {
        question: 'How do I know if my roof needs replacing?',
        answer:
          'Signs include: persistent leaks after repairs, multiple missing or cracked tiles, significant rust on iron roofing, sagging sections, or a roof over 25–30 years old.',
      },
      {
        question: 'What is the best roofing material in NZ?',
        answer:
          'Long-run steel (Colorsteel/Zincalume) is the most popular in NZ for its durability and cost. Concrete tiles, clay tiles, and butyl rubber are also used. Each has different cost and lifespan trade-offs.',
      },
      {
        question: 'Can I repair my roof myself in NZ?',
        answer:
          'Minor gutter cleaning is safe for competent DIYers, but any structural roofing work should be done by professionals for safety and insurance purposes. Falls from roofs are a leading cause of serious injuries in NZ.',
      },
    ],
    trustSignals: [
      'Height safety certified',
      'Licensed building practitioners',
      'Insurance-approved repairs',
      'Free roof inspections available',
    ],
  },
  flooring: {
    priceFrom: 40,
    priceTo: 120,
    priceUnit: 'per m²',
    commonJobs: [
      'Hardwood floor installation',
      'Laminate flooring laying',
      'Vinyl plank installation',
      'Tile floor installation',
      'Floor sanding & polishing',
      'Carpet installation',
    ],
    whyHire: [
      'Correct subfloor preparation prevents future lifting and squeaks',
      'Professional tools achieve precise cuts and tight joins',
      'Moisture and expansion gaps handled correctly',
      'Faster installation than DIY',
    ],
    faqs: [
      {
        question: 'How much does new flooring cost in NZ?',
        answer:
          'Flooring installation in NZ typically costs $40–$120 per m² for supply and install. Hardwood and tile are at the higher end; laminate and vinyl plank are more affordable.',
      },
      {
        question: 'What is the most popular flooring in NZ homes?',
        answer:
          'Vinyl plank (LVP) and hybrid flooring are very popular for their durability, waterproofing, and realistic wood look. Hardwood is favoured in premium homes, and carpet remains popular in bedrooms.',
      },
      {
        question: 'How long does floor installation take?',
        answer:
          'A single room can typically be completed in one day. A whole house may take 3–5 days depending on floor area, subfloor condition, and complexity.',
      },
      {
        question: 'Do I need to move furniture before the flooring team arrives?',
        answer:
          'Yes, furniture generally needs to be cleared from the area. Some flooring companies include furniture removal in their quote — check when booking.',
      },
    ],
    trustSignals: [
      'Trade-qualified installers',
      'Manufacturer warranties honoured',
      'Subfloor assessment included',
      'Clean, tidy workmanship',
    ],
  },
  locksmith: {
    priceFrom: 80,
    priceTo: 200,
    priceUnit: 'per job',
    commonJobs: [
      'Lockout & door opening',
      'Lock change or rekey',
      'Deadbolt installation',
      'Safe opening',
      'Key cutting & duplication',
      'Security assessment',
    ],
    whyHire: [
      'Fast response for lockouts — often within 30–60 minutes',
      'No damage to doors when professionally opened',
      'Expert advice on home security upgrades',
      'Key control systems to restrict unauthorised copying',
    ],
    faqs: [
      {
        question: 'How much does a locksmith cost in NZ?',
        answer:
          'Standard locksmith jobs in NZ cost $80–$200. Emergency lockout call-outs typically have a higher fee of $150–$300+ depending on time of day and location.',
      },
      {
        question: 'How quickly can a locksmith get to me?',
        answer:
          'Most mobile locksmiths can respond within 30–90 minutes in urban areas. Response times may be longer in rural regions.',
      },
      {
        question: 'What should I do if I\'m locked out of my house?',
        answer:
          'Call a local QuickTrade locksmith — do not attempt to force entry as this can damage doors and frames. Have proof of residence ready (such as ID showing your address) when the locksmith arrives.',
      },
      {
        question: 'Can a locksmith rekey my locks after moving into a new home?',
        answer:
          'Yes, rekeying is a cost-effective option that changes the lock mechanism so old keys no longer work. It\'s cheaper than full lock replacement and is recommended when moving into a new property.',
      },
    ],
    trustSignals: [
      'Licensed & insured locksmiths',
      'Police-vetted professionals',
      'No call-out damage guarantee',
      '24/7 emergency availability',
    ],
  },
  'pest-control': {
    priceFrom: 150,
    priceTo: 450,
    priceUnit: 'per treatment',
    commonJobs: [
      'Wasp nest removal',
      'Rodent (rat & mouse) control',
      'Cockroach treatment',
      'Flea treatment',
      'Spider control',
      'Ant treatment',
    ],
    whyHire: [
      'Commercial-grade treatments not available to the public',
      'Correct identification of pest species ensures effective treatment',
      'Safe application around children and pets',
      'Follow-up visits to confirm eradication',
    ],
    faqs: [
      {
        question: 'How much does pest control cost in NZ?',
        answer:
          'Pest control in NZ typically costs $150–$450 per treatment depending on pest type, property size, and infestation severity. Annual maintenance contracts are available at a discount.',
      },
      {
        question: 'Is pest control safe for pets and children?',
        answer:
          'Professional pest controllers use products registered for residential use and provide re-entry times. Always follow the technician\'s advice about keeping pets and children out of treated areas until dry.',
      },
      {
        question: 'How many treatments are needed to get rid of rats?',
        answer:
          'Rodent control typically requires 2–3 visits over 4–6 weeks: initial bait station installation, follow-up inspection, and a final check. Ongoing prevention is also recommended.',
      },
      {
        question: 'What time of year are wasps worst in NZ?',
        answer:
          'Wasp activity peaks from late January to April in NZ as nests reach maximum size. Nests in roof spaces or walls pose significant sting risk and should be treated professionally.',
      },
    ],
    trustSignals: [
      'EPA-registered products used',
      'Qualified pest technicians',
      'Child & pet safe protocols',
      'Eradication guarantee',
    ],
  },
  'rubbish-removal': {
    priceFrom: 150,
    priceTo: 600,
    priceUnit: 'per load',
    commonJobs: [
      'General household rubbish removal',
      'Garden waste removal',
      'Furniture & white goods disposal',
      'Construction debris removal',
      'End-of-tenancy cleanout',
      'Hoarder house clearance',
    ],
    whyHire: [
      'No need to hire a skip bin or make multiple tip runs',
      'Heavy items carried out of your home',
      'Responsible recycling and disposal',
      'Same-day and next-day availability',
    ],
    faqs: [
      {
        question: 'How much does rubbish removal cost in NZ?',
        answer:
          'Rubbish removal in NZ costs $150–$600 per load depending on volume and type of waste. A ute-load starts around $150; a full trailer or truck load may be $400–$600+.',
      },
      {
        question: 'Can rubbish removal companies take old appliances?',
        answer:
          'Yes. Most rubbish removal services can take white goods such as fridges, washing machines, and ovens. Some items like fridges with refrigerant may incur a small additional disposal fee.',
      },
      {
        question: 'Is rubbish removal cheaper than a skip bin?',
        answer:
          'For small to medium volumes, rubbish removal is often more cost-effective and convenient than a skip bin. You don\'t need to load the skip yourself and there are no permits required for kerbside placement.',
      },
      {
        question: 'What items can\'t be removed?',
        answer:
          'Hazardous materials such as asbestos, chemicals, and paint require specialist disposal and cannot be taken by general rubbish removal services. Ask your provider about restrictions when booking.',
      },
    ],
    trustSignals: [
      'Licensed waste carriers',
      'Responsible recycling practices',
      'Insured & covered',
      'On-time service guaranteed',
    ],
  },
  'appliance-repair': {
    priceFrom: 80,
    priceTo: 200,
    priceUnit: 'per hour',
    commonJobs: [
      'Washing machine repair',
      'Dryer repair',
      'Dishwasher repair',
      'Oven & stove repair',
      'Refrigerator repair',
      'Microwave repair',
    ],
    whyHire: [
      'Repairing is often cheaper than replacing',
      'Qualified technicians carry common spare parts',
      'Diagnosis included in service fee',
      'Warranty on repaired components',
    ],
    faqs: [
      {
        question: 'Is it worth repairing a washing machine in NZ?',
        answer:
          'As a rule of thumb, repair is worthwhile if the cost is less than 50% of a new appliance. A technician can diagnose the fault and give you a quote so you can make an informed decision.',
      },
      {
        question: 'How much does appliance repair cost in NZ?',
        answer:
          'Appliance repair in NZ typically costs $80–$200 per hour plus parts. Most call-outs include a diagnostic fee of $80–$130 which is often credited toward the repair cost.',
      },
      {
        question: 'How long does appliance repair take?',
        answer:
          'Many common repairs are completed on the spot if the technician has the correct part. More complex repairs or parts sourcing may require a return visit.',
      },
      {
        question: 'My dishwasher isn\'t draining — can it be repaired?',
        answer:
          'Yes. Drainage issues are often caused by a blocked filter, pump fault, or kinked drain hose — all repairable. A technician will diagnose the specific cause during the inspection.',
      },
    ],
    trustSignals: [
      'Manufacturer-trained technicians',
      'Genuine spare parts used',
      'Repair warranty provided',
      'No fix, no fee available',
    ],
  },
  'car-detailing': {
    priceFrom: 120,
    priceTo: 500,
    priceUnit: 'per vehicle',
    commonJobs: [
      'Full interior detail',
      'Exterior wash & polish',
      'Paint correction & compound',
      'Ceramic coating application',
      'Engine bay cleaning',
      'Upholstery steam cleaning',
    ],
    whyHire: [
      'Professional-grade products protect your vehicle\'s finish',
      'Paint correction removes swirl marks and scratches',
      'Ceramic coatings provide long-term protection',
      'Faster and more thorough than DIY',
    ],
    faqs: [
      {
        question: 'How much does car detailing cost in NZ?',
        answer:
          'A basic exterior wash and vacuum starts around $120. A full interior and exterior detail for a standard car costs $250–$400. Premium services like paint correction and ceramic coating run $500–$1,500+.',
      },
      {
        question: 'How often should I get my car detailed?',
        answer:
          'For paint protection, a full detail every 3–6 months is ideal. Ceramic-coated vehicles may only need a maintenance wash and inspection once or twice a year.',
      },
      {
        question: 'What is paint correction?',
        answer:
          'Paint correction uses machine polishers and compounds to remove surface scratches, swirl marks, and oxidation from the clear coat, restoring a like-new finish.',
      },
      {
        question: 'How long does a full car detail take?',
        answer:
          'A thorough full detail takes 4–8 hours depending on vehicle size, condition, and services included. Book in advance as detailed jobs require a full day.',
      },
    ],
    trustSignals: [
      'Professional-grade detailing products',
      'Fully insured',
      'Before & after photos provided',
      'Mobile detailing available',
    ],
  },
  plasterer: {
    priceFrom: 50,
    priceTo: 100,
    priceUnit: 'per hour',
    commonJobs: [
      'Gib stopping & finishing',
      'Plasterboard installation',
      'Crack repair',
      'Ceiling repair',
      'Texture matching',
      'Renovation plastering',
    ],
    whyHire: [
      'Invisible joins and flat surfaces require skill and experience',
      'Correct compounds and application prevent future cracking',
      'Fast drying techniques minimise disruption',
      'Ready-to-paint finish included',
    ],
    faqs: [
      {
        question: 'How much does a plasterer cost in NZ?',
        answer:
          'Plasterers in NZ typically charge $50–$100 per hour. Gib stopping for a new room may be quoted at a fixed m² rate of $25–$45 per m².',
      },
      {
        question: 'What is gib stopping?',
        answer:
          'Gib stopping (also called drywall finishing) is the process of filling and finishing the joins between plasterboard sheets so the walls appear seamless. Multiple coats are applied and sanded between each.',
      },
      {
        question: 'How long does plastering take to dry?',
        answer:
          'Each coat of stopping compound needs 24 hours to dry before sanding and applying the next coat. A complete room with 3 coats takes 3–5 days before it\'s ready to paint.',
      },
      {
        question: 'Can small cracks in walls be repaired without replastering?',
        answer:
          'Yes. Hairline cracks and small holes can often be filled with setting compound and sanded smooth. Larger cracks or areas with movement may require mesh tape and multiple coats.',
      },
    ],
    trustSignals: [
      'Level 5 finish available',
      'Dust-minimising techniques',
      'Trade-qualified plasterers',
      'Clean & tidy worksite',
    ],
  },
  builder: {
    priceFrom: 80,
    priceTo: 160,
    priceUnit: 'per hour',
    commonJobs: [
      'Home renovation',
      'House extension',
      'Deck construction',
      'Kitchen remodel',
      'Bathroom renovation',
      'New shed or outbuilding',
    ],
    whyHire: [
      'Licensed Building Practitioners (LBPs) for code-compliant work',
      'Building consent management and council liaison',
      'Project management of sub-trades',
      'Quality workmanship backed by NZCB guarantees',
    ],
    faqs: [
      {
        question: 'Do I need a building consent for renovations in NZ?',
        answer:
          'Most structural work, new rooms, and significant alterations require a building consent from your local council. Minor work like replacing a deck less than 1.5m above ground may be exempt — your builder can advise.',
      },
      {
        question: 'How much does a home extension cost in NZ?',
        answer:
          'Home extensions in NZ typically cost $2,500–$4,500+ per m² for a basic addition, including materials and labour. Kitchen and bathroom extensions cost more due to services.',
      },
      {
        question: 'What is a Licensed Building Practitioner (LBP)?',
        answer:
          'An LBP is a builder licensed by the Ministry of Business, Innovation and Employment (MBIE) to carry out or supervise restricted building work (RBW) in NZ. Always ask to see an LBP licence number.',
      },
      {
        question: 'How long does a full house renovation take?',
        answer:
          'A whole-house renovation typically takes 3–12 months depending on scope, council processes, and availability of materials and sub-trades.',
      },
    ],
    trustSignals: [
      'Licensed Building Practitioners (LBPs)',
      'NZCB members available',
      'Full project insurance',
      'Building consent expertise',
    ],
  },
  'moving-removalists': {
    priceFrom: 100,
    priceTo: 180,
    priceUnit: 'per hour (2 men + truck)',
    commonJobs: [
      'House move',
      'Apartment relocation',
      'Office move',
      'Furniture delivery',
      'Storage solutions',
      'Piano & heavy item moving',
    ],
    whyHire: [
      'Professional movers prevent damage to furniture and property',
      'Correct equipment for stairs, lifts, and tight spaces',
      'Transit insurance protects your belongings',
      'Faster than DIY — less time in your new home',
    ],
    faqs: [
      {
        question: 'How much does a removalist cost in NZ?',
        answer:
          'Most removalist companies charge $100–$180 per hour for a 2-person team with a truck. A typical 3-bedroom house move takes 4–8 hours.',
      },
      {
        question: 'What should I do to prepare for moving day?',
        answer:
          'Pack boxes in advance, label them clearly by room, disassemble large furniture, and have essential items in a separate bag. Ensure clear access at both addresses.',
      },
      {
        question: 'Are my belongings insured during the move?',
        answer:
          'Many removalist companies include basic transit insurance. Check the level of cover and consider additional insurance for high-value items. Ask for a copy of the insurance certificate.',
      },
      {
        question: 'Can removalists move a piano?',
        answer:
          'Yes, but piano moving requires specialist equipment and experience. Always confirm when booking that the company has piano-moving capability and ensure it\'s covered by their insurance.',
      },
    ],
    trustSignals: [
      'Transit insurance included',
      'Professional-grade packing materials',
      'Experienced in pianos & antiques',
      'On-time guarantee',
    ],
  },
  'landscaping-gardening': {
    priceFrom: 45,
    priceTo: 90,
    priceUnit: 'per hour',
    commonJobs: [
      'Lawn mowing & edging',
      'Garden design & planting',
      'Tree & hedge trimming',
      'Irrigation installation',
      'Retaining wall construction',
      'Section clearing',
    ],
    whyHire: [
      'Professional tools and ride-on mowers for large sections',
      'Correct pruning techniques maintain plant health',
      'Irrigation expertise reduces water bills',
      'Design skills transform outdoor spaces',
    ],
    faqs: [
      {
        question: 'How much does lawn mowing cost in NZ?',
        answer:
          'Lawn mowing in NZ typically costs $45–$90 per hour or $50–$150 per visit for a standard section. Regular maintenance contracts are often discounted.',
      },
      {
        question: 'What is included in a garden maintenance visit?',
        answer:
          'A standard maintenance visit usually includes lawn mowing, edging, weeding, blowing paths, and tidying garden beds. Larger tasks like hedge trimming or tree work are additional.',
      },
      {
        question: 'Do I need council consent for a retaining wall?',
        answer:
          'In NZ, retaining walls under 1.5m high generally don\'t require consent, but this depends on proximity to boundaries and surcharges. A qualified landscaper can advise on compliance.',
      },
      {
        question: 'When is the best time to plant in New Zealand?',
        answer:
          'Spring (September–November) is ideal for most planting as soil temperatures rise. Autumn (March–May) is great for establishing lawns and deciduous trees before winter.',
      },
    ],
    trustSignals: [
      'Fully insured professionals',
      'Plant & design expertise',
      'NZ plant species knowledge',
      'Regular maintenance programmes',
    ],
  },
  fencing: {
    priceFrom: 80,
    priceTo: 200,
    priceUnit: 'per metre',
    commonJobs: [
      'Timber fence installation',
      'Steel palisade fencing',
      'Aluminium slat fencing',
      'Post & rail fencing',
      'Fence repairs & re-nailing',
      'Gate installation',
    ],
    whyHire: [
      'Correct post depth and spacing ensures fences withstand NZ wind and weather',
      'Licensed contractors handle boundary pegging and council requirements',
      'Range of materials and styles to suit any budget',
      'Professional finish adds kerb appeal and property value',
    ],
    faqs: [
      {
        question: 'How much does fencing cost in NZ?',
        answer:
          'Fencing in NZ typically costs $80–$200 per metre depending on material and style. A standard timber paling fence costs around $100–$150/m installed; aluminium slat or steel fencing runs $150–$250/m.',
      },
      {
        question: 'Do I need council consent for a fence?',
        answer:
          'Fences up to 2m high generally don\'t require building consent in NZ. Fences in front yards are typically limited to 1.2m. Check your local district plan before building near boundaries.',
      },
      {
        question: 'Who pays for a boundary fence in NZ?',
        answer:
          'Under the Fencing Act 1978, costs for a boundary fence are generally shared equally between neighbours. You must give written notice to your neighbour and allow them to respond before proceeding.',
      },
      {
        question: 'How long does a timber fence last in NZ?',
        answer:
          'A quality treated pine fence lasts 15–25 years with regular maintenance (staining/oiling every 3–5 years). Hardwood and composite options last longer with less maintenance.',
      },
    ],
    trustSignals: [
      'Licensed fencing contractors',
      'Boundary-compliant installs',
      'Wind-rated post installation',
      'Written quote & warranty',
    ],
  },
  waterproofing: {
    priceFrom: 50,
    priceTo: 150,
    priceUnit: 'per m²',
    commonJobs: [
      'Bathroom wet-area waterproofing',
      'Deck membrane waterproofing',
      'Basement tanking',
      'Retaining wall waterproofing',
      'Flat roof re-coating',
      'Shower tray liner installation',
    ],
    whyHire: [
      'Water damage is one of the most expensive building failures in NZ',
      'Compliance with NZ Building Code clause E3 (internal moisture)',
      'Warranty-backed membrane systems',
      'Prevents mould, rot, and structural damage',
    ],
    faqs: [
      {
        question: 'How much does waterproofing cost in NZ?',
        answer:
          'Waterproofing costs in NZ typically range from $50–$150 per m² depending on the system used. A standard bathroom wet area (3–5 m²) costs $500–$1,500; a deck membrane coating may cost $3,000–$8,000 depending on size.',
      },
      {
        question: 'Is waterproofing required by NZ building code?',
        answer:
          'Yes. NZ Building Code clause E3 requires all wet areas (showers, baths, laundry floors) to be waterproofed. Waterproofing must be carried out before tiling and inspected before being covered.',
      },
      {
        question: 'How long does waterproofing last?',
        answer:
          'Quality membrane waterproofing systems last 10–25 years. Durability depends on correct application, substrate preparation, and exposure conditions. Regular inspection is recommended every 5 years.',
      },
      {
        question: 'Can I tile over existing waterproofing?',
        answer:
          'Only if the existing waterproofing is intact and compatible with your adhesive. In most renovation scenarios, old waterproofing should be removed and reapplied to ensure full Code compliance.',
      },
    ],
    trustSignals: [
      'Building Code compliant systems',
      'Membrane warranty certificates',
      'Licensed applicators',
      'Pre-tile inspection available',
    ],
  },
  'solar-installation': {
    priceFrom: 8000,
    priceTo: 25000,
    priceUnit: 'per system installed',
    commonJobs: [
      'Residential solar panel installation',
      'Commercial solar system installation',
      'Battery storage system installation',
      'Solar inverter replacement',
      'Grid-tie system setup',
      'Off-grid solar design & install',
    ],
    whyHire: [
      'Certified solar installers ensure grid-compliance and safety',
      'Correct system sizing maximises return on investment',
      'Knowledge of NZ net metering and buy-back rates',
      'Manufacturer warranties preserved with authorised installation',
    ],
    faqs: [
      {
        question: 'How much does solar installation cost in NZ?',
        answer:
          'A typical residential solar system in NZ costs $8,000–$20,000+ depending on system size, panels, and whether battery storage is included. A standard 5–6kW grid-tied system costs around $12,000–$18,000 installed.',
      },
      {
        question: 'How long does it take for solar to pay off in NZ?',
        answer:
          'The payback period for NZ solar installations is typically 7–12 years depending on your electricity usage, local solar resource, and whether you sell excess power back to the grid. Post-payback, savings continue for 20+ years.',
      },
      {
        question: 'Do I need council consent for solar panels in NZ?',
        answer:
          'Most residential roof-mounted solar installations are permitted as of right and don\'t require building consent. However, large commercial systems or ground-mounted arrays may need consent. Your installer will advise.',
      },
      {
        question: 'Can I sell solar power back to the grid in NZ?',
        answer:
          'Yes. Most NZ power retailers offer buy-back rates (typically 8–17c/kWh) for excess solar exported to the grid. Rates vary by retailer — shop around to maximise your export earnings.',
      },
    ],
    trustSignals: [
      'MCS-equivalent certified installers',
      'Grid-connection approved',
      'Manufacturer warranty preserved',
      '25-year panel performance warranty',
    ],
  },
  tiling: {
    priceFrom: 60,
    priceTo: 140,
    priceUnit: 'per m²',
    commonJobs: [
      'Bathroom floor and wall tiling',
      'Kitchen splashback tiling',
      'Outdoor patio tiling',
      'Pool area tiling',
      'Laundry floor tiling',
      'Feature wall tile installation',
    ],
    whyHire: [
      'Professional tile laying ensures level, waterproof, and durable results',
      'Correct adhesive and grout selection for each application',
      'Precise cuts around fixtures and corners',
      'Faster completion than DIY with fewer waste tiles',
    ],
    faqs: [
      {
        question: 'How much does tiling cost in NZ?',
        answer:
          'Tiling in NZ costs $60–$140 per m² for labour only, depending on tile size, pattern, and complexity. Larger format tiles and herringbone patterns cost more. Supply and install packages are available from most tilers.',
      },
      {
        question: 'How long does tiling take to dry?',
        answer:
          'Tile adhesive sets in 24 hours and grout cures in 24–72 hours. Walk-on time for floor tiles is typically 24 hours; full curing before heavy use or grouting is 48–72 hours.',
      },
      {
        question: 'What tiles are best for NZ bathrooms?',
        answer:
          'Porcelain tiles are the most popular choice for NZ bathrooms — they\'re hard-wearing, low-maintenance, and naturally slip-resistant when textured. Rectified large-format tiles (600×600mm or larger) are a popular modern choice.',
      },
      {
        question: 'Do I need waterproofing before tiling a shower?',
        answer:
          'Yes — this is a NZ Building Code requirement (clause E3). Waterproofing membrane must be applied and inspected before any tiles are laid in shower areas or wet floors. A tiler will usually arrange this or work with a waterproofer.',
      },
    ],
    trustSignals: [
      'Trade-qualified tilers',
      'Building Code compliant wet areas',
      'Clean, precise workmanship',
      'Grout colour matching service',
    ],
  },
  concreting: {
    priceFrom: 100,
    priceTo: 200,
    priceUnit: 'per m²',
    commonJobs: [
      'Concrete driveway installation',
      'Concrete path laying',
      'Concrete slab for shed or garage',
      'Exposed aggregate concrete',
      'Concrete kerbing',
      'House slab foundation',
    ],
    whyHire: [
      'Correct mix design ensures strength and durability for NZ conditions',
      'Proper sub-base preparation prevents cracking and sinking',
      'Reinforcing steel placed to NZ standards',
      'Consistent finish and correct falls for drainage',
    ],
    faqs: [
      {
        question: 'How much does a concrete driveway cost in NZ?',
        answer:
          'A standard concrete driveway in NZ costs $100–$200 per m² for plain concrete. Exposed aggregate and decorative finishes cost $150–$250+ per m². A typical double driveway (40m²) runs $4,000–$8,000.',
      },
      {
        question: 'How thick should a concrete driveway be in NZ?',
        answer:
          'Residential driveways in NZ are typically poured at 100mm thickness with mesh reinforcing. Areas subject to heavy vehicles (trucks, motorhomes) should be 125–150mm thick.',
      },
      {
        question: 'How long does concrete take to cure in NZ?',
        answer:
          'Concrete reaches foot-traffic strength in 24–48 hours. Light vehicle traffic is safe after 7 days. Full curing takes 28 days — avoid parking heavy vehicles or placing heavy loads in the first month.',
      },
      {
        question: 'Do I need building consent for a concrete slab in NZ?',
        answer:
          'A standalone concrete path or driveway generally doesn\'t require consent. A slab used as a foundation for a building (shed, garage, dwelling) will require a building consent from your local council.',
      },
    ],
    trustSignals: [
      'Licensed concrete contractors',
      'Reinforced to NZ standards',
      'Pre-pour inspection available',
      'Sealant and curing compounds applied',
    ],
  },
  insulation: {
    priceFrom: 1500,
    priceTo: 6000,
    priceUnit: 'per home',
    commonJobs: [
      'Ceiling insulation installation',
      'Underfloor insulation installation',
      'Wall insulation (retrofit)',
      'Healthy Homes compliance assessment',
      'Insulation top-up',
      'Vapour barrier installation',
    ],
    whyHire: [
      'Mandatory for rental properties under NZ Healthy Homes Standards',
      'Significantly reduces heating costs year-round',
      'Correct R-values specified for each NZ climate zone',
      'Professional installation avoids gaps and compression that reduce effectiveness',
    ],
    faqs: [
      {
        question: 'How much does insulation cost in NZ?',
        answer:
          'Ceiling insulation typically costs $1,500–$3,500 for an average NZ home. Underfloor insulation adds $1,500–$3,000. Combined ceiling and underfloor packages often cost $3,000–$6,000. Government subsidies may be available through Warmer Kiwi Homes.',
      },
      {
        question: 'What are the NZ Healthy Homes insulation requirements?',
        answer:
          'All rental properties in NZ must meet Healthy Homes insulation standards. Ceiling insulation must meet minimum R-values: R2.9 in Zone 1 (Northland/Auckland), R3.3 in Zone 2 (central NZ), R3.6 in Zone 3 (southern NZ and highlands). Underfloor R1.3 is required nationally where accessible.',
      },
      {
        question: 'What is the best insulation for NZ homes?',
        answer:
          'Pink Batts (glasswool), polyester, and rigid foam board are the most popular NZ insulation types. For underfloor, foil-backed polyester or glasswool batts are standard. Each has different R-values, cost points, and installation requirements.',
      },
      {
        question: 'Can I get a subsidy for insulation in NZ?',
        answer:
          'Yes. The Warmer Kiwi Homes programme offers up to 80% off insulation costs for eligible owner-occupiers. Community Service Card holders and low-income homeowners typically qualify. Check eligibility at eeca.govt.nz.',
      },
    ],
    trustSignals: [
      'Healthy Homes Standards compliance',
      'Warmer Kiwi Homes approved installers',
      'Certified R-value documentation',
      'Subsidy assistance available',
    ],
  },
  'asbestos-removal': {
    priceFrom: 500,
    priceTo: 5000,
    priceUnit: 'per job',
    commonJobs: [
      'Asbestos inspection & testing',
      'Friable asbestos removal',
      'Non-friable (bonded) asbestos removal',
      'Vinyl floor tile removal',
      'Asbestos roof removal',
      'Clearance air monitoring',
    ],
    whyHire: [
      'Asbestos removal is tightly regulated by WorkSafe NZ — licensed contractors only',
      'Incorrect removal creates serious health risks for occupants and workers',
      'Licensed removalists carry specialist equipment and insurance',
      'Clearance certificates required before re-occupation',
    ],
    faqs: [
      {
        question: 'How much does asbestos removal cost in NZ?',
        answer:
          'Asbestos removal costs in NZ range from $500 for small non-friable jobs (e.g., a sheet or two of textured ceiling) to $5,000+ for whole-of-roof or friable asbestos removal. Air monitoring and clearance certificates add $300–$800 per clearance.',
      },
      {
        question: 'Is asbestos common in NZ homes?',
        answer:
          'Yes. Homes built before 1990 often contain asbestos in materials such as textured (stipple) ceilings, vinyl floor tiles, cement sheets (fibrolite), and roof tiles. Homes built before 1980 are at highest risk.',
      },
      {
        question: 'Do I need a licensed contractor for asbestos removal in NZ?',
        answer:
          'For friable asbestos (which can crumble into dust), a Class A licensed removalist is legally required. For non-friable asbestos over 10m², a Class B licence is required. Small amounts of non-friable asbestos (under 10m²) may be removed by homeowners following WorkSafe guidelines.',
      },
      {
        question: 'What should I do if I find asbestos during a renovation?',
        answer:
          'Stop work immediately. Do not drill, cut, or sand the material. Seal off the area and arrange for testing by an accredited laboratory. Your QuickTrade asbestos removal specialist can arrange testing and safe removal.',
      },
    ],
    trustSignals: [
      'WorkSafe NZ licensed contractors',
      'Clearance certificates provided',
      'Accredited air monitoring',
      'Fully insured asbestos specialists',
    ],
  },
  'carpet-cleaning': {
    priceFrom: 50,
    priceTo: 100,
    priceUnit: 'per room',
    commonJobs: [
      'Residential steam carpet cleaning',
      'End-of-tenancy carpet cleaning',
      'Stain and odour treatment',
      'Commercial carpet cleaning',
      'Upholstery and sofa cleaning',
      'Dry carpet cleaning',
    ],
    whyHire: [
      'Commercial truck-mounted steam cleaning removes deep-set dirt and allergens',
      'Professional stain treatment achieves better results than DIY products',
      'Extends the lifespan of carpet and protects your bond refund',
      'Fast drying times with high-powered extraction equipment',
    ],
    faqs: [
      {
        question: 'How much does carpet cleaning cost in NZ?',
        answer:
          'Carpet cleaning in NZ typically costs $50–$100 per room or $250–$500 for a standard 3-bedroom home. End-of-tenancy packages are often priced as a whole-home rate.',
      },
      {
        question: 'How often should carpets be professionally cleaned?',
        answer:
          'For residential homes, professional carpet cleaning once every 12–18 months is recommended. Households with pets, children, or allergy sufferers benefit from more frequent cleans (every 6–12 months).',
      },
      {
        question: 'How long does carpet take to dry after steam cleaning?',
        answer:
          'With professional truck-mounted extraction, carpets are typically dry within 2–6 hours. Open windows and use fans to speed up drying.',
      },
      {
        question: 'Can carpet cleaning remove pet stains and odours?',
        answer:
          'Professional carpet cleaners use enzyme-based treatments that break down pet urine compounds, effectively removing both stains and odours in most cases. Severe or long-standing stains may require specialist treatment.',
      },
    ],
    trustSignals: [
      'Commercial-grade steam cleaning equipment',
      'Bond-clean guarantee available',
      'Fully insured professionals',
      'Eco-friendly product options',
    ],
  },
  'window-cleaning': {
    priceFrom: 80,
    priceTo: 300,
    priceUnit: 'per visit',
    commonJobs: [
      'Residential window cleaning',
      'Commercial window cleaning',
      'High-rise window cleaning',
      'Conservatory cleaning',
      'Window track and frame cleaning',
      'Solar panel cleaning',
    ],
    whyHire: [
      'Streak-free results with professional squeegees and purified water systems',
      'Safe access to high and difficult windows',
      'Extends window life by removing corrosive mineral deposits',
      'Regular cleans keep your home looking its best year-round',
    ],
    faqs: [
      {
        question: 'How much does window cleaning cost in NZ?',
        answer:
          'Residential window cleaning in NZ typically costs $80–$200 for a standard home. Larger or multi-storey properties may cost $200–$400+. Commercial window cleaning is usually quoted per visit or on an ongoing contract.',
      },
      {
        question: 'How often should windows be professionally cleaned?',
        answer:
          'For most NZ homes, twice-yearly professional cleaning (spring and autumn) maintains clean windows and removes mineral deposits. Coastal properties may benefit from more frequent cleans due to salt spray.',
      },
      {
        question: 'Do window cleaners clean window tracks and frames?',
        answer:
          'Most professional window cleaners include track and frame wiping as part of the service. Confirm this when booking — heavily soiled tracks may incur an additional charge.',
      },
      {
        question: 'Can window cleaners clean solar panels?',
        answer:
          'Yes. Many NZ window cleaners also offer solar panel cleaning, which is important for maintaining panel efficiency. Professional cleaning removes dust, bird droppings, and grime that reduce solar output.',
      },
    ],
    trustSignals: [
      'Fully insured professionals',
      'Height safety certified',
      'Purified water systems used',
      'Streak-free guarantee',
    ],
  },
  'pool-maintenance': {
    priceFrom: 100,
    priceTo: 300,
    priceUnit: 'per visit',
    commonJobs: [
      'Regular pool cleaning and vacuuming',
      'Chemical balancing and water testing',
      'Filter cleaning and backwashing',
      'Pool pump and equipment servicing',
      'Algae treatment',
      'Pool opening and closing (seasonal)',
    ],
    whyHire: [
      'Correct chemical balance ensures safe, comfortable swimming',
      'Regular professional maintenance prevents costly equipment failures',
      'Time-saving — no need to buy, store, or apply chemicals yourself',
      'Expert diagnosis of water quality issues and equipment faults',
    ],
    faqs: [
      {
        question: 'How much does pool maintenance cost in NZ?',
        answer:
          'Regular pool maintenance in NZ typically costs $100–$200 per fortnightly visit, or $150–$300 for a monthly service. Annual contracts covering all chemicals, cleaning, and equipment checks cost $2,000–$5,000 per year.',
      },
      {
        question: 'How often should a pool be professionally serviced?',
        answer:
          'For most residential pools in NZ, fortnightly servicing during summer and monthly in winter keeps water chemistry balanced and equipment running well. Heavily used pools may require weekly service.',
      },
      {
        question: 'Why is my pool water green?',
        answer:
          'Green water is caused by algae, which typically results from insufficient chlorine, poor circulation, or pH imbalance. A pool technician can shock-treat the pool and restore water clarity within 24–72 hours.',
      },
      {
        question: 'What chemicals does my pool need?',
        answer:
          'Residential pools require chlorine (or saltwater equivalent), pH adjusters (acid/soda ash), alkalinity buffers, and occasional algaecide or clarifier. A pool professional will test your water and advise on the correct treatment.',
      },
    ],
    trustSignals: [
      'Certified pool technicians',
      'Water test records provided',
      'Fully insured service',
      'Equipment fault diagnosis included',
    ],
  },
}

/** Get service details (pricing, FAQs, etc.) for a given slug */
export function getServiceDetails(slug: string): ServiceDetails | undefined {
  return SERVICE_DETAILS[slug]
}
