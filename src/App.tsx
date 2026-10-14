import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { TodoBoard } from "@/features/todos/components/todo-board"

export default function App() {
  return (
    <ThemeProvider>
      <TooltipProvider delayDuration={400}>
        <TodoBoard />
        <Toaster position="bottom-center" />
      </TooltipProvider>
    </ThemeProvider>
  )
}
