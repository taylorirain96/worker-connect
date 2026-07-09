import type { ServiceDetails } from '../servicesData'

export const landscaping_gardeningDetails: ServiceDetails = {
    priceFrom: 45,
    priceTo: 90,
    priceUnit: 'per hour',
    commonJobs: [
      'Lawn mowing & edging',
      'Garden design & planting',
      'Tree & hedge trimming',
      'Irrigation installation',
      'Retaining wall construction',
      'Section clearing',
    ],
    whyHire: [
      'Professional tools and ride-on mowers for large sections',
      'Correct pruning techniques maintain plant health',
      'Irrigation expertise reduces water bills',
      'Design skills transform outdoor spaces',
    ],
    faqs: [
      {
        question: 'How much does lawn mowing cost in NZ?',
        answer:
          'Lawn mowing in NZ typically costs $45–$90 per hour or $50–$150 per visit for a standard section. Regular maintenance contracts are often discounted.',
      },
      {
        question: 'What is included in a garden maintenance visit?',
        answer:
          'A standard maintenance visit usually includes lawn mowing, edging, weeding, blowing paths, and tidying garden beds. Larger tasks like hedge trimming or tree work are additional.',
      },
      {
        question: 'Do I need council consent for a retaining wall?',
        answer:
          'In NZ, retaining walls under 1.5m high generally don\'t require consent, but this depends on proximity to boundaries and surcharges. A qualified landscaper can advise on compliance.',
      },
      {
        question: 'When is the best time to plant in New Zealand?',
        answer:
          'Spring (September–November) is ideal for most planting as soil temperatures rise. Autumn (March–May) is great for establishing lawns and deciduous trees before winter.',
      },
    ],
    trustSignals: [
      'Fully insured professionals',
      'Plant & design expertise',
      'NZ plant species knowledge',
      'Regular maintenance programmes',
    ],
}
