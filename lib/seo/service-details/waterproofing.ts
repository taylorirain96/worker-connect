import type { ServiceDetails } from '../servicesData'

export const waterproofingDetails: Record<string, ServiceDetails> = {
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
}
