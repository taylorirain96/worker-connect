import type { ServiceDetails } from '../servicesData'

export const pool_maintenanceDetails: ServiceDetails = {
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
}
