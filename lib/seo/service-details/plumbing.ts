import type { ServiceDetails } from '../servicesData'

export const plumbingDetails: ServiceDetails = {
    priceFrom: 90,
    priceTo: 250,
    priceUnit: 'per hour',
    commonJobs: [
      'Leaking tap repair',
      'Blocked drain clearing',
      'Hot-water cylinder replacement',
      'Toilet installation',
      'Pipe burst repair',
      'Bathroom renovation plumbing',
    ],
    whyHire: [
      'Licensed plumbers ensure work meets NZ building code',
      'Prevent water damage with correct repairs',
      'Warranty on parts and labour',
      'Emergency call-outs available',
    ],
    faqs: [
      {
        question: 'How much does a plumber cost in New Zealand?',
        answer:
          'Most NZ plumbers charge between $90–$250 per hour including GST. Call-out fees typically range from $80–$150. Fixed-price quotes are available for larger jobs like hot-water cylinder replacements.',
      },
      {
        question: 'Do plumbers need to be licensed in NZ?',
        answer:
          'Yes. In New Zealand, most plumbing work must be carried out by or supervised by a registered and licensed plumber under the Plumbers, Gasfitters and Drainlayers Act 2006.',
      },
      {
        question: 'How long does it take to fix a leaking pipe?',
        answer:
          'A straightforward leaking pipe repair typically takes 1–2 hours. Complex burst pipes or wall-concealed leaks may take half a day or longer.',
      },
      {
        question: 'Can I get a same-day plumber?',
        answer:
          'Many QuickTrade plumbers offer same-day or emergency appointments. Post your job and check each professional\'s availability in their profile.',
      },
    ],
    trustSignals: [
      'Licensed & registered professionals',
      'Background-checked workers',
      'Real verified reviews',
      'Secure payments via QuickTrade',
    ],
}
