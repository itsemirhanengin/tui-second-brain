import type { MainModule, SubModule, Navigation } from "../../hooks/useNavigation"

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
    subModule: "projects",
    children: [
      { label: "Projects", subModule: "projects" },
      { label: "Clients", subModule: "clients" },
      { label: "Time Tracker", subModule: "timetracker" },
      { label: "Overview", subModule: "workdashboard" },
    ],
  },
  { shortcut: "⇧5", label: "Settings", module: "settings", subModule: "general" },
]

export function Sidebar({ nav }: SidebarProps) {
  return (
    <box style={{ width: 26, flexDirection: "column", backgroundColor: "#1a1b26", borderStyle: "single", borderColor: "#292e42", padding: 1 }}>
      <text fg="#7aa2f7">
        <strong>MENU</strong>
      </text>
      <box style={{ height: 1 }} />
      {MENU.map((item) => {
        const isActive = nav.module === item.module
        return (
          <box key={item.shortcut} style={{ flexDirection: "column" }}>
            <text fg={isActive ? "#7aa2f7" : "#565f89"}>
              {isActive ? "▸ " : "  "}
              {item.shortcut} {item.label}
            </text>
            {isActive && item.children && (
              <box style={{ flexDirection: "column", paddingLeft: 4 }}>
                {item.children.map((child) => {
                  const isSubActive = nav.subModule === child.subModule
                  return (
                    <text key={child.label} fg={isSubActive ? "#bb9af7" : "#414868"}>
                      {isSubActive ? "▹ " : "  "}
                      {child.label}
                    </text>
                  )
                })}
                <text fg="#414868">  Tab to switch</text>
              </box>
            )}
          </box>
        )
      })}
    </box>
  )
}
