import type { Navigation, MainModule, SubModule } from "../../hooks/useNavigation"
import { setPendingAction } from "../../utils/pendingAction"

export interface Command {
  id: string
  label: string
  category: string
  keywords: string
  action: () => void
}

export function buildCommands(
  nav: Navigation,
  onClose: () => void,
): Command[] {
  function go(module: MainModule, subModule: SubModule = null) {
    return () => {
      nav.navigate(module, subModule)
      onClose()
    }
  }

  function goWithAction(module: MainModule, subModule: SubModule, action: string) {
    return () => {
      setPendingAction(action)
      nav.navigate(module, subModule)
      onClose()
    }
  }

  return [
    // --- Navigation ---
    { id: "nav-dashboard", label: "Go to Dashboard", category: "Navigation", keywords: "home overview summary", action: go("dashboard") },
    { id: "nav-water", label: "Go to Water Tracker", category: "Navigation", keywords: "life hydration drink", action: go("life", "water") },
    { id: "nav-notes", label: "Go to Notes", category: "Navigation", keywords: "life markdown write", action: go("life", "notes") },
    { id: "nav-budget", label: "Go to Budget", category: "Navigation", keywords: "life money finance spending", action: go("life", "budget") },
    { id: "nav-liabilities", label: "Go to Liabilities", category: "Navigation", keywords: "life debt loan credit card", action: go("life", "liabilities") },
    { id: "nav-habits", label: "Go to Habits", category: "Navigation", keywords: "life daily tracker heatmap", action: go("life", "habits") },
    { id: "nav-goals", label: "Go to Goals", category: "Navigation", keywords: "life objectives milestones target", action: go("life", "goals") },
    { id: "nav-routines", label: "Go to Routines", category: "Navigation", keywords: "habits daily checklist", action: go("routines", "list") },
    { id: "nav-routines-stats", label: "Go to Routine Statistics", category: "Navigation", keywords: "habits completion rate", action: go("routines", "stats") },
    { id: "nav-work-overview", label: "Go to Work Overview", category: "Navigation", keywords: "work dashboard summary", action: go("work", "workdashboard") },
    { id: "nav-tasks", label: "Go to Tasks", category: "Navigation", keywords: "work kanban todo board", action: go("work", "tasks") },
    { id: "nav-timetracker", label: "Go to Time Tracker", category: "Navigation", keywords: "work timer hours log", action: go("work", "timetracker") },
    { id: "nav-projects", label: "Go to Projects", category: "Navigation", keywords: "work project list", action: go("work", "projects") },
    { id: "nav-clients", label: "Go to Clients", category: "Navigation", keywords: "work client customer", action: go("work", "clients") },
    { id: "nav-settings", label: "Go to Settings", category: "Navigation", keywords: "config preferences theme currency", action: go("settings", "general") },
    { id: "nav-export", label: "Go to Export / Import", category: "Navigation", keywords: "settings data backup json", action: go("settings", "export") },

    // --- Quick Actions ---
    { id: "new-task", label: "New Task", category: "Quick Action", keywords: "create add todo work", action: goWithAction("work", "tasks", "new-task") },
    { id: "new-note", label: "New Note", category: "Quick Action", keywords: "create add write markdown", action: goWithAction("life", "notes", "new-note") },
    { id: "new-transaction", label: "New Transaction", category: "Quick Action", keywords: "create add expense income money budget", action: goWithAction("life", "budget", "new-transaction") },
    { id: "new-recurring", label: "New Recurring Transaction", category: "Quick Action", keywords: "create add subscription rent salary recurring", action: goWithAction("life", "budget", "new-recurring") },
    { id: "new-client", label: "New Client", category: "Quick Action", keywords: "create add customer work", action: goWithAction("work", "clients", "new-client") },
    { id: "new-project", label: "New Project", category: "Quick Action", keywords: "create add work", action: goWithAction("work", "projects", "new-project") },
    { id: "new-routine", label: "New Routine", category: "Quick Action", keywords: "create add habit daily", action: goWithAction("routines", "list", "new-routine") },
    { id: "add-water", label: "Add Water Entry", category: "Quick Action", keywords: "drink hydration log ml", action: goWithAction("life", "water", "add-water") },
    { id: "start-timer", label: "Start Timer", category: "Quick Action", keywords: "time track work clock", action: goWithAction("work", "timetracker", "start-timer") },
  ]
}
