# TUI Second Brain

A comprehensive **Second Brain** application that runs entirely in your terminal. Manage your life, routines, and work from a single keyboard-driven interface built with [OpenTUI](https://opentui.com) and powered by [Bun](https://bun.sh).

```
┌──────────────────────────┐
│ Second Brain | Dashboard │                              20:15:32 | ? for help
├──────────────────────────┼──────────────────────────────────────────────────────┐
│                          │                                                      │
│  MENU                    │  Dashboard — May 2026                                │
│                          │                                                      │
│  ▸ ⇧1 Dashboard          │  ╭──────────────╮  ╭──────────────╮  ╭──────────────╮│
│    ⇧2 Life               │  │ Water        │  │ Routines     │  │ Budget       ││
│    ⇧3 Routines           │  │ 1500/2000ml  │  │ 3/5 done     │  │ In: 15,000 ₺ ││
│    ⇧4 Work               │  │ ████████░░░  │  │ ██████░░░░   │  │ Out: 8,500 ₺ ││
│    ⇧5 Settings           │  ╰──────────────╯  ╰──────────────╯  ╰──────────────╯│
│                          │                                                      │
│                          │  ┌─ Upcoming Payments ───┐  ┌─ Active Projects ──┐   │
│                          │  │ 2026-06-01  Loan  ₺5k │  │ Website Redesign   │   │
│                          │  │ 2026-06-05  CC    ₺3k │  │ Mobile App         │   │
│                          │  └───────────────────────┘  └────────────────────┘   │
├──────────────────────────┴──────────────────────────────────────────────────────┤
│ ⇧1..5: Navigate | Tab: Sub-module | ESC: Back | ?: Help                         │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Why

Most productivity tools are web apps that demand your attention with notifications, animations, and context switches. TUI Second Brain takes a different approach: it's a **local-first, offline, keyboard-driven** tool that stays out of your way. All data lives in a single SQLite file on your machine. No accounts, no cloud sync, no subscriptions.

## Features

### Life Module

- **Water Tracker** — Set daily goals, quick-add presets (250/330/500/750/1000ml), custom amounts, progress bar, 14-day history with bar charts, streak tracking
- **Notes** — Full markdown editor with rendered preview, password protection (bcrypt), archive/unarchive, tagging, search, project linking
- **Budget Management** — Multi-account support (bank, credit card, cash, savings, investment, e-wallet), income/expense/transfer transactions, category budgets with spending limits and over-limit alerts (`[+1,000 OVER]`)
- **Liabilities** — Credit card debt tracking with configurable statement dates, auto-calculated due dates (10-day default for Turkey), minimum payment rates, loan tracking with installment progress bars, unified payment schedule with urgency color coding

### Routines Module

- **Routine Definitions** — Daily, weekly (specific days), or monthly frequency with preferred time
- **Daily Checklist** — Mark as done (with optional note) or skip (reason required)
- **Streak Tracking** — Current streak, best streak, 30-day completion rate with progress bars
- **Statistics** — Per-routine analytics and completion rates

### Work Module

- **Task Management** — Linear-inspired task system with list and kanban views, customizable statuses with color palette picker and Linear-style progress icons (`○` `◔` `◑` `◕` `●` `⊘`), priority levels, project filtering
- **Projects** — CRUD with status workflow (Active > Paused > Completed > Archived), client linking, deadline tracking with countdown
- **Clients** — Contact info, hourly rates, project and task counts per client
- **Time Tracker** — Real-time start/stop timer + manual time entry, project association, start timer directly from a task with `T`
- **Work Overview** — Today/week hours, active projects, task status breakdown, running timer display

### Dashboard

At-a-glance overview pulling data from all modules: water progress, routine completion, budget summary, upcoming payments, active projects, recent notes.

### Settings & Theming

- **6 built-in themes**: Tokyo Night, Catppuccin Mocha, Dracula, Nord, Gruvbox Dark, Rose Pine — each with a live color preview in the picker
- Configurable default currency, date format, time format
- JSON and CSV data export

## Tech Stack

| Layer       | Technology                                                                    |
| ----------- | ----------------------------------------------------------------------------- |
| Runtime     | [Bun](https://bun.sh)                                                         |
| UI Core     | [OpenTUI](https://opentui.com) — native Zig TUI core with TypeScript bindings |
| UI Bindings | `@opentui/react` — React 19 components for terminal                           |
| Database    | `bun:sqlite` — built-in SQLite with WAL mode                                  |
| Language    | TypeScript (strict mode)                                                      |

No external databases, no Docker, no servers. Everything runs locally in a single process.

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) v1.1+ installed

### Installation

```bash
git clone https://github.com/your-username/tui-second-brain.git
cd tui-second-brain
bun install
```

### Run

```bash
bun start
```

Or with file watching for development:

```bash
bun dev
```

The database is automatically created at `~/.tui-second-brain/brain.db` on first run, with default categories, task statuses, and settings pre-seeded.

## Keyboard Shortcuts

### Global

| Key                 | Action              |
| ------------------- | ------------------- |
| `⇧1` (`!`)          | Dashboard           |
| `⇧2` (`@`)          | Life module         |
| `⇧3` (`#`)          | Routines module     |
| `⇧4` (`$`)          | Work module         |
| `⇧5` (`%`)          | Settings            |
| `Tab` / `Shift+Tab` | Cycle sub-modules   |
| `ESC`               | Go back / Close     |
| `?`                 | Toggle help overlay |

### Common Actions

| Key           | Action           |
| ------------- | ---------------- |
| `N`           | New item         |
| `E`           | Edit selected    |
| `X`           | Delete / Archive |
| `Enter`       | Open / Confirm   |
| `Up` / `Down` | Navigate lists   |
| `/`           | Search (Notes)   |

### Water Tracker

| Key     | Action                             |
| ------- | ---------------------------------- |
| `1`-`5` | Quick add (250/330/500/750/1000ml) |
| `C`     | Custom amount                      |
| `G`     | Set daily goal                     |
| `H`     | View history                       |

### Tasks

| Key              | Action                             |
| ---------------- | ---------------------------------- |
| `K`              | Kanban view                        |
| `L`              | List view                          |
| `T`              | Start/Stop timer for selected task |
| `P`              | Cycle priority                     |
| `F`              | Filter by project                  |
| `Left` / `Right` | Move task status                   |
| `M`              | Manage statuses                    |

### Notes

| Key      | Action           |
| -------- | ---------------- |
| `Ctrl+S` | Save note        |
| `Ctrl+L` | Lock/Unlock note |

## Project Structure

```
src/
├── index.tsx                          # Entry point
├── app.tsx                            # Root component + global keyboard
├── db/
│   ├── connection.ts                  # SQLite singleton (WAL mode)
│   └── migrations.ts                  # Schema + seed data
├── hooks/
│   ├── useNavigation.ts               # Module/sub-module routing
│   └── useTheme.ts                    # Theme accessor
├── components/
│   ├── layout/                        # Header, Sidebar, StatusBar, MainLayout
│   └── shared/                        # ProgressBar, Badge, CurrencyDisplay, EmptyState
├── modules/
│   ├── dashboard/Dashboard.tsx        # Home overview
│   ├── life/
│   │   ├── water/                     # WaterTracker + waterStore
│   │   ├── notes/                     # NotesList, NoteEditor, NoteViewer + notesStore
│   │   ├── budget/                    # BudgetDashboard + budgetStore
│   │   └── liabilities/              # LiabilitiesOverview + liabilitiesStore
│   ├── routines/                      # RoutinesView + routinesStore
│   ├── work/
│   │   ├── WorkView.tsx               # Projects, Clients, TimeTracker, Overview
│   │   ├── TasksView.tsx              # List + Kanban views
│   │   ├── workStore.ts               # Clients, Projects, TimeEntries
│   │   └── taskStore.ts               # Tasks, TaskStatuses
│   └── settings/                      # SettingsView + settingsStore
└── utils/
    ├── themes.ts                      # 6 theme definitions
    ├── currency.ts                    # Currency formatting
    ├── date.ts                        # Date helpers
    ├── crypto.ts                      # Password hashing (bcrypt)
    ├── export.ts                      # JSON/CSV export
    └── validators.ts                  # Input validation
```

## Database

All data is stored in a single SQLite file at `~/.tui-second-brain/brain.db`. The schema includes 18 tables:

| Table                          | Purpose                                 |
| ------------------------------ | --------------------------------------- |
| `settings`                     | Key/value app configuration             |
| `water_entries`, `water_goals` | Water tracking                          |
| `notes`                        | Markdown notes with password protection |
| `accounts`                     | Financial accounts (6 types)            |
| `categories`                   | Income/expense categories with limits   |
| `transactions`                 | Income, expense, transfer records       |
| `budgets`                      | Monthly category budget limits          |
| `credit_card_debts`            | Credit card statement cycles            |
| `loans`                        | Loan tracking with installments         |
| `liability_payments`           | Payment history                         |
| `routines`, `routine_logs`     | Routine definitions and completion logs |
| `clients`                      | Client contact info and rates           |
| `projects`                     | Project management with status workflow |
| `time_entries`                 | Timer and manual time tracking          |
| `task_statuses`                | Customizable task statuses              |
| `tasks`                        | Task management with priorities         |

## Data Portability

Export all your data anytime from Settings > Export:

- **JSON** — Full database dump in a single file
- **CSV** — One file per table, compatible with any spreadsheet

Database file can be directly backed up by copying `~/.tui-second-brain/brain.db`.

## License

MIT
