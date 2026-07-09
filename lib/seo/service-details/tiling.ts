import type { ServiceDetails } from '../servicesData'

export const tilingDetails: ServiceDetails = {
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
}
