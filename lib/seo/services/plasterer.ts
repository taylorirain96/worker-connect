import type { ServiceDetails } from '../servicesData'

export const plastererDetails: ServiceDetails = {
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
}
