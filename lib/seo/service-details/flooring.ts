import type { ServiceDetails } from '../servicesData'

export const flooringDetails: ServiceDetails = {
    priceFrom: 40,
    priceTo: 120,
    priceUnit: 'per m²',
    commonJobs: [
      'Hardwood floor installation',
      'Laminate flooring laying',
      'Vinyl plank installation',
      'Tile floor installation',
      'Floor sanding & polishing',
      'Carpet installation',
    ],
    whyHire: [
      'Correct subfloor preparation prevents future lifting and squeaks',
      'Professional tools achieve precise cuts and tight joins',
      'Moisture and expansion gaps handled correctly',
      'Faster installation than DIY',
    ],
    faqs: [
      {
        question: 'How much does new flooring cost in NZ?',
        answer:
          'Flooring installation in NZ typically costs $40–$120 per m² for supply and install. Hardwood and tile are at the higher end; laminate and vinyl plank are more affordable.',
      },
      {
        question: 'What is the most popular flooring in NZ homes?',
        answer:
          'Vinyl plank (LVP) and hybrid flooring are very popular for their durability, waterproofing, and realistic wood look. Hardwood is favoured in premium homes, and carpet remains popular in bedrooms.',
      },
      {
        question: 'How long does floor installation take?',
        answer:
          'A single room can typically be completed in one day. A whole house may take 3–5 days depending on floor area, subfloor condition, and complexity.',
      },
      {
        question: 'Do I need to move furniture before the flooring team arrives?',
        answer:
          'Yes, furniture generally needs to be cleared from the area. Some flooring companies include furniture removal in their quote — check when booking.',
      },
    ],
    trustSignals: [
      'Trade-qualified installers',
      'Manufacturer warranties honoured',
      'Subfloor assessment included',
      'Clean, tidy workmanship',
    ],
}
