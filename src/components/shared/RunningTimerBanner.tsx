import { formatDuration } from "../../utils/date"

interface RunningTimerBannerProps {
  elapsed: number
  description: string
  compact?: boolean
}

export function RunningTimerBanner({ elapsed, description, compact = false }: RunningTimerBannerProps) {
  if (compact) {
    return (
      <box style={{ borderStyle: "rounded", borderColor: "#f39c12", padding: 1 }}>
        <text fg="#f39c12">Timer Running: {formatDuration(elapsed)} — {description || "No description"}</text>
      </box>
    )
  }

  return (
    <box style={{ borderStyle: "rounded", borderColor: "#f39c12", padding: 1, flexDirection: "column" }}>
      <box><text fg="#f39c12">Timer Running: {formatDuration(elapsed)}</text></box>
      <box><text fg="#e2e8f0">Task: {description || "No description"}</text></box>
    </box>
  )
}
