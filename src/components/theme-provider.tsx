import { useEffect, useMemo, useState, useSyncExternalStore } from "react"

import { THEME_STORAGE_KEY, ThemeContext, type Theme } from "./theme-context"

// index.html applies the stored theme before first paint; this keeps it in sync afterwards.

const darkQuery = window.matchMedia("(prefers-color-scheme: dark)")

function subscribeToSystemTheme(onChange: () => void) {
  darkQuery.addEventListener("change", onChange)
  return () => darkQuery.removeEventListener("change", onChange)
}

function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    return stored === "light" || stored === "dark" ? stored : "system"
  } catch {
    return "system"
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readStoredTheme)
  const systemDark = useSyncExternalStore(subscribeToSystemTheme, () => darkQuery.matches)
  const resolvedTheme = theme === "system" ? (systemDark ? "dark" : "light") : theme

  useEffect(() => {
    document.documentElement.classList.toggle("dark", resolvedTheme === "dark")
    document.documentElement.style.colorScheme = resolvedTheme
  }, [resolvedTheme])

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme: (next: Theme) => {
        setThemeState(next)
        try {
          if (next === "system") localStorage.removeItem(THEME_STORAGE_KEY)
          else localStorage.setItem(THEME_STORAGE_KEY, next)
        } catch {
          // Theme still applies for this session.
        }
      },
    }),
    [theme, resolvedTheme],
  )

  return <ThemeContext value={value}>{children}</ThemeContext>
}
