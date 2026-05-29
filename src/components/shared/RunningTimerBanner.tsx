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
      <text fg="#f39c12">Timer Running: {formatDuration(elapsed)}</text>
      <text fg="#e2e8f0">{description || "No description"}</text>
      <text fg="#565f89">[T] Stop Timer</text>
    </box>
  )
}
