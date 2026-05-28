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

    switch (key.name) {
      case "d":
        nav.navigate("dashboard")
        break
      case "l":
        nav.navigate("life", "water")
        break
      case "r":
        nav.navigate("routines", "list")
        break
      case "w":
        nav.navigate("work", "projects")
        break
      case "s":
        nav.navigate("settings", "general")
        break
      case "escape":
        nav.popView()
        break
    }

    if (nav.module === "life") {
      switch (key.name) {
        case "1": nav.setSubModule("water"); break
        case "2": nav.setSubModule("notes"); break
        case "3": nav.setSubModule("budget"); break
        case "4": nav.setSubModule("liabilities"); break
      }
    } else if (nav.module === "routines") {
      switch (key.name) {
        case "1": nav.setSubModule("list"); break
        case "2": nav.setSubModule("stats"); break
      }
    } else if (nav.module === "work") {
      switch (key.name) {
        case "1": nav.setSubModule("projects"); break
        case "2": nav.setSubModule("clients"); break
        case "3": nav.setSubModule("timetracker"); break
        case "4": nav.setSubModule("workdashboard"); break
      }
    } else if (nav.module === "settings") {
      switch (key.name) {
        case "1": nav.setSubModule("general"); break
        case "2": nav.setSubModule("water"); break
        case "3": nav.setSubModule("export"); break
      }
    }
  })

  if (showHelp) {
    return (
      <MainLayout nav={nav}>
        <box style={{ flexDirection: "column", gap: 1, borderStyle: "rounded", borderColor: "#7aa2f7", padding: 2 }}>
          <text fg="#7aa2f7"><strong>Keyboard Shortcuts</strong></text>
          <box style={{ height: 1 }} />
          <text fg="#bb9af7"><strong>Navigation</strong></text>
          <text fg="#e2e8f0">  D         Dashboard</text>
          <text fg="#e2e8f0">  L         Life module</text>
          <text fg="#e2e8f0">  R         Routines module</text>
          <text fg="#e2e8f0">  W         Work module</text>
          <text fg="#e2e8f0">  S         Settings</text>
          <text fg="#e2e8f0">  1-4       Switch sub-modules</text>
          <text fg="#e2e8f0">  ESC       Go back / Close</text>
          <text fg="#e2e8f0">  ?         Toggle this help</text>
          <box style={{ height: 1 }} />
          <text fg="#bb9af7"><strong>Common Actions</strong></text>
          <text fg="#e2e8f0">  N         New item</text>
          <text fg="#e2e8f0">  Enter     Open / Confirm</text>
          <text fg="#e2e8f0">  E         Edit</text>
          <text fg="#e2e8f0">  X         Delete / Archive</text>
          <text fg="#e2e8f0">  /         Search (in Notes)</text>
          <text fg="#e2e8f0">  Up/Down   Navigate lists</text>
          <text fg="#e2e8f0">  Tab       Switch tabs (where applicable)</text>
          <box style={{ height: 1 }} />
          <text fg="#bb9af7"><strong>Water Tracker</strong></text>
          <text fg="#e2e8f0">  1-5       Quick add (250/330/500/750/1000ml)</text>
          <text fg="#e2e8f0">  C         Custom amount</text>
          <text fg="#e2e8f0">  G         Set goal</text>
          <text fg="#e2e8f0">  H         History</text>
          <box style={{ height: 1 }} />
          <text fg="#bb9af7"><strong>Time Tracker</strong></text>
          <text fg="#e2e8f0">  T         Start/Stop timer</text>
          <text fg="#e2e8f0">  M         Manual entry</text>
          <box style={{ height: 1 }} />
          <text fg="#bb9af7"><strong>Notes</strong></text>
          <text fg="#e2e8f0">  Ctrl+S    Save note</text>
          <text fg="#e2e8f0">  Ctrl+L    Lock/Unlock note</text>
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
