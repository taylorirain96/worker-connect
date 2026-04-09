import type { JobRecommendation, RecommendationFeedback } from '@/types'

const MOCK_RECOMMENDATIONS: JobRecommendation[] = [
  {
    id: 'rec1', jobId: 'job1', title: 'Emergency Pipe Repair', employer: 'HomeOwners Inc',
    budget: 450, location: 'Brooklyn, NY', category: 'Plumbing',
    skills: ['Plumbing', 'Emergency Repairs', 'Pipe Fitting'],
    score: 94,
    breakdown: { skills: 95, rating: 90, location: 95, availability: 100, specialization: 88 },
    postedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    expiresAt: new Date(Date.now() + 24 * 3600000).toISOString(),
  },
  {
    id: 'rec2', jobId: 'job2', title: 'Kitchen Renovation Electrical', employer: 'Renovate Pro',
    budget: 1200, location: 'Manhattan, NY', category: 'Electrical',
    skills: ['Electrical', 'Wiring', 'Panel Upgrades'],
    score: 87,
    breakdown: { skills: 88, rating: 90, location: 80, availability: 90, specialization: 85 },
    postedAt: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
  {
    id: 'rec3', jobId: 'job3', title: 'HVAC System Installation', employer: 'Climate Control Co',
    budget: 2800, location: 'Queens, NY', category: 'HVAC',
    skills: ['HVAC', 'Installation', 'Refrigerant Handling'],
    score: 82,
    breakdown: { skills: 80, rating: 90, location: 85, availability: 75, specialization: 80 },
    postedAt: new Date(Date.now() - 8 * 3600000).toISOString(),
  },
  {
    id: 'rec4', jobId: 'job4', title: 'Deck Construction Project', employer: 'BuildRight LLC',
    budget: 3500, location: 'Staten Island, NY', category: 'Carpentry',
    skills: ['Carpentry', 'Deck Building', 'Wood Finishing'],
    score: 78,
    breakdown: { skills: 75, rating: 90, location: 70, availability: 80, specialization: 75 },
    postedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
  },
  {
    id: 'rec5', jobId: 'job5', title: 'Interior Painting (4 rooms)', employer: 'Bright Spaces',
    budget: 960, location: 'Bronx, NY', category: 'Painting',
    skills: ['Painting', 'Interior Design', 'Color Consultation'],
    score: 72,
    breakdown: { skills: 70, rating: 85, location: 75, availability: 60, specialization: 70 },
    postedAt: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
]

export async function getJobRecommendations(_workerId: string): Promise<JobRecommendation[]> {
  await new Promise((r) => setTimeout(r, 300))
  return MOCK_RECOMMENDATIONS
}

export async function storeFeedback(_feedback: RecommendationFeedback): Promise<void> {
  await new Promise((r) => setTimeout(r, 100))
  // TODO: persist to Firestore
}

export async function getPersonalizedRecommendations(workerId: string): Promise<JobRecommendation[]> {
  const all = await getJobRecommendations(workerId)
  return all.sort((a, b) => b.score - a.score)
}
