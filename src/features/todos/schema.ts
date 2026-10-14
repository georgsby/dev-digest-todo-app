import { z } from "zod"

import { todayISO } from "./dates"

export const PRIORITIES = ["low", "medium", "high"] as const
export const prioritySchema = z.enum(PRIORITIES)
export type Priority = z.infer<typeof prioritySchema>

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
}

/** Shape persisted to localStorage. Parsed on load so corrupted data is dropped, not rendered. */
export const todoSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  priority: prioritySchema,
  dueDate: z.iso.date().nullable(),
  completed: z.boolean(),
  createdAt: z.number(),
})
export type Todo = z.infer<typeof todoSchema>

export const todoListSchema = z.array(todoSchema)

const titleSchema = z
  .string()
  .trim()
  .min(1, "Write what needs doing")
  .max(120, "Keep it under 120 characters")

export const newTodoSchema = z.object({
  title: titleSchema,
  priority: prioritySchema,
  // Native date inputs report "" when cleared.
  dueDate: z
    .union([z.literal(""), z.iso.date()])
    .refine((value) => value === "" || value >= todayISO(), "Pick today or a later date"),
})
export type NewTodoValues = z.infer<typeof newTodoSchema>

export const editTodoSchema = z.object({ title: titleSchema })
export type EditTodoValues = z.infer<typeof editTodoSchema>
