import { useState, useEffect } from "react"
import type { MainModule, SubModule } from "../../hooks/useNavigation"
import { useTheme } from "../../hooks/useTheme"

interface HeaderProps {
  module: MainModule
  subModule: SubModule
}

const MODULE_TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  life: "Life",
  routines: "Routines",
  work: "Work",
  settings: "Settings",
}

const SUB_TITLES: Record<string, string> = {
  water: "Water Tracker",
  notes: "Notes",
  budget: "Budget",
  liabilities: "Liabilities",
  list: "My Routines",
  stats: "Statistics",
  projects: "Projects",
  clients: "Clients",
  tasks: "Tasks",
  timetracker: "Time Tracker",
  workdashboard: "Overview",
  general: "General",
  export: "Export / Import",
}

export function Header({ module, subModule }: HeaderProps) {
  const t = useTheme()
  const [time, setTime] = useState(new Date().toLocaleTimeString("en-US", { hour12: false }))

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString("en-US", { hour12: false }))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const title = MODULE_TITLES[module] ?? module
  const sub = subModule ? SUB_TITLES[subModule] ?? subModule : ""
  const breadcrumb = sub ? `${title} > ${sub}` : title

  return (
    <box style={{ height: 1, backgroundColor: t.bg, paddingLeft: 1, paddingRight: 1, flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
      <text fg={t.primary}>
        <strong>Second Brain</strong>
        <span fg={t.textSecondary}> | {breadcrumb}</span>
      </text>
      <text fg={t.textSecondary}>{time} | ? for help</text>
    </box>
  )
}
