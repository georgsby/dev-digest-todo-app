# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Vite dev server (http://localhost:5173)
- `npm run build` — type-check (`tsc -b`) then production build
- `npm run preview` — serve the production build from `dist/`
- `npm run lint` — oxlint (not ESLint); config in `.oxlintrc.json`. The three `only-export-components` warnings in `src/components/ui/` (badge, button, tabs) come from shadcn-generated files and are expected.
- `npx shadcn@latest add <component>` — add a shadcn/ui component into `src/components/ui/`

There is no test runner set up yet.

This folder has no git repo of its own: it is tracked by the parent `projects/` repository.

## Stack

React 19, TypeScript 6 (`baseUrl` is deprecated, so the `@/*` → `src/*` alias is set via `paths` only, and mirrored in `vite.config.ts`), Vite 8, Tailwind CSS v4 (via `@tailwindcss/vite`, no `tailwind.config`), shadcn/ui (`radix-nova` style, Radix primitives from the `radix-ui` umbrella package), zod v4, react-hook-form 7 with `@hookform/resolvers`. No backend: data lives in `localStorage`.

## Architecture

- `src/features/todos/` holds the whole feature:
  - `schema.ts` — zod schemas are the source of truth for types. `todoSchema` describes the persisted shape; `newTodoSchema` / `editTodoSchema` are form schemas. Derive types with `z.infer`, don't hand-write them.
  - `storage.ts` — reads/writes `localStorage` key `dev-digest-todos:v1`. Loaded data is validated with `todoListSchema.safeParse`; invalid data falls back to an empty list. Bump the key version if the persisted shape changes incompatibly.
  - `dates.ts` — due dates are stored as local-calendar `YYYY-MM-DD` strings (the `<input type="date">` format) and compared as strings. Use these helpers rather than `new Date("YYYY-MM-DD")`, which parses as UTC and can shift the day.
  - `use-todos.ts` — the only place todo state is mutated. Persists on every change and syncs across tabs via the `storage` event.
  - `components/` — `todo-board.tsx` is the feature root (header, form, filter tabs, list); forms use react-hook-form + `zodResolver` with shadcn `Field`/`FieldError` via `Controller`.
- Theming is a custom provider (`src/components/theme-provider.tsx` + `theme-context.ts`), not `next-themes` (its inline `<script>` triggers React 19 errors in a client-only app). An inline script in `index.html` applies the `dark` class before first paint; keep it in sync with the provider's storage key (`theme`).
- oxlint's `react(refs)` and `react(purity)` rules flag reading `ref.current` or calling impure functions like `new Date()` during render, including inside option objects passed to `register()`. Use a lazy `useState` initializer or move the work into an event handler.
- `src/components/ui/` is shadcn-generated code. shadcn now imports `cn` from the `cn` package (shadcn's replacement for clsx + tailwind-merge); `@/lib/utils` re-exports it.

## Design system

Defined in `src/index.css`: cool "paper" background, navy "ink" foreground, and three highlighter colours (`--hl-low`, `--hl-medium`, `--hl-high`, exposed as `bg-hl-*`) that encode task priority. The `.highlighter` class sweeps a marker stroke across text when `data-done="true"`; set `--hl` per element to pick the colour. Fonts: Bricolage Grotesque (`font-heading`) and Instrument Sans (`font-sans`), self-hosted via `@fontsource-variable`.
