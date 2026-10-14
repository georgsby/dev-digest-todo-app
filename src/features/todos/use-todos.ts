import { useCallback, useEffect, useState } from "react"

import type { NewTodoValues, Todo } from "./schema"
import { loadTodos, saveTodos, STORAGE_KEY } from "./storage"

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>(loadTodos)

  useEffect(() => {
    saveTodos(todos)
  }, [todos])

  // Keep multiple open tabs in sync.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) setTodos(loadTodos())
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  const addTodo = useCallback((values: NewTodoValues) => {
    const todo: Todo = {
      id: crypto.randomUUID(),
      title: values.title,
      priority: values.priority,
      dueDate: values.dueDate || null,
      completed: false,
      createdAt: Date.now(),
    }
    setTodos((prev) => [todo, ...prev])
  }, [])

  const toggleTodo = useCallback((id: string) => {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)))
  }, [])

  const renameTodo = useCallback((id: string, title: string) => {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, title } : t)))
  }, [])

  const removeTodo = useCallback((id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id))
  }, [])

  /** Puts a removed todo back at its original position (used by undo). */
  const restoreTodo = useCallback((todo: Todo, index: number) => {
    setTodos((prev) => {
      if (prev.some((t) => t.id === todo.id)) return prev
      const next = [...prev]
      next.splice(Math.min(index, next.length), 0, todo)
      return next
    })
  }, [])

  const clearCompleted = useCallback(() => {
    setTodos((prev) => prev.filter((t) => !t.completed))
  }, [])

  return { todos, addTodo, toggleTodo, renameTodo, removeTodo, restoreTodo, clearCompleted }
}
