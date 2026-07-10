import type { ServiceDetails } from '../servicesData'

export const heatPumpsAirConditioningDetails: Record<string, ServiceDetails> = {
  'heat-pumps-air-conditioning': {
    priceFrom: 1200,
    priceTo: 4500,
    priceUnit: 'per unit installed',
    commonJobs: [
      'Heat pump installation',
      'Air conditioning installation',
      'Annual heat pump service',
      'Filter cleaning & maintenance',
      'Fault diagnosis & repair',
      'Multi-head heat pump systems',
    ],
    whyHire: [
      'Correct sizing ensures maximum energy efficiency',
      'Professional installation protects your warranty',
      'Compliance with NZ building regulations',
      'Ongoing servicing extends equipment lifespan',
    ],
    faqs: [
      {
        question: 'How much does a heat pump cost to install in NZ?',
        answer:
          'A standard single-room heat pump installation in NZ costs $1,200–$4,500 fully installed. Price varies by brand, capacity, and installation complexity.',
      },
      {
        question: 'How often should a heat pump be serviced?',
        answer:
          'Heat pumps should be serviced at least once a year. Regular servicing (filter cleaning, coil inspection, refrigerant check) keeps efficiency high and prevents breakdowns.',
      },
      {
        question: 'What size heat pump do I need?',
        answer:
          'Room size, insulation, and climate all affect sizing. A qualified installer will measure your space and recommend the correct kW capacity — typically 2.5 kW for a small bedroom up to 7+ kW for an open-plan living area.',
      },
      {
        question: 'Can I get a Warmer Kiwi Homes subsidy for my heat pump?',
        answer:
          'Yes. Eligible homeowners may receive a government subsidy of up to 80% off the cost of a heat pump through the Warmer Kiwi Homes programme. Ask your installer about eligibility.',
      },
    ],
    trustSignals: [
      'Authorised brand installers',
      'Manufacturer warranty preserved',
      'Certified refrigerant handling',
      'Energy efficiency advice included',
    ],
  },
}
