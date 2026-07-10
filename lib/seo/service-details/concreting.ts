import type { ServiceDetails } from '../servicesData'

export const concretingDetails: Record<string, ServiceDetails> = {
  concreting: {
    priceFrom: 100,
    priceTo: 200,
    priceUnit: 'per m²',
    commonJobs: [
      'Concrete driveway installation',
      'Concrete path laying',
      'Concrete slab for shed or garage',
      'Exposed aggregate concrete',
      'Concrete kerbing',
      'House slab foundation',
    ],
    whyHire: [
      'Correct mix design ensures strength and durability for NZ conditions',
      'Proper sub-base preparation prevents cracking and sinking',
      'Reinforcing steel placed to NZ standards',
      'Consistent finish and correct falls for drainage',
    ],
    faqs: [
      {
        question: 'How much does a concrete driveway cost in NZ?',
        answer:
          'A standard concrete driveway in NZ costs $100–$200 per m² for plain concrete. Exposed aggregate and decorative finishes cost $150–$250+ per m². A typical double driveway (40m²) runs $4,000–$8,000.',
      },
      {
        question: 'How thick should a concrete driveway be in NZ?',
        answer:
          'Residential driveways in NZ are typically poured at 100mm thickness with mesh reinforcing. Areas subject to heavy vehicles (trucks, motorhomes) should be 125–150mm thick.',
      },
      {
        question: 'How long does concrete take to cure in NZ?',
        answer:
          'Concrete reaches foot-traffic strength in 24–48 hours. Light vehicle traffic is safe after 7 days. Full curing takes 28 days — avoid parking heavy vehicles or placing heavy loads in the first month.',
      },
      {
        question: 'Do I need building consent for a concrete slab in NZ?',
        answer:
          'A standalone concrete path or driveway generally doesn\'t require consent. A slab used as a foundation for a building (shed, garage, dwelling) will require a building consent from your local council.',
      },
    ],
    trustSignals: [
      'Licensed concrete contractors',
      'Reinforced to NZ standards',
      'Pre-pour inspection available',
      'Sealant and curing compounds applied',
    ],
  },
}
