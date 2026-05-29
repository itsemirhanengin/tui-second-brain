# Contributing to TUI Second Brain

Thank you for considering contributing to TUI Second Brain! This document provides guidelines and information to help you get started.

## Table of Contents

- [Development Setup](#development-setup)
- [Architecture Overview](#architecture-overview)
- [Code Style](#code-style)
- [Making Changes](#making-changes)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Reporting Issues](#reporting-issues)

## Development Setup

### Prerequisites

- [Bun](https://bun.sh) v1.1+
- A terminal with Unicode support (for icons and box drawing characters)

### Getting Started

```bash
git clone https://github.com/your-username/tui-second-brain.git
cd tui-second-brain
bun install
bun dev
```

The `bun dev` command starts the app with file watching — changes are reflected on restart.

### Database

The app creates its database at `~/.tui-second-brain/brain.db` on first run. During development, you can reset the database by deleting this file — it will be recreated with default seeds on next startup.

## Architecture Overview

### Layers

```
UI Components (React + OpenTUI)
       ↓ reads from
Zustand Stores (reactive state)
       ↓ wraps
SQLite Stores (*Store.ts — raw DB access)
       ↓ queries
SQLite Database (bun:sqlite)
```

### Key Concepts

- **Module pattern**: Each feature area lives under `src/modules/<name>/` with its own view(s), store, and sub-components.
- **Zustand stores** (`src/stores/`): Provide reactive state by wrapping SQLite store functions. Components subscribe to these for automatic re-renders on data changes.
- **SQLite stores** (`*Store.ts` in each module): Plain functions that read/write the database. These are the source of truth.
- **View decomposition**: Large views use a "thin router" pattern — the main file handles keyboard input and view switching, while sub-views in `views/` and `wizards/` handle rendering.
- **Shared components** (`src/components/shared/`): Reusable UI building blocks like `WizardForm`, `StatsRow`, `SelectableList`, etc.

### OpenTUI Specifics

This project uses [OpenTUI](https://opentui.com) for terminal rendering with React bindings. Key differences from DOM-based React:

- JSX elements are `<box>`, `<text>`, `<input>`, `<scrollbox>` instead of HTML elements.
- Styling uses `style={{ }}` objects with properties like `flexDirection`, `borderStyle`, `padding`, `gap`.
- Keyboard input is handled via `useKeyboard()` hook from `@opentui/react`.
- The `<input>` component's `onSubmit` callback receives the current value as a `string` parameter — always capture this value to avoid stale state.

## Code Style

### General

- TypeScript strict mode — no `any` unless interfacing with OpenTUI type quirks.
- Imports at the top of the file, no inline imports.
- Prefer named exports over default exports.
- No unnecessary comments — code should be self-explanatory.

### Component Structure

```typescript
// 1. Imports
import { useState, useEffect } from "react"
import { useKeyboard } from "@opentui/react"

// 2. Types
interface MyViewProps { ... }

// 3. Component
export function MyView({ prop }: MyViewProps) {
  // State
  // Effects
  // Keyboard handler
  // Render
}
```

### Naming Conventions

| Type             | Convention                    | Example              |
| ---------------- | ----------------------------- | -------------------- |
| Components       | PascalCase                    | `ProjectDetail.tsx`  |
| Hooks            | camelCase with `use` prefix   | `useRunningTimer.ts` |
| Stores (Zustand) | camelCase with `use` prefix   | `useWorkStore.ts`    |
| Stores (SQLite)  | camelCase with `Store` suffix | `workStore.ts`       |
| Utilities        | camelCase                     | `formatDuration`     |
| Directories      | camelCase                     | `views/`, `wizards/` |

### Colors

The project uses a consistent color palette (Tokyo Night inspired):

| Color     | Usage                     |
| --------- | ------------------------- |
| `#7aa2f7` | Headers, active selection |
| `#e2e8f0` | Primary text              |
| `#565f89` | Secondary/muted text      |
| `#414868` | Tertiary/disabled text    |
| `#292e42` | Borders                   |
| `#16c79a` | Success/positive          |
| `#e94560` | Error/negative            |
| `#f39c12` | Warning/timer             |
| `#bb9af7` | Accent/purple             |

## Making Changes

### Adding a New Module

1. Create a directory under `src/modules/<name>/`
2. Create the SQLite store (`<name>Store.ts`) with CRUD functions
3. Create the Zustand store in `src/stores/use<Name>Store.ts`
4. Create the main view component
5. Add routing in `src/app.tsx`
6. Add navigation entry in `src/hooks/useNavigation.ts`
7. Register commands in `src/components/command-palette/commandRegistry.ts`

### Adding a Sub-view

1. Create the component in `src/modules/<module>/views/<ViewName>.tsx`
2. Import and render it from the parent router based on view state
3. Add keyboard handling in the parent's `useKeyboard` callback

### Adding a Wizard/Form

1. For simple multi-step text forms, use the shared `WizardForm` component
2. Create in `src/modules/<module>/wizards/<WizardName>.tsx`
3. Remember: OpenTUI's `<input onSubmit>` passes the value as a parameter — always capture it

### Database Migrations

All schema changes go in `src/db/migrations.ts`. Add new `CREATE TABLE IF NOT EXISTS` statements to the `MIGRATIONS` array. The migration system is idempotent — it runs all statements on every startup.

## Submitting a Pull Request

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Ensure TypeScript compiles cleanly: `npx tsc --noEmit`
5. Test your changes manually by running `bun dev`
6. Commit with a descriptive message
7. Push and open a Pull Request

### PR Guidelines

- Keep PRs focused — one feature or fix per PR
- Describe what changed and why in the PR description
- Include a screenshot or terminal recording if the change is visual
- Ensure no TypeScript errors (`npx tsc --noEmit` must pass)

## Reporting Issues

When opening an issue, please include:

- A clear description of the bug or feature request
- Steps to reproduce (for bugs)
- Expected vs. actual behavior
- Your OS, terminal emulator, and Bun version
- Any relevant error output from the terminal

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
