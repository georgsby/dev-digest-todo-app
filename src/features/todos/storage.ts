import { todoListSchema, type Todo } from "./schema"

export const STORAGE_KEY = "dev-digest-todos:v1"

export function loadTodos(): Todo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = todoListSchema.safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data : []
  } catch {
    return []
  }
}

export function saveTodos(todos: Todo[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  } catch {
    // Storage can be full or blocked (private mode); the in-memory list still works.
  }
}
