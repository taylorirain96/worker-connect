import type { ServiceDetails } from '../servicesData'

export const applianceRepairDetails: ServiceDetails = {
    priceFrom: 80,
    priceTo: 200,
    priceUnit: 'per hour',
    commonJobs: [
      'Washing machine repair',
      'Dryer repair',
      'Dishwasher repair',
      'Oven & stove repair',
      'Refrigerator repair',
      'Microwave repair',
    ],
    whyHire: [
      'Repairing is often cheaper than replacing',
      'Qualified technicians carry common spare parts',
      'Diagnosis included in service fee',
      'Warranty on repaired components',
    ],
    faqs: [
      {
        question: 'Is it worth repairing a washing machine in NZ?',
        answer:
          'As a rule of thumb, repair is worthwhile if the cost is less than 50% of a new appliance. A technician can diagnose the fault and give you a quote so you can make an informed decision.',
      },
      {
        question: 'How much does appliance repair cost in NZ?',
        answer:
          'Appliance repair in NZ typically costs $80–$200 per hour plus parts. Most call-outs include a diagnostic fee of $80–$130 which is often credited toward the repair cost.',
      },
      {
        question: 'How long does appliance repair take?',
        answer:
          'Many common repairs are completed on the spot if the technician has the correct part. More complex repairs or parts sourcing may require a return visit.',
      },
      {
        question: 'My dishwasher isn\'t draining — can it be repaired?',
        answer:
          'Yes. Drainage issues are often caused by a blocked filter, pump fault, or kinked drain hose — all repairable. A technician will diagnose the specific cause during the inspection.',
      },
    ],
    trustSignals: [
      'Manufacturer-trained technicians',
      'Genuine spare parts used',
      'Repair warranty provided',
      'No fix, no fee available',
    ],
}
