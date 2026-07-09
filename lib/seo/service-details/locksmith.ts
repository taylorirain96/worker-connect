import type { ServiceDetails } from '../servicesData'

export const locksmithDetails: ServiceDetails = {
    priceFrom: 80,
    priceTo: 200,
    priceUnit: 'per job',
    commonJobs: [
      'Lockout & door opening',
      'Lock change or rekey',
      'Deadbolt installation',
      'Safe opening',
      'Key cutting & duplication',
      'Security assessment',
    ],
    whyHire: [
      'Fast response for lockouts — often within 30–60 minutes',
      'No damage to doors when professionally opened',
      'Expert advice on home security upgrades',
      'Key control systems to restrict unauthorised copying',
    ],
    faqs: [
      {
        question: 'How much does a locksmith cost in NZ?',
        answer:
          'Standard locksmith jobs in NZ cost $80–$200. Emergency lockout call-outs typically have a higher fee of $150–$300+ depending on time of day and location.',
      },
      {
        question: 'How quickly can a locksmith get to me?',
        answer:
          'Most mobile locksmiths can respond within 30–90 minutes in urban areas. Response times may be longer in rural regions.',
      },
      {
        question: 'What should I do if I\'m locked out of my house?',
        answer:
          'Call a local QuickTrade locksmith — do not attempt to force entry as this can damage doors and frames. Have proof of residence ready (such as ID showing your address) when the locksmith arrives.',
      },
      {
        question: 'Can a locksmith rekey my locks after moving into a new home?',
        answer:
          'Yes, rekeying is a cost-effective option that changes the lock mechanism so old keys no longer work. It\'s cheaper than full lock replacement and is recommended when moving into a new property.',
      },
    ],
    trustSignals: [
      'Licensed & insured locksmiths',
      'Police-vetted professionals',
      'No call-out damage guarantee',
      '24/7 emergency availability',
    ],
}
