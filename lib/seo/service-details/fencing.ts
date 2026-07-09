import type { ServiceDetails } from '../servicesData'

export const fencingDetails: Record<string, ServiceDetails> = {
  fencing: {
    priceFrom: 80,
    priceTo: 200,
    priceUnit: 'per metre',
    commonJobs: [
      'Timber fence installation',
      'Steel palisade fencing',
      'Aluminium slat fencing',
      'Post & rail fencing',
      'Fence repairs & re-nailing',
      'Gate installation',
    ],
    whyHire: [
      'Correct post depth and spacing ensures fences withstand NZ wind and weather',
      'Licensed contractors handle boundary pegging and council requirements',
      'Range of materials and styles to suit any budget',
      'Professional finish adds kerb appeal and property value',
    ],
    faqs: [
      {
        question: 'How much does fencing cost in NZ?',
        answer:
          'Fencing in NZ typically costs $80–$200 per metre depending on material and style. A standard timber paling fence costs around $100–$150/m installed; aluminium slat or steel fencing runs $150–$250/m.',
      },
      {
        question: 'Do I need council consent for a fence?',
        answer:
          'Fences up to 2m high generally don\'t require building consent in NZ. Fences in front yards are typically limited to 1.2m. Check your local district plan before building near boundaries.',
      },
      {
        question: 'Who pays for a boundary fence in NZ?',
        answer:
          'Under the Fencing Act 1978, costs for a boundary fence are generally shared equally between neighbours. You must give written notice to your neighbour and allow them to respond before proceeding.',
      },
      {
        question: 'How long does a timber fence last in NZ?',
        answer:
          'A quality treated pine fence lasts 15–25 years with regular maintenance (staining/oiling every 3–5 years). Hardwood and composite options last longer with less maintenance.',
      },
    ],
    trustSignals: [
      'Licensed fencing contractors',
      'Boundary-compliant installs',
      'Wind-rated post installation',
      'Written quote & warranty',
    ],
  },
}
