import type { ServiceDetails } from '../servicesData'

export const electricalDetails: Record<string, ServiceDetails> = {
  electrical: {
    priceFrom: 95,
    priceTo: 280,
    priceUnit: 'per hour',
    commonJobs: [
      'Switchboard upgrade',
      'New power outlet installation',
      'LED lighting installation',
      'EV charger fitting',
      'Smoke alarm installation',
      'Fault finding & repairs',
    ],
    whyHire: [
      'Only licensed electricians can legally do mains wiring in NZ',
      'Electrical safety certificates provided',
      'Reduces risk of electrical fires and electrocution',
      'Work inspected and signed off to NZ standards',
    ],
    faqs: [
      {
        question: 'How much does an electrician cost in NZ?',
        answer:
          'NZ electricians typically charge $95–$280 per hour. Call-out fees are usually $80–$150. Simple jobs like replacing a light switch may be quoted as a fixed price.',
      },
      {
        question: 'Do I need a licensed electrician in New Zealand?',
        answer:
          'Yes. All electrical work connected to the mains supply must be carried out by a registered electrician under the Electricity Act 1992. DIY electrical work is illegal and unsafe.',
      },
      {
        question: 'How long does a switchboard upgrade take?',
        answer:
          'A full switchboard upgrade typically takes 4–8 hours depending on the size of your home and complexity of existing wiring.',
      },
      {
        question: 'Can an electrician install an EV charger at home?',
        answer:
          'Yes. A licensed electrician can install a dedicated EV charging circuit and wall-box. This usually takes 2–4 hours and requires a new circuit from your switchboard.',
      },
    ],
    trustSignals: [
      'Licensed & registered electricians',
      'ESC certificates provided',
      'Insured professionals',
      'Verified customer reviews',
    ],
  },
}
