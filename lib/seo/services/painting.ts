import type { ServiceDetails } from '../servicesData'

export const paintingDetails: ServiceDetails = {
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
}
