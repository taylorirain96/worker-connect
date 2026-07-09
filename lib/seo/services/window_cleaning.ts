import type { ServiceDetails } from '../servicesData'

export const window_cleaningDetails: ServiceDetails = {
    priceFrom: 80,
    priceTo: 300,
    priceUnit: 'per visit',
    commonJobs: [
      'Residential window cleaning',
      'Commercial window cleaning',
      'High-rise window cleaning',
      'Conservatory cleaning',
      'Window track and frame cleaning',
      'Solar panel cleaning',
    ],
    whyHire: [
      'Streak-free results with professional squeegees and purified water systems',
      'Safe access to high and difficult windows',
      'Extends window life by removing corrosive mineral deposits',
      'Regular cleans keep your home looking its best year-round',
    ],
    faqs: [
      {
        question: 'How much does window cleaning cost in NZ?',
        answer:
          'Residential window cleaning in NZ typically costs $80–$200 for a standard home. Larger or multi-storey properties may cost $200–$400+. Commercial window cleaning is usually quoted per visit or on an ongoing contract.',
      },
      {
        question: 'How often should windows be professionally cleaned?',
        answer:
          'For most NZ homes, twice-yearly professional cleaning (spring and autumn) maintains clean windows and removes mineral deposits. Coastal properties may benefit from more frequent cleans due to salt spray.',
      },
      {
        question: 'Do window cleaners clean window tracks and frames?',
        answer:
          'Most professional window cleaners include track and frame wiping as part of the service. Confirm this when booking — heavily soiled tracks may incur an additional charge.',
      },
      {
        question: 'Can window cleaners clean solar panels?',
        answer:
          'Yes. Many NZ window cleaners also offer solar panel cleaning, which is important for maintaining panel efficiency. Professional cleaning removes dust, bird droppings, and grime that reduce solar output.',
      },
    ],
    trustSignals: [
      'Fully insured professionals',
      'Height safety certified',
      'Purified water systems used',
      'Streak-free guarantee',
    ],
}
