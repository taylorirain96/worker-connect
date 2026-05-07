export function toIsoDate(value: unknown, fallback: string): string {
  if (!value) return fallback
  if (typeof value === 'string') return value
  if (value instanceof Date) return value.toISOString()
  if (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in value &&
    typeof value.toDate === 'function'
  ) {
    return value.toDate().toISOString()
  }
  return fallback
}
