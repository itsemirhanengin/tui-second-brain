import { useState } from "react"
import { useKeyboard } from "@opentui/react"
import { MainLayout } from "./components/layout/MainLayout"
import { useNavigation } from "./hooks/useNavigation"
import { Dashboard } from "./modules/dashboard/Dashboard"
import { WaterTracker } from "./modules/life/water/WaterTracker"
import { NotesList } from "./modules/life/notes/NotesList"
import { BudgetDashboard } from "./modules/life/budget/BudgetDashboard"
import { LiabilitiesOverview } from "./modules/life/liabilities/LiabilitiesOverview"
import { RoutinesView } from "./modules/routines/RoutinesView"
import { WorkView } from "./modules/work/WorkView"
import { SettingsView } from "./modules/settings/SettingsView"

export function App() {
  const nav = useNavigation()
  const [showHelp, setShowHelp] = useState(false)

  useKeyboard((key) => {
    if (key.name === "?" || (key.shift && key.name === "/")) {
      setShowHelp((h) => !h)
      return
    }

    if (showHelp) {
      if (key.name === "escape") setShowHelp(false)
      return
    }

    // Shift+number (! @ # $ %) for main module switching
    switch (key.name) {
      case "!": nav.navigate("dashboard"); return
      case "@": nav.navigate("life", "water"); return
      case "#": nav.navigate("routines", "list"); return
      case "$": nav.navigate("work", "projects"); return
      case "%": nav.navigate("settings", "general"); return
    }

    // Tab / Shift+Tab to cycle sub-modules within current module
    if (key.name === "tab") {
      nav.cycleSubModule(key.shift ? -1 : 1)
      return
    }
  })

  if (showHelp) {
    return (
      <MainLayout nav={nav}>
        <box style={{ flexDirection: "column", gap: 1, borderStyle: "rounded", borderColor: "#7aa2f7", padding: 2 }}>
          <text fg="#7aa2f7"><strong>Keyboard Shortcuts</strong></text>
          <box style={{ height: 1 }} />
          <text fg="#bb9af7"><strong>Global Navigation (Shift + Number)</strong></text>
          <text fg="#e2e8f0">  !  (⇧1)   Dashboard</text>
          <text fg="#e2e8f0">  @  (⇧2)   Life</text>
          <text fg="#e2e8f0">  #  (⇧3)   Routines</text>
          <text fg="#e2e8f0">  $  (⇧4)   Work</text>
          <text fg="#e2e8f0">  %  (⇧5)   Settings</text>
          <text fg="#e2e8f0">  Tab        Next sub-module</text>
          <text fg="#e2e8f0">  Shift+Tab  Prev sub-module</text>
          <text fg="#e2e8f0">  ESC        Go back / Close</text>
          <text fg="#e2e8f0">  ?          Toggle this help</text>
          <box style={{ height: 1 }} />
          <text fg="#bb9af7"><strong>Common Actions</strong></text>
          <text fg="#e2e8f0">  N          New item</text>
          <text fg="#e2e8f0">  Enter      Open / Confirm</text>
          <text fg="#e2e8f0">  E          Edit</text>
          <text fg="#e2e8f0">  X          Delete / Archive</text>
          <text fg="#e2e8f0">  /          Search (in Notes)</text>
          <text fg="#e2e8f0">  Up/Down    Navigate lists</text>
          <box style={{ height: 1 }} />
          <text fg="#bb9af7"><strong>Water Tracker</strong></text>
          <text fg="#e2e8f0">  1-5        Quick add (250/330/500/750/1000ml)</text>
          <text fg="#e2e8f0">  C          Custom amount</text>
          <text fg="#e2e8f0">  G          Set goal</text>
          <text fg="#e2e8f0">  H          History</text>
          <box style={{ height: 1 }} />
          <text fg="#bb9af7"><strong>Time Tracker</strong></text>
          <text fg="#e2e8f0">  T          Start/Stop timer</text>
          <text fg="#e2e8f0">  M          Manual entry</text>
          <box style={{ height: 1 }} />
          <text fg="#bb9af7"><strong>Notes</strong></text>
          <text fg="#e2e8f0">  Ctrl+S     Save note</text>
          <text fg="#e2e8f0">  Ctrl+L     Lock/Unlock note</text>
          <box style={{ height: 1 }} />
          <text fg="#414868">Press ESC or ? to close</text>
        </box>
      </MainLayout>
    )
  }

  const renderContent = () => {
    switch (nav.module) {
      case "dashboard":
        return <Dashboard />
      case "life":
        switch (nav.subModule) {
          case "water": return <WaterTracker />
          case "notes": return <NotesList />
          case "budget": return <BudgetDashboard />
          case "liabilities": return <LiabilitiesOverview />
          default: return <WaterTracker />
        }
      case "routines":
        return <RoutinesView subView={(nav.subModule as "list" | "stats") ?? "list"} />
      case "work":
        return <WorkView subView={(nav.subModule as string) ?? "projects"} />
      case "settings":
        return <SettingsView subView={(nav.subModule as string) ?? "general"} />
      default:
        return <Dashboard />
    }
  }

  return <MainLayout nav={nav}>{renderContent()}</MainLayout>
}
