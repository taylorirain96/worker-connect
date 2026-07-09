import type { ServiceDetails } from '../servicesData'

export const cleaningDetails: Record<string, ServiceDetails> = {
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
}
