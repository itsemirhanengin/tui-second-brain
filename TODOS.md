# Roadmap & TODOs

> Planned features and improvements for TUI Second Brain, organized by priority and category.

---

## High Priority

### Command Palette

- [ ] Global `Ctrl+P` or `/` command palette overlay
- [ ] Fuzzy search across all actions: "New Task", "Go to Notes", "Start Timer", etc.
- [ ] Module navigation, item search, and quick actions from one place
- [ ] Recently used commands at the top

### Recurring Transactions

- [ ] Define recurring income/expense rules (amount, category, account, frequency, day)
- [ ] Auto-generate transactions on app startup for missed periods
- [ ] Mark as "Rent", "Netflix", "Salary" etc. with edit/pause/delete support
- [ ] Show upcoming recurring transactions in Budget dashboard

### Notification System

- [ ] Startup alerts: overdue payments, missed routines, approaching deadlines
- [ ] StatusBar notification badges with count
- [ ] "Today's Briefing" view on Dashboard: what needs attention right now
- [ ] Configurable: which notifications to show (Settings)

### Subtasks

- [ ] Add subtasks under any task (nested one level)
- [ ] Subtask completion auto-updates parent task progress
- [ ] Display subtask count and completion on task list/kanban cards
- [ ] Keyboard shortcut to add subtask from task detail

### Pomodoro Timer

- [ ] Pomodoro mode alongside existing timer: 25min work / 5min break cycle
- [ ] Configurable work/break durations (Settings)
- [ ] Pomodoro count per task and per day
- [ ] Visual countdown in StatusBar with phase indicator (WORK / BREAK)
- [ ] Audio bell via terminal bell character (`\x07`) on phase switch

---

## Medium Priority

### Calendar / Agenda View

- [ ] New top-level module or Dashboard section
- [ ] Unified daily/weekly view: payment due dates, task deadlines, routine schedule
- [ ] Navigate days with arrow keys
- [ ] Color-coded by source module (budget=red, routines=purple, work=blue)

### Notes Checklist Support

- [ ] Parse `- [ ]` and `- [x]` in markdown content
- [ ] Render as interactive checkboxes in NoteViewer
- [ ] Toggle checkboxes with Enter key
- [ ] Auto-save on toggle

### Habits Tracker (Life Module)

- [ ] Simple daily yes/no habits separate from routines
- [ ] GitHub-style contribution heatmap (last 12 weeks)
- [ ] Weekly/monthly completion percentages
- [ ] Habit categories and grouping

### Goals / Objectives (Life Module)

- [ ] Long-term goals with target date and measurable target
- [ ] Milestones under each goal
- [ ] Auto-link to budget (savings goals), water (health goals), routines
- [ ] Progress bar based on linked data or manual updates

### Budget Reports & Trends

- [ ] Month-over-month comparison: "You spent 15% more than last month"
- [ ] Category trend charts (ASCII bar charts over last 6 months)
- [ ] Top spending categories ranking
- [ ] Income vs. expense trend line

### Data Visualization

- [ ] ASCII pie chart for budget category breakdown
- [ ] Enhanced water history with weekly averages and trend
- [ ] Routine completion heatmap (7×N grid, last N weeks)
- [ ] Work hours weekly bar chart

---

## Low Priority (Nice to Have)

### Quick Capture Modal

- [ ] Global `Ctrl+N` quick capture from any screen
- [ ] Choose target: Note, Task, Transaction, Water entry
- [ ] Minimal form, auto-return to previous screen after save

### Pinned / Favorites

- [ ] Pin notes, projects, tasks to a favorites list
- [ ] Show pinned items in Dashboard sidebar or dedicated section
- [ ] Quick access with keyboard shortcut

### Undo / Redo

- [ ] Undo stack for last 10 destructive operations (delete, archive, move)
- [ ] `Ctrl+Z` to undo, `Ctrl+Y` to redo
- [ ] Toast notification: "Deleted task — press Ctrl+Z to undo"

### Fuzzy Global Search

- [ ] Search across all modules: notes, tasks, projects, clients, transactions
- [ ] Results grouped by module with keyboard navigation
- [ ] Open result directly from search

### Task Dependencies

- [ ] "Blocked by" relationship between tasks
- [ ] Visual indicator on blocked tasks (greyed out, lock icon)
- [ ] Auto-move to Todo when blocker is completed

### Import from JSON

- [ ] Import previously exported JSON backup
- [ ] Merge or replace modes
- [ ] Validation before import

---

## Technical Improvements

### Keyboard Navigation Consistency

- [ ] Audit all modules: ensure N/E/X/Enter work uniformly
- [ ] Add edit capability to Clients (currently only create/delete)
- [ ] Add edit capability to Routines (currently only create/toggle/delete)
- [ ] Consistent ESC behavior across all nested views

### Performance

- [ ] Lazy-load module data (only query DB when module is active)
- [ ] Memoize expensive computations (category budget summaries, task counts)
- [ ] Reduce re-renders by splitting large components

### Testing

- [ ] Unit tests for all store modules (waterStore, budgetStore, etc.)
- [ ] Integration tests for migration and seed data
- [ ] Snapshot tests for key UI states

### Theme System Expansion

- [ ] Apply theme colors to all module views (currently layout-only)
- [ ] Light theme variants
- [ ] Custom theme creation from Settings (pick colors per slot)
- [ ] Export/import custom themes

---

## Completed

- [x] Project scaffolding (Bun + OpenTUI + React + SQLite)
- [x] Database schema with 18 tables and seed data
- [x] Sidebar navigation with module/sub-module structure
- [x] Water Tracker with goals, quick-add, history, streaks
- [x] Notes with markdown editor/viewer, password protection, archive, tags
- [x] Budget with accounts, categories, transactions, spending limits
- [x] Liabilities with credit cards, loans, payment schedule
- [x] Routines with daily checklist, streaks, statistics
- [x] Work module: projects, clients, time tracker (timer + manual)
- [x] Task management with list/kanban views, custom statuses, priorities
- [x] Dashboard with cross-module overview
- [x] Settings with currency, date/time format, data export
- [x] Theme system with 6 built-in themes
- [x] Keyboard shortcut system (Shift+number for modules, Tab for sub-modules)
- [x] Client > Project > Task > Time Tracking integrated workflow
