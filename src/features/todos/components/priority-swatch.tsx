import { cn } from "@/lib/utils"

import type { Priority } from "../schema"

const SWATCH: Record<Priority, string> = {
  low: "bg-hl-low",
  medium: "bg-hl-medium",
  high: "bg-hl-high",
}

/** A short highlighter stroke in the priority's colour. */
export function PrioritySwatch({ priority, className }: { priority: Priority; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("inline-block h-2.5 w-4 shrink-0 -rotate-6 rounded-[3px]", SWATCH[priority], className)}
    />
  )
}
