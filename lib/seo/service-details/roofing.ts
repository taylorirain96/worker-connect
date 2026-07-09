import type { ServiceDetails } from '../servicesData'

export const roofingDetails: Record<string, ServiceDetails> = {
  roofing: {
    priceFrom: 500,
    priceTo: 3000,
    priceUnit: 'per job',
    commonJobs: [
      'Roof leak repairs',
      'Iron roof replacement',
      'Tile roof repair',
      'Gutter replacement',
      'Fascia & soffit repairs',
      'Roof cleaning & moss treatment',
    ],
    whyHire: [
      'Working at height is dangerous — professionals have the right safety gear',
      'Correct repairs prevent costly water damage to ceilings and walls',
      'Knowledge of NZ building code for roofing',
      'Manufacturer warranties on new roofing materials',
    ],
    faqs: [
      {
        question: 'How much does a roof repair cost in NZ?',
        answer:
          'Minor roof repairs in NZ typically cost $500–$1,500. A full roof replacement for an average home ranges from $15,000–$40,000+ depending on materials and size.',
      },
      {
        question: 'How do I know if my roof needs replacing?',
        answer:
          'Signs include: persistent leaks after repairs, multiple missing or cracked tiles, significant rust on iron roofing, sagging sections, or a roof over 25–30 years old.',
      },
      {
        question: 'What is the best roofing material in NZ?',
        answer:
          'Long-run steel (Colorsteel/Zincalume) is the most popular in NZ for its durability and cost. Concrete tiles, clay tiles, and butyl rubber are also used. Each has different cost and lifespan trade-offs.',
      },
      {
        question: 'Can I repair my roof myself in NZ?',
        answer:
          'Minor gutter cleaning is safe for competent DIYers, but any structural roofing work should be done by professionals for safety and insurance purposes. Falls from roofs are a leading cause of serious injuries in NZ.',
      },
    ],
    trustSignals: [
      'Height safety certified',
      'Licensed building practitioners',
      'Insurance-approved repairs',
      'Free roof inspections available',
    ],
  },
}
