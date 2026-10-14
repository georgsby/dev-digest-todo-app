import { CheckCheckIcon, ListTodoIcon, SparklesIcon } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import { ThemeToggle } from "@/components/theme-toggle"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { formatLongDate } from "../dates"
import type { Todo } from "../schema"
import { useTodos } from "../use-todos"
import { NewTodoForm } from "./new-todo-form"
import { TodoItem } from "./todo-item"

type Filter = "all" | "active" | "done"

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "To do" },
  { value: "done", label: "Done" },
]

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`

export function TodoBoard() {
  const { todos, addTodo, toggleTodo, renameTodo, removeTodo, restoreTodo, clearCompleted } =
    useTodos()
  const [filter, setFilter] = useState<Filter>("all")
  const [today] = useState(() => formatLongDate(new Date()))

  // Unfinished tasks first; within each group keep the stored (newest-first) order.
  const sorted = useMemo(
    () => [...todos].sort((a, b) => Number(a.completed) - Number(b.completed)),
    [todos],
  )
  const doneCount = todos.filter((t) => t.completed).length
  const leftCount = todos.length - doneCount
  const counts: Record<Filter, number> = { all: todos.length, active: leftCount, done: doneCount }
  const visible: Record<Filter, Todo[]> = {
    all: sorted,
    active: sorted.filter((t) => !t.completed),
    done: sorted.filter((t) => t.completed),
  }

  const allClear = todos.length > 0 && leftCount === 0
  const headline =
    todos.length === 0 ? "A clean slate" : allClear ? "All clear" : `${plural(leftCount, "thing")} left`

  const handleRemove = (todo: Todo) => {
    const index = todos.findIndex((t) => t.id === todo.id)
    removeTodo(todo.id)
    toast("Task deleted", {
      description: todo.title,
      action: { label: "Undo", onClick: () => restoreTodo(todo, index) },
    })
  }

  const handleClearCompleted = () => {
    clearCompleted()
    toast.success(`Cleared ${plural(doneCount, "finished task")}`)
  }

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-2xl flex-col px-4 pt-10 pb-16 sm:px-6 sm:pt-16">
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{today}</p>
          <h1
            aria-live="polite"
            className="mt-2 font-heading text-5xl leading-[0.95] font-bold tracking-[-0.035em] sm:text-7xl"
          >
            <span
              className="highlighter"
              data-done={allClear}
              style={{ "--hl": "var(--hl-low)" } as React.CSSProperties}
            >
              {headline}
            </span>
          </h1>
        </div>
        <ThemeToggle />
      </header>

      {todos.length > 0 && (
        <div className="mt-6 flex items-center gap-3">
          <Progress
            value={(doneCount / todos.length) * 100}
            aria-label="Tasks done"
            className="h-1.5 max-w-xs bg-muted"
          />
          <span className="shrink-0 text-sm text-muted-foreground tabular-nums">
            {doneCount} of {todos.length} done
          </span>
        </div>
      )}

      <div className="mt-8">
        <NewTodoForm onAdd={addTodo} />
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)} className="mt-10 gap-3">
        <div className="flex items-center justify-between gap-3">
          <TabsList>
            {FILTERS.map(({ value, label }) => (
              <TabsTrigger key={value} value={value} className="gap-1.5 px-3">
                {label}
                <span className="text-xs text-muted-foreground tabular-nums">{counts[value]}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {doneCount > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  Clear done
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear {plural(doneCount, "finished task")}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    They'll be removed from this browser for good. Unfinished tasks stay put.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep them</AlertDialogCancel>
                  <AlertDialogAction variant="destructive" onClick={handleClearCompleted}>
                    Clear tasks
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {FILTERS.map(({ value }) => (
          <TabsContent key={value} value={value}>
            <div className="overflow-hidden rounded-2xl border bg-card">
              {visible[value].length > 0 ? (
                <ul>
                  {visible[value].map((todo) => (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      onToggle={toggleTodo}
                      onRename={renameTodo}
                      onRemove={handleRemove}
                    />
                  ))}
                </ul>
              ) : (
                <EmptyState filter={value} hasTodos={todos.length > 0} />
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <p className="mt-auto pt-12 text-center text-xs text-muted-foreground">
        Your tasks are saved in this browser only.
      </p>
    </div>
  )
}

function EmptyState({ filter, hasTodos }: { filter: Filter; hasTodos: boolean }) {
  const content =
    !hasTodos
      ? { icon: ListTodoIcon, title: "Nothing on your list", description: "Add a task above to get started." }
      : filter === "active"
        ? { icon: SparklesIcon, title: "Nothing left to do", description: "Every task on your list is done." }
        : { icon: CheckCheckIcon, title: "No finished tasks yet", description: "Tick a task off and it shows up here." }
  const Icon = content.icon

  return (
    <Empty className="py-12">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon />
        </EmptyMedia>
        <EmptyTitle>{content.title}</EmptyTitle>
        <EmptyDescription>{content.description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
