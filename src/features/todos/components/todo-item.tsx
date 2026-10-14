import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon, PencilIcon, Trash2Icon } from "lucide-react"
import { useState, type CSSProperties } from "react"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

import { describeDue } from "../dates"
import { editTodoSchema, PRIORITY_LABELS, type EditTodoValues, type Todo } from "../schema"
import { PrioritySwatch } from "./priority-swatch"

type TodoItemProps = {
  todo: Todo
  onToggle: (id: string) => void
  onRename: (id: string, title: string) => void
  onRemove: (todo: Todo) => void
}

export function TodoItem({ todo, onToggle, onRename, onRemove }: TodoItemProps) {
  const [editing, setEditing] = useState(false)
  const checkboxId = `todo-${todo.id}`
  const due = todo.dueDate ? describeDue(todo.dueDate) : null

  return (
    <li className="group flex items-start gap-3 border-b border-rule px-4 py-3.5 last:border-b-0 sm:px-5">
      <Checkbox
        id={checkboxId}
        checked={todo.completed}
        onCheckedChange={() => onToggle(todo.id)}
        className="mt-1 size-5 rounded-md"
        aria-label={editing ? `Mark "${todo.title}" as done` : undefined}
      />

      <div className="min-w-0 flex-1">
        {editing ? (
          <EditTitleForm
            initialTitle={todo.title}
            onSave={(title) => {
              if (title !== todo.title) onRename(todo.id, title)
              setEditing(false)
            }}
            onCancel={() => setEditing(false)}
          />
        ) : (
          <label
            htmlFor={checkboxId}
            className={cn(
              "block cursor-pointer text-[15px] leading-7 break-words",
              todo.completed && "text-muted-foreground",
            )}
          >
            <span
              className="highlighter"
              data-done={todo.completed}
              style={{ "--hl": `var(--hl-${todo.priority})` } as CSSProperties}
            >
              {todo.title}
            </span>
          </label>
        )}

        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <PrioritySwatch priority={todo.priority} className="h-2 w-3" />
            {PRIORITY_LABELS[todo.priority]} priority
          </span>
          {due && (
            <span
              className={cn(
                "inline-flex items-center gap-1",
                !todo.completed && due.state === "overdue" && "font-medium text-destructive",
                !todo.completed && due.state === "today" && "font-medium text-foreground",
              )}
            >
              <CalendarIcon className="size-3" aria-hidden />
              {due.label}
            </span>
          )}
        </div>
      </div>

      {!editing && (
        <div className="flex shrink-0 gap-0.5 transition-opacity sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
          <IconAction label="Edit task" onClick={() => setEditing(true)}>
            <PencilIcon />
          </IconAction>
          <IconAction
            label="Delete task"
            onClick={() => onRemove(todo)}
            className="hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2Icon />
          </IconAction>
        </div>
      )}
    </li>
  )
}

function IconAction({
  label,
  onClick,
  className,
  children,
}: {
  label: string
  onClick: () => void
  className?: string
  children: React.ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={label}
          onClick={onClick}
          className={cn("text-muted-foreground", className)}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

function EditTitleForm({
  initialTitle,
  onSave,
  onCancel,
}: {
  initialTitle: string
  onSave: (title: string) => void
  onCancel: () => void
}) {
  const form = useForm({
    resolver: zodResolver(editTodoSchema),
    defaultValues: { title: initialTitle } satisfies EditTodoValues,
  })
  const error = form.formState.errors.title
  const submit = form.handleSubmit(({ title }) => onSave(title))

  return (
    <form noValidate onSubmit={submit}>
      <Input
        {...form.register("title", { onBlur: () => void submit() })}
        autoFocus
        autoComplete="off"
        aria-label="Task title"
        aria-invalid={!!error}
        aria-describedby={error ? "edit-title-error" : "edit-title-hint"}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault()
            // Escape unmounts the input, which can fire a blur-save; make that save a no-op.
            form.setValue("title", initialTitle)
            onCancel()
          }
        }}
        className="-my-0.5 h-8 text-[15px]"
      />
      {error ? (
        <p id="edit-title-error" role="alert" className="mt-1 text-xs text-destructive">
          {error.message}
        </p>
      ) : (
        <p id="edit-title-hint" className="mt-1 text-xs text-muted-foreground">
          Enter to save, Esc to cancel
        </p>
      )}
    </form>
  )
}
