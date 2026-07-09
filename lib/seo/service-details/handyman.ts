import type { ServiceDetails } from '../servicesData'

export const handymanDetails: Record<string, ServiceDetails> = {
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
}
