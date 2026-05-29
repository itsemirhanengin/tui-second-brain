import type { ReactNode } from "react"

interface StatItem {
  label: string
  value: ReactNode
  color?: string
}

interface StatsRowProps {
  stats: StatItem[]
  borderColor?: string
}

export function StatsRow({ stats, borderColor = "#292e42" }: StatsRowProps) {
  return (
    <box style={{ flexDirection: "row", gap: 3, borderStyle: "rounded", borderColor, padding: 1 }}>
      {stats.map((stat, i) => (
        <box key={i} style={{ flexDirection: "column" }}>
          <text fg="#565f89">{stat.label}</text>
          {typeof stat.value === "string" || typeof stat.value === "number" ? (
            <text fg={stat.color ?? "#e2e8f0"}>{stat.value}</text>
          ) : (
            stat.value
          )}
        </box>
      ))}
    </box>
  )
}
