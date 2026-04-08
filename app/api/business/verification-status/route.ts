import { NextResponse } from 'next/server'
import type { BusinessVerification } from '@/types'

// Mock data — replace with Firestore fetch once DB is connected
const MOCK_VERIFICATION: BusinessVerification = {
  id: 'v1',
  businessId: 'b1',
  license: {
    licenseNumber: 'GC-445821-NY',
    licenseType: 'General Contractor',
    state: 'New York',
    expirationDate: '2026-12-31',
    verified: true,
    verifiedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  insurance: {
    hasGeneralLiability: true,
    generalLiabilityPolicyNumber: 'GL-20240101-XYZ',
    generalLiabilityExpiration: '2026-01-01',
    generalLiabilityCoverage: 2000000,
    hasWorkersComp: true,
    workersCompPolicyNumber: 'WC-20240101-ABC',
    workersCompExpiration: '2026-01-01',
    verified: true,
    verifiedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  },
  backgroundCheck: {
    status: 'clear',
    provider: 'Checkr',
    completedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 275 * 24 * 60 * 60 * 1000).toISOString(),
  },
  externalRatings: {
    bbbNumber: '0012345',
    bbbLink: 'https://www.bbb.org/us/ny/new-york/profile/general-contractor/apex-gc',
    bbbRating: 'A+',
    bbbReviewCount: 42,
    googleProfileLink: 'https://g.page/apex-general-contracting',
    googleRating: 4.8,
    googleReviewCount: 134,
    lastSyncedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  certifications: [
    {
      id: 'c1',
      name: 'OSHA 30',
      issuingOrganization: 'OSHA',
      certificateNumber: 'OSHA30-2023-001',
      issueDate: '2023-03-15',
      expirationDate: '2028-03-15',
      verified: true,
    },
    {
      id: 'c2',
      name: 'EPA Lead-Safe',
      issuingOrganization: 'EPA',
      certificateNumber: 'EPA-LS-2022-456',
      issueDate: '2022-06-01',
      expirationDate: '2027-06-01',
      verified: true,
    },
    {
      id: 'c3',
      name: 'LEED Green Associate',
      issuingOrganization: 'USGBC',
      issueDate: '2021-09-20',
      verified: false,
    },
  ],
  trustScore: 92,
  verifiedCount: 5,
  updatedAt: new Date().toISOString(),
}

export async function GET() {
  // TODO: authenticate request and load from Firestore
  return NextResponse.json(MOCK_VERIFICATION)
}
