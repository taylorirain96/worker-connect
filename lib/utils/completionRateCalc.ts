export function calculateCompletionRate(completed: number, total: number): number {
  if (total === 0) return 0
  return parseFloat(((completed / total) * 100).toFixed(2))
}

export function getCompletionLabel(rate: number): 'pro' | 'job_hopper' | 'standard' {
  if (rate >= 90) return 'pro'
  if (rate < 60) return 'job_hopper'
  return 'standard'
}

export function formatCompletionRate(rate: number): string {
  return `${rate}% Completion Rate`
}
