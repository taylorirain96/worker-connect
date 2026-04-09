// types/dispute.ts

export type DisputeStatus = 'pending' | 'reviewing' | 'resolved';

export interface DisputeAppeal {
  id: string;
  userId: string;
  ratingId: string;
  originalRating: number;
  reason: string;
  evidenceUrls: string[];
  status: DisputeStatus;
  createdAt: string; // ISO timestamp
}
