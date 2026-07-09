import type { ServiceDetails } from '../servicesData'

export const insulationDetails: ServiceDetails = {
    priceFrom: 1500,
    priceTo: 6000,
    priceUnit: 'per home',
    commonJobs: [
      'Ceiling insulation installation',
      'Underfloor insulation installation',
      'Wall insulation (retrofit)',
      'Healthy Homes compliance assessment',
      'Insulation top-up',
      'Vapour barrier installation',
    ],
    whyHire: [
      'Mandatory for rental properties under NZ Healthy Homes Standards',
      'Significantly reduces heating costs year-round',
      'Correct R-values specified for each NZ climate zone',
      'Professional installation avoids gaps and compression that reduce effectiveness',
    ],
    faqs: [
      {
        question: 'How much does insulation cost in NZ?',
        answer:
          'Ceiling insulation typically costs $1,500–$3,500 for an average NZ home. Underfloor insulation adds $1,500–$3,000. Combined ceiling and underfloor packages often cost $3,000–$6,000. Government subsidies may be available through Warmer Kiwi Homes.',
      },
      {
        question: 'What are the NZ Healthy Homes insulation requirements?',
        answer:
          'All rental properties in NZ must meet Healthy Homes insulation standards. Ceiling insulation must meet minimum R-values: R2.9 in Zone 1 (Northland/Auckland), R3.3 in Zone 2 (central NZ), R3.6 in Zone 3 (southern NZ and highlands). Underfloor R1.3 is required nationally where accessible.',
      },
      {
        question: 'What is the best insulation for NZ homes?',
        answer:
          'Pink Batts (glasswool), polyester, and rigid foam board are the most popular NZ insulation types. For underfloor, foil-backed polyester or glasswool batts are standard. Each has different R-values, cost points, and installation requirements.',
      },
      {
        question: 'Can I get a subsidy for insulation in NZ?',
        answer:
          'Yes. The Warmer Kiwi Homes programme offers up to 80% off insulation costs for eligible owner-occupiers. Community Service Card holders and low-income homeowners typically qualify. Check eligibility at eeca.govt.nz.',
      },
    ],
    trustSignals: [
      'Healthy Homes Standards compliance',
      'Warmer Kiwi Homes approved installers',
      'Certified R-value documentation',
      'Subsidy assistance available',
    ],
}
