import type { ServiceDetails } from '../servicesData'

export const rubbishRemovalDetails: ServiceDetails = {
    priceFrom: 150,
    priceTo: 600,
    priceUnit: 'per load',
    commonJobs: [
      'General household rubbish removal',
      'Garden waste removal',
      'Furniture & white goods disposal',
      'Construction debris removal',
      'End-of-tenancy cleanout',
      'Hoarder house clearance',
    ],
    whyHire: [
      'No need to hire a skip bin or make multiple tip runs',
      'Heavy items carried out of your home',
      'Responsible recycling and disposal',
      'Same-day and next-day availability',
    ],
    faqs: [
      {
        question: 'How much does rubbish removal cost in NZ?',
        answer:
          'Rubbish removal in NZ costs $150–$600 per load depending on volume and type of waste. A ute-load starts around $150; a full trailer or truck load may be $400–$600+.',
      },
      {
        question: 'Can rubbish removal companies take old appliances?',
        answer:
          'Yes. Most rubbish removal services can take white goods such as fridges, washing machines, and ovens. Some items like fridges with refrigerant may incur a small additional disposal fee.',
      },
      {
        question: 'Is rubbish removal cheaper than a skip bin?',
        answer:
          'For small to medium volumes, rubbish removal is often more cost-effective and convenient than a skip bin. You don\'t need to load the skip yourself and there are no permits required for kerbside placement.',
      },
      {
        question: 'What items can\'t be removed?',
        answer:
          'Hazardous materials such as asbestos, chemicals, and paint require specialist disposal and cannot be taken by general rubbish removal services. Ask your provider about restrictions when booking.',
      },
    ],
    trustSignals: [
      'Licensed waste carriers',
      'Responsible recycling practices',
      'Insured & covered',
      'On-time service guaranteed',
    ],
}
