import type { ReactNode } from "react"
import { Header } from "./Header"
import { StatusBar } from "./StatusBar"
import { Sidebar } from "./Sidebar"
import type { Navigation } from "../../hooks/useNavigation"
import { useTheme } from "../../hooks/useTheme"

interface MainLayoutProps {
  nav: Navigation
  children: ReactNode
}

export function MainLayout({ nav, children }: MainLayoutProps) {
  const t = useTheme()

  return (
    <box style={{ flexDirection: "column", width: "100%", height: "100%", backgroundColor: t.bgAlt }}>
      <Header module={nav.module} subModule={nav.subModule} />
      <box style={{ flexDirection: "row", flexGrow: 1 }}>
        <Sidebar nav={nav} />
        <box style={{ flexGrow: 1, flexDirection: "column", padding: 1 }}>{children}</box>
      </box>
      <StatusBar />
    </box>
  )
}
