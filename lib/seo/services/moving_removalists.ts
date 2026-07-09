import type { ServiceDetails } from '../servicesData'

export const moving_removalistsDetails: ServiceDetails = {
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
}
