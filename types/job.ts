import type { Country, UserProfile } from './user'

export interface DirectRequest {
  id: string
  homeownerId: string
  homeownerName: string
  homeownerEmail: string
  workerId: string
  workerName: string
  workerEmail: string
  description: string
  date: string
  address: string
  status: 'pending' | 'accepted' | 'declined'
  createdAt: string
  updatedAt: string
}

export type JobCategory =
  | 'plumbing'
  | 'electrical'
  | 'carpentry'
  | 'hvac'
  | 'roofing'
  | 'landscaping'
  | 'painting'
  | 'flooring'
  | 'cleaning'
  | 'moving'
  | 'jib_stopping'
  | 'general'
  | 'apprenticeship'
  | 'training'

export interface Job {
  id: string
  title: string
  description: string
  category: JobCategory
  employerId: string
  employerName: string
  employerAvatar?: string
  location: string
  budget: number
  budgetType: 'fixed' | 'hourly'
  urgency: 'low' | 'medium' | 'high' | 'emergency'
  status: 'open' | 'in_progress' | 'completed' | 'cancelled' | 'disputed'
  skills: string[]
  applicantsCount: number
  completionCount?: number
  totalEarnings?: number
  weeklyPoints?: number
  badges?: string[]
  createdAt: string
  updatedAt: string
  deadline?: string
  assignedWorkerId?: string
  images?: string[]
  /** Whether the job posting fee has been paid (draft = unpaid, active = live, expired = listing period ended) */
  paymentStatus?: 'draft' | 'active' | 'expired'
  /** Type of job — 'employment' = staff role posted by employer, 'gig' = one-off task posted by homeowner */
  jobType?: 'employment' | 'gig'
  /** Reference to the job posting payment record */
  postingPaymentId?: string
  /** Whether the job has a featured listing upsell */
  featuredListing?: boolean
  /** Whether the job has an urgent badge upsell */
  urgentBadge?: boolean
  /** ISO timestamp when the job was activated (posting fee paid) */
  activatedAt?: string
  /** ID of the current escrow payment record */
  escrowId?: string
  /** Current escrow status */
  escrowStatus?: 'pending' | 'pending_deposit' | 'held' | 'in_escrow' | 'released' | 'disputed' | 'refunded'
  /** Workflow stage for escrow-backed jobs */
  workflowStage?: 'posted' | 'accepted' | 'deposit_secure' | 'job_in_progress' | 'sign_off_pending' | 'completed' | 'funds_released'
  /** ISO timestamp when the job was marked as completed */
  completedAt?: string
  /** ISO timestamp when the worker asked the homeowner to sign off completion */
  completionRequestedAt?: string
  /** UID of the worker who requested completion sign-off */
  completionRequestedBy?: string
  /** ISO timestamp after which admin can be alerted for no homeowner response */
  adminNotifyAfter?: string
  /** ISO deadline (completedAt + 24h) within which the worker may dispute completion */
  workerDisputeDeadline?: string
  /** Country the job is located in */
  country?: Country
  /** Whether this job recurs automatically */
  recurring?: boolean
  /** How often to re-create this job */
  recurrenceInterval?: 'weekly' | 'fortnightly' | 'monthly'
  /** ISO date of the next scheduled recurrence */
  nextRecurrenceAt?: string
  /** ID of the parent (original) recurring job */
  parentJobId?: string
  /** Worker UIDs who have opted out of being auto-assigned to future occurrences */
  recurringOptOutWorkerIds?: string[]
  /** Optional property linkage for property-manager posted jobs */
  propertyId?: string
  /** Whether the employer/homeowner has already left a review for the worker on this job */
  reviewLeft?: boolean
  /** Whether the assigned worker has already left a review for the employer on this job */
  workerReviewLeft?: boolean
  /**
   * Employer-set flag indicating this posting is Mover Mode-friendly
   * (open to relocating workers, FIFO, or out-of-region applicants).
   * Surfaces the job in Mover Mode opportunity feeds even when the
   * location string doesn't match a worker's targetRelocationCity,
   * and grants a +10 "Premium match" bonus in mover scoring.
   */
  relocationFriendly?: boolean
}

export interface Application {
  id: string
  jobId: string
  jobTitle: string
  workerId: string
  workerName: string
  workerAvatar?: string
  employerId: string
  coverLetter: string
  proposedRate: number
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
  createdAt: string
  updatedAt: string
}

export interface JobLocation {
  city: string
  state: string
  coordinates: [number, number]
  remote: boolean
}

