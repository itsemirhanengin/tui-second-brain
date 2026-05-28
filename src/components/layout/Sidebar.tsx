import type { MainModule, SubModule, Navigation } from "../../hooks/useNavigation"

interface SidebarProps {
  nav: Navigation
}

interface MenuItem {
  key: string
  label: string
  module: MainModule
  subModule?: SubModule
  children?: { key: string; label: string; subModule: SubModule }[]
}

const MENU: MenuItem[] = [
  { key: "D", label: "Dashboard", module: "dashboard" },
  {
    key: "L",
    label: "Life",
    module: "life",
    subModule: "water",
    children: [
      { key: "1", label: "Water Tracker", subModule: "water" },
      { key: "2", label: "Notes", subModule: "notes" },
      { key: "3", label: "Budget", subModule: "budget" },
      { key: "4", label: "Liabilities", subModule: "liabilities" },
    ],
  },
  {
    key: "R",
    label: "Routines",
    module: "routines",
    subModule: "list",
    children: [
      { key: "1", label: "My Routines", subModule: "list" },
      { key: "2", label: "Statistics", subModule: "stats" },
    ],
  },
  {
    key: "W",
    label: "Work",
    module: "work",
    subModule: "projects",
    children: [
      { key: "1", label: "Projects", subModule: "projects" },
      { key: "2", label: "Clients", subModule: "clients" },
      { key: "3", label: "Time Tracker", subModule: "timetracker" },
      { key: "4", label: "Overview", subModule: "workdashboard" },
    ],
  },
  { key: "S", label: "Settings", module: "settings", subModule: "general" },
]

export function Sidebar({ nav }: SidebarProps) {
  return (
    <box style={{ width: 24, flexDirection: "column", backgroundColor: "#1a1b26", borderStyle: "single", borderColor: "#292e42", padding: 1 }}>
      <text fg="#7aa2f7">
        <strong>MENU</strong>
      </text>
      <box style={{ height: 1 }} />
      {MENU.map((item) => {
        const isActive = nav.module === item.module
        return (
          <box key={item.key} style={{ flexDirection: "column" }}>
            <text fg={isActive ? "#7aa2f7" : "#565f89"}>
              {isActive ? "▸ " : "  "}
              [{item.key}] {item.label}
            </text>
            {isActive && item.children && (
              <box style={{ flexDirection: "column", paddingLeft: 4 }}>
                {item.children.map((child) => {
                  const isSubActive = nav.subModule === child.subModule
                  return (
                    <text key={child.key} fg={isSubActive ? "#bb9af7" : "#414868"}>
                      {isSubActive ? "▹ " : "  "}
                      {child.label}
                    </text>
                  )
                })}
              </box>
            )}
          </box>
        )
      })}
    </box>
  )
}
