import type { ServiceDetails } from '../servicesData'

export const carpet_cleaningDetails: ServiceDetails = {
    priceFrom: 50,
    priceTo: 100,
    priceUnit: 'per room',
    commonJobs: [
      'Residential steam carpet cleaning',
      'End-of-tenancy carpet cleaning',
      'Stain and odour treatment',
      'Commercial carpet cleaning',
      'Upholstery and sofa cleaning',
      'Dry carpet cleaning',
    ],
    whyHire: [
      'Commercial truck-mounted steam cleaning removes deep-set dirt and allergens',
      'Professional stain treatment achieves better results than DIY products',
      'Extends the lifespan of carpet and protects your bond refund',
      'Fast drying times with high-powered extraction equipment',
    ],
    faqs: [
      {
        question: 'How much does carpet cleaning cost in NZ?',
        answer:
          'Carpet cleaning in NZ typically costs $50–$100 per room or $250–$500 for a standard 3-bedroom home. End-of-tenancy packages are often priced as a whole-home rate.',
      },
      {
        question: 'How often should carpets be professionally cleaned?',
        answer:
          'For residential homes, professional carpet cleaning once every 12–18 months is recommended. Households with pets, children, or allergy sufferers benefit from more frequent cleans (every 6–12 months).',
      },
      {
        question: 'How long does carpet take to dry after steam cleaning?',
        answer:
          'With professional truck-mounted extraction, carpets are typically dry within 2–6 hours. Open windows and use fans to speed up drying.',
      },
      {
        question: 'Can carpet cleaning remove pet stains and odours?',
        answer:
          'Professional carpet cleaners use enzyme-based treatments that break down pet urine compounds, effectively removing both stains and odours in most cases. Severe or long-standing stains may require specialist treatment.',
      },
    ],
    trustSignals: [
      'Commercial-grade steam cleaning equipment',
      'Bond-clean guarantee available',
      'Fully insured professionals',
      'Eco-friendly product options',
    ],
}