export interface MatchedJob extends Job {
  matchScore: number
  matchReasons: string[]
  isRemote: boolean
  distanceKm?: number
}

export interface JobApplication {
  id: string
  jobId: string
  jobTitle?: string
  employerId?: string
  employerName?: string
  workerId: string
  workerName?: string
  workerPhotoURL?: string
  workerRating?: number
  workerVerified?: boolean
  workerBackgroundCheckStatus?: UserProfile['backgroundCheckStatus']
  workerWorksafeComplete?: boolean
  coverLetter?: string
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
  appliedAt: string
  updatedAt?: string
  respondedAt?: string
  rejectionReason?: string
}

export interface WorkerMatchProfile {
  workerId: string
  skills: string[]
  hourlyRate: number
  reputation: number
  completionRate: number
  location: { city: string; state: string; coordinates: [number, number] }
  availability: 'full_time' | 'part_time' | 'contract'
  moverMode?: {
    targetCity: string
    relocationReadiness: number
    active: boolean
  }
}

export interface Quote {
  id: string
  jobId: string
  jobTitle: string
  employerId: string
  workerId: string
  workerName: string
  workerAvatar?: string
  workerVerified?: boolean
  basePrice: number
  laborHours?: number
  laborRate?: number
  materials?: { description: string; cost: number }[]
  travel?: { distance: number; cost: number }
  tax?: number
  totalPrice: number
  description: string
  timeline?: string
  availability?: string
  conditions?: string
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'countered'
  expiresAt: string
  createdAt: string
  updatedAt: string
  acceptedAt?: string
  attachments?: { url: string; name: string; type: 'image' | 'document' }[]
  counterOfferPrice?: number
  counterOfferNote?: string
  counterOfferAt?: string
  /** Up to 3 portfolio photos attached as "examples of my work" */
  portfolioPhotos?: { id: string; url: string; title: string }[]
}

export interface QuoteRequest {
  jobId: string
  jobTitle: string
  employerId: string
  requestMessage?: string
  createdAt: string
}

export type MilestoneStatus = 'pending' | 'in_progress' | 'submitted' | 'approved' | 'rejected'

/**
 * A billing milestone on a job.
 * Stored at: jobs/{jobId}/milestones/{milestoneId}
 */
export interface JobMilestone {
  id: string
  jobId: string
  /** Human-readable title, e.g. "Frame & rough-in" */
  title: string
  description?: string
  /** Amount to release to the worker on approval (NZD) */
  amount: number
  /** 0-100 — what percentage of total job value this milestone represents */
  percentage: number
  status: MilestoneStatus
  /** Expected completion date */
  dueDate?: string
  /** ISO timestamp when the worker submitted the milestone for approval */
  submittedAt?: string
  /** ISO timestamp when the employer approved the milestone */
  approvedAt?: string
  /** Stripe Transfer ID created when this milestone was paid out */
  stripeTransferId?: string
  /** Message left by the worker when submitting */
  submissionNote?: string
  /** Message left by the employer when approving or rejecting */
  reviewNote?: string
  /** URLs of photos attached to the submission */
  submissionPhotos?: string[]
  /** Order index for display */
  order: number
  createdAt: string
  updatedAt: string
}

/**
 * A progress update posted by the worker during an active job.
 * Stored at: jobs/{jobId}/progressUpdates/{updateId}
 */
export interface JobProgressUpdate {
  id: string
  jobId: string
  workerId: string
  workerName: string
  workerAvatar?: string
  message: string
  /** Optional photos attached to this update */
  photos?: string[]
  /** Linked milestone ID (if this update relates to a specific milestone) */
  milestoneId?: string
  createdAt: string
}

export interface QuoteTemplate {
  id: string
  workerId: string
  name: string
  basePrice: number
  laborHours: number
  laborRate: number
  materials: { description: string; cost: number }[]
  travelCost: number
  description: string
  timeline: string
  conditions: string
  createdAt: string
  updatedAt: string
}

export interface JobTemplate {
  id: string
  /** Human-friendly name for this template, e.g. "Monthly lawn mow" */
  name: string
  title: string
  description: string
  category: string
  location: string
  budgetMin: number
  budgetMax: number
  budgetType: 'fixed' | 'hourly'
  urgency: 'low' | 'medium' | 'high' | 'emergency'
  skills: string
  createdAt: string
  updatedAt: string
}

export interface RecurringJobSchedule {
  jobId: string
  employerId: string
  interval: 'weekly' | 'fortnightly' | 'monthly'
  nextRunAt: string
  lastRunAt?: string
  active: boolean
  totalRuns: number
  createdAt: string
  updatedAt: string
}
