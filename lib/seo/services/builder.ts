import type { ServiceDetails } from '../servicesData'

export const builderDetails: ServiceDetails = {
    priceFrom: 80,
    priceTo: 160,
    priceUnit: 'per hour',
    commonJobs: [
      'Home renovation',
      'House extension',
      'Deck construction',
      'Kitchen remodel',
      'Bathroom renovation',
      'New shed or outbuilding',
    ],
    whyHire: [
      'Licensed Building Practitioners (LBPs) for code-compliant work',
      'Building consent management and council liaison',
      'Project management of sub-trades',
      'Quality workmanship backed by NZCB guarantees',
    ],
    faqs: [
      {
        question: 'Do I need a building consent for renovations in NZ?',
        answer:
          'Most structural work, new rooms, and significant alterations require a building consent from your local council. Minor work like replacing a deck less than 1.5m above ground may be exempt — your builder can advise.',
      },
      {
        question: 'How much does a home extension cost in NZ?',
        answer:
          'Home extensions in NZ typically cost $2,500–$4,500+ per m² for a basic addition, including materials and labour. Kitchen and bathroom extensions cost more due to services.',
      },
      {
        question: 'What is a Licensed Building Practitioner (LBP)?',
        answer:
          'An LBP is a builder licensed by the Ministry of Business, Innovation and Employment (MBIE) to carry out or supervise restricted building work (RBW) in NZ. Always ask to see an LBP licence number.',
      },
      {
        question: 'How long does a full house renovation take?',
        answer:
          'A whole-house renovation typically takes 3–12 months depending on scope, council processes, and availability of materials and sub-trades.',
      },
    ],
    trustSignals: [
      'Licensed Building Practitioners (LBPs)',
      'NZCB members available',
      'Full project insurance',
      'Building consent expertise',
    ],
}
