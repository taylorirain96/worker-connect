export function calculateCompletionRate(assignedJobs: number, completedJobs: number): number {
  if (assignedJobs === 0) return 0
  return Math.min(100, Math.max(0, Math.round((completedJobs / assignedJobs) * 100)))
}

export function getCompletionLabel(rate: number): { label: string; color: string } {
  if (rate >= 95) return { label: 'Elite Pro', color: 'text-yellow-600' }
  if (rate >= 85) return { label: 'Reliable Pro', color: 'text-green-600' }
  if (rate >= 70) return { label: 'Good', color: 'text-blue-600' }
  if (rate >= 50) return { label: 'Building Up', color: 'text-orange-500' }
  return { label: 'Job-Hopper', color: 'text-red-500' }
}

export function isRelocationReady(completionRate: number, targetCitySet: boolean): boolean {
  return targetCitySet && completionRate >= 80
}
