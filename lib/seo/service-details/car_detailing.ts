import type { ServiceDetails } from '../servicesData'

export const carDetailingDetails: ServiceDetails = {
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
}
