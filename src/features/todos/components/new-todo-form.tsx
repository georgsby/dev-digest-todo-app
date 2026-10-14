import { zodResolver } from "@hookform/resolvers/zod"
import { PlusIcon } from "lucide-react"
import { Controller, useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { todayISO } from "../dates"
import { newTodoSchema, PRIORITIES, PRIORITY_LABELS, type NewTodoValues } from "../schema"
import { PrioritySwatch } from "./priority-swatch"

const DEFAULT_VALUES: NewTodoValues = { title: "", priority: "medium", dueDate: "" }

export function NewTodoForm({ onAdd }: { onAdd: (values: NewTodoValues) => void }) {
  const form = useForm({
    resolver: zodResolver(newTodoSchema),
    defaultValues: DEFAULT_VALUES,
  })

  const onSubmit = (values: NewTodoValues) => {
    onAdd(values)
    // Keep the chosen priority: people tend to add a few similar tasks in a row.
    form.reset({ ...DEFAULT_VALUES, priority: values.priority })
    form.setFocus("title")
  }

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
      className="rounded-2xl border bg-card p-4 shadow-[0_1px_0_var(--rule),0_12px_32px_-20px_rgb(28_36_51/0.35)] sm:p-5"
    >
      <Controller
        name="title"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="new-todo-title" className="sr-only">
              Task
            </FieldLabel>
            <Input
              {...field}
              id="new-todo-title"
              autoComplete="off"
              placeholder="What needs doing?"
              aria-invalid={fieldState.invalid}
              className="h-11 rounded-none border-0 border-b-2 border-rule bg-transparent px-0 font-heading text-xl shadow-none focus-visible:border-ring focus-visible:ring-0 aria-invalid:border-destructive aria-invalid:ring-0 md:text-xl dark:bg-transparent"
            />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />

      <div className="mt-4 flex flex-wrap items-start gap-3">
        <Controller
          name="priority"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="min-w-0 flex-1 gap-1.5 sm:w-36 sm:flex-none">
              <FieldLabel htmlFor="new-todo-priority" className="text-xs text-muted-foreground">
                Priority
              </FieldLabel>
              <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="new-todo-priority" className="h-9 w-full" onBlur={field.onBlur}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>
                      <PrioritySwatch priority={p} />
                      {PRIORITY_LABELS[p]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
        />

        <Controller
          name="dueDate"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="min-w-0 flex-1 gap-1.5 sm:w-44 sm:flex-none">
              <FieldLabel htmlFor="new-todo-due" className="text-xs text-muted-foreground">
                Due date <span className="font-normal">(optional)</span>
              </FieldLabel>
              <Input
                {...field}
                id="new-todo-due"
                type="date"
                min={todayISO()}
                aria-invalid={fieldState.invalid}
                className="h-9"
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Button type="submit" size="lg" className="h-9 w-full px-4 sm:mt-5.5 sm:ml-auto sm:w-auto">
          <PlusIcon data-icon="inline-start" />
          Add task
        </Button>
      </div>
    </form>
  )
}
