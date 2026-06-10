import { format } from "date-fns"

function safeDate(value: string | Date): Date | null {
  const d = value instanceof Date ? value : new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

export function formatEventDateTime(date: string | Date): string {
  const d = safeDate(date)
  return d ? format(d, "MMM d, yyyy 'at' h:mm a") : "TBD"
}

export function formatEventDate(date: string | Date): string {
  const d = safeDate(date)
  return d ? format(d, "EEEE, MMMM d, yyyy") : "TBD"
}

export function formatEventTime(date: string | Date): string {
  const d = safeDate(date)
  return d ? format(d, "h:mm a") : "TBD"
}

export function getEventDuration(start: string | Date, end: string | Date): string {
  const s = safeDate(start)
  const e = safeDate(end)
  if (!s || !e) return "TBD"
  const diffMs = e.getTime() - s.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  if (diffHours === 0) return `${diffMinutes} min`
  if (diffMinutes === 0) return `${diffHours} hr`
  return `${diffHours} hr ${diffMinutes} min`
}
