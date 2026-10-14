/** Local calendar date as YYYY-MM-DD (the format of <input type="date">). */
export function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function todayISO(): string {
  return toISODate(new Date())
}

function fromISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(y, m - 1, d)
}

const DAY_MS = 24 * 60 * 60 * 1000

export type DueState = "overdue" | "today" | "soon" | "later"

export function describeDue(iso: string): { label: string; state: DueState } {
  const today = fromISODate(todayISO())
  const due = fromISODate(iso)
  const days = Math.round((due.getTime() - today.getTime()) / DAY_MS)

  if (days < 0) {
    return { label: days === -1 ? "Due yesterday" : `${-days} days overdue`, state: "overdue" }
  }
  if (days === 0) return { label: "Due today", state: "today" }
  if (days === 1) return { label: "Due tomorrow", state: "soon" }

  const sameYear = due.getFullYear() === today.getFullYear()
  const formatted = due.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: sameYear ? undefined : "numeric",
  })
  return { label: `Due ${formatted}`, state: days <= 7 ? "soon" : "later" }
}

export function formatLongDate(date: Date): string {
  return date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })
}
