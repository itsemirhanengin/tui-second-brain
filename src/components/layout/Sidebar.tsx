import type { Navigation } from "../../hooks/useNavigation"
import { useTheme } from "../../hooks/useTheme"
import type { MainModule, SubModule } from "../../hooks/useNavigation"

interface SidebarProps {
  nav: Navigation
}

interface MenuItem {
  shortcut: string
  label: string
  module: MainModule
  subModule?: SubModule
  children?: { label: string; subModule: SubModule }[]
}

const MENU: MenuItem[] = [
  { shortcut: "⇧1", label: "Dashboard", module: "dashboard" },
  {
    shortcut: "⇧2",
    label: "Life",
    module: "life",
    subModule: "water",
    children: [
      { label: "Water Tracker", subModule: "water" },
      { label: "Notes", subModule: "notes" },
      { label: "Budget", subModule: "budget" },
      { label: "Liabilities", subModule: "liabilities" },
    ],
  },
  {
    shortcut: "⇧3",
    label: "Routines",
    module: "routines",
    subModule: "list",
    children: [
      { label: "My Routines", subModule: "list" },
      { label: "Statistics", subModule: "stats" },
    ],
  },
  {
    shortcut: "⇧4",
    label: "Work",
    module: "work",
    subModule: "workdashboard",
    children: [
      { label: "Overview", subModule: "workdashboard" },
      { label: "Tasks", subModule: "tasks" },
      { label: "Time Tracker", subModule: "timetracker" },
      { label: "Projects", subModule: "projects" },
      { label: "Clients", subModule: "clients" },
    ],
  },
  { shortcut: "⇧5", label: "Settings", module: "settings", subModule: "general" },
]

export function Sidebar({ nav }: SidebarProps) {
  const t = useTheme()

  return (
    <box style={{ width: 26, flexDirection: "column", backgroundColor: t.bg, borderStyle: "single", borderColor: t.border, padding: 1 }}>
      <text fg={t.primary}>
        <strong>MENU</strong>
      </text>
      <box style={{ height: 1 }} />
      {MENU.map((item) => {
        const isActive = nav.module === item.module
        return (
          <box key={item.shortcut} style={{ flexDirection: "column" }}>
            <text fg={isActive ? t.primary : t.textSecondary}>
              {isActive ? "▸ " : "  "}
              {item.shortcut} {item.label}
            </text>
            {isActive && item.children && (
              <box style={{ flexDirection: "column", paddingLeft: 4 }}>
                {item.children.map((child) => {
                  const isSubActive = nav.subModule === child.subModule
                  return (
                    <text key={child.label} fg={isSubActive ? t.secondary : t.textMuted}>
                      {isSubActive ? "▹ " : "  "}
                      {child.label}
                    </text>
                  )
                })}
                <text fg={t.textMuted}>  Tab to switch</text>
              </box>
            )}
          </box>
        )
      })}
    </box>
  )
}
