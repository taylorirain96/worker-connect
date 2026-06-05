/**
 * Minimal RFC 5545 iCalendar (.ics) builder for client-side downloads.
 *
 * Used by the upcoming-jobs calendar to let users add accepted bookings
 * (regular + instant) to Apple Calendar, Google Calendar, Outlook, etc.
 */

export interface IcsEvent {
  /** Stable unique id for the event. */
  id: string
  /** Title/summary shown in the calendar. */
  title: string
  /** ISO date 'YYYY-MM-DD' for the day of the job. */
  date: string
  /** 'HH:MM' 24h start time. */
  time: string
  /** Duration in hours (decimals OK). Defaults to 1. */
  durationHours?: number
  /** Free-form description (will be escaped). */
  description?: string
  /** Street address shown as LOCATION. */
  location?: string
  /** Minutes before the event a reminder VALARM should fire. Defaults to 30. Set to 0 to disable. */
  reminderMinutesBefore?: number
}

const CRLF = '\r\n'

function pad(n: number): string {
  return n.toString().padStart(2, '0')
}

/** Formats a Date as a UTC ICS timestamp: YYYYMMDDTHHMMSSZ. */
function toIcsUtc(d: Date): string {
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    'T' +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    'Z'
  )
}

/** Escapes text per RFC 5545 (commas, semicolons, backslashes, newlines). */
function escapeText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
}

function buildEvent(ev: IcsEvent): string {
  // Treat the supplied date+time as the user's local wall-clock time.
  const [y, m, d] = ev.date.split('-').map(Number)
  const [hh, mm] = ev.time.split(':').map(Number)
  const start = new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0, 0)
  const durationMs = Math.max(0.25, ev.durationHours ?? 1) * 60 * 60 * 1000
  const end = new Date(start.getTime() + durationMs)

  const lines = [
    'BEGIN:VEVENT',
    `UID:${ev.id}@worker-connect`,
    `DTSTAMP:${toIcsUtc(new Date())}`,
    `DTSTART:${toIcsUtc(start)}`,
    `DTEND:${toIcsUtc(end)}`,
    `SUMMARY:${escapeText(ev.title)}`,
  ]
  if (ev.location) lines.push(`LOCATION:${escapeText(ev.location)}`)
  if (ev.description) lines.push(`DESCRIPTION:${escapeText(ev.description)}`)
  const reminder = ev.reminderMinutesBefore ?? 30
  if (reminder > 0) {
    lines.push(
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${escapeText(ev.title)}`,
      `TRIGGER:-PT${reminder}M`,
      'END:VALARM',
    )
  }
  lines.push('END:VEVENT')
  return lines.join(CRLF)
}

/** Builds a full VCALENDAR string from one or more events. */
export function buildIcs(events: IcsEvent[]): string {
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Worker Connect//Upcoming Jobs//EN',
    'CALSCALE:GREGORIAN',
    ...events.map(buildEvent),
    'END:VCALENDAR',
  ].join(CRLF)
}

/** Triggers a browser download of the .ics file. No-op outside the browser. */
export function downloadIcs(events: IcsEvent[], filename = 'worker-connect.ics'): void {
  if (typeof window === 'undefined' || events.length === 0) return
  const blob = new Blob([buildIcs(events)], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
