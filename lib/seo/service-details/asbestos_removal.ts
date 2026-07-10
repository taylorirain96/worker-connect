import type { ServiceDetails } from '../servicesData'

export const asbestosRemovalDetails: Record<string, ServiceDetails> = {
  'asbestos-removal': {
    priceFrom: 500,
    priceTo: 5000,
    priceUnit: 'per job',
    commonJobs: [
      'Asbestos inspection & testing',
      'Friable asbestos removal',
      'Non-friable (bonded) asbestos removal',
      'Vinyl floor tile removal',
      'Asbestos roof removal',
      'Clearance air monitoring',
    ],
    whyHire: [
      'Asbestos removal is tightly regulated by WorkSafe NZ — licensed contractors only',
      'Incorrect removal creates serious health risks for occupants and workers',
      'Licensed removalists carry specialist equipment and insurance',
      'Clearance certificates required before re-occupation',
    ],
    faqs: [
      {
        question: 'How much does asbestos removal cost in NZ?',
        answer:
          'Asbestos removal costs in NZ range from $500 for small non-friable jobs (e.g., a sheet or two of textured ceiling) to $5,000+ for whole-of-roof or friable asbestos removal. Air monitoring and clearance certificates add $300–$800 per clearance.',
      },
      {
        question: 'Is asbestos common in NZ homes?',
        answer:
          'Yes. Homes built before 1990 often contain asbestos in materials such as textured (stipple) ceilings, vinyl floor tiles, cement sheets (fibrolite), and roof tiles. Homes built before 1980 are at highest risk.',
      },
      {
        question: 'Do I need a licensed contractor for asbestos removal in NZ?',
        answer:
          'For friable asbestos (which can crumble into dust), a Class A licensed removalist is legally required. For non-friable asbestos over 10m², a Class B licence is required. Small amounts of non-friable asbestos (under 10m²) may be removed by homeowners following WorkSafe guidelines.',
      },
      {
        question: 'What should I do if I find asbestos during a renovation?',
        answer:
          'Stop work immediately. Do not drill, cut, or sand the material. Seal off the area and arrange for testing by an accredited laboratory. Your QuickTrade asbestos removal specialist can arrange testing and safe removal.',
      },
    ],
    trustSignals: [
      'WorkSafe NZ licensed contractors',
      'Clearance certificates provided',
      'Accredited air monitoring',
      'Fully insured asbestos specialists',
    ],
  },
}
