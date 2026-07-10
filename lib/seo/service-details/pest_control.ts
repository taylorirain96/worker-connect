import type { ServiceDetails } from '../servicesData'

export const pestControlDetails: Record<string, ServiceDetails> = {
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
}
