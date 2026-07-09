import type { ServiceDetails } from '../servicesData'

export const solarInstallationDetails: ServiceDetails = {
    priceFrom: 8000,
    priceTo: 25000,
    priceUnit: 'per system installed',
    commonJobs: [
      'Residential solar panel installation',
      'Commercial solar system installation',
      'Battery storage system installation',
      'Solar inverter replacement',
      'Grid-tie system setup',
      'Off-grid solar design & install',
    ],
    whyHire: [
      'Certified solar installers ensure grid-compliance and safety',
      'Correct system sizing maximises return on investment',
      'Knowledge of NZ net metering and buy-back rates',
      'Manufacturer warranties preserved with authorised installation',
    ],
    faqs: [
      {
        question: 'How much does solar installation cost in NZ?',
        answer:
          'A typical residential solar system in NZ costs $8,000–$20,000+ depending on system size, panels, and whether battery storage is included. A standard 5–6kW grid-tied system costs around $12,000–$18,000 installed.',
      },
      {
        question: 'How long does it take for solar to pay off in NZ?',
        answer:
          'The payback period for NZ solar installations is typically 7–12 years depending on your electricity usage, local solar resource, and whether you sell excess power back to the grid. Post-payback, savings continue for 20+ years.',
      },
      {
        question: 'Do I need council consent for solar panels in NZ?',
        answer:
          'Most residential roof-mounted solar installations are permitted as of right and don\'t require building consent. However, large commercial systems or ground-mounted arrays may need consent. Your installer will advise.',
      },
      {
        question: 'Can I sell solar power back to the grid in NZ?',
        answer:
          'Yes. Most NZ power retailers offer buy-back rates (typically 8–17c/kWh) for excess solar exported to the grid. Rates vary by retailer — shop around to maximise your export earnings.',
      },
    ],
    trustSignals: [
      'MCS-equivalent certified installers',
      'Grid-connection approved',
      'Manufacturer warranty preserved',
      '25-year panel performance warranty',
    ],
}
