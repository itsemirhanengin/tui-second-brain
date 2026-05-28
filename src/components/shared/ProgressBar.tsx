import { useState, useEffect } from "react"

interface ProgressBarProps {
  current: number
  max: number
  width?: number
  label?: string
  showPercentage?: boolean
  filledColor?: string
  emptyColor?: string
  overColor?: string
}

export function ProgressBar({
  current,
  max,
  width = 30,
  label,
  showPercentage = true,
  filledColor = "#16c79a",
  emptyColor = "#414868",
  overColor = "#e94560",
}: ProgressBarProps) {
  const percentage = max > 0 ? Math.min((current / max) * 100, 100) : 0
  const isOver = current > max
  const filled = Math.round((Math.min(current, max) / max) * width)
  const empty = width - filled
  const barColor = isOver ? overColor : filledColor

  const filledStr = "█".repeat(filled)
  const emptyStr = "░".repeat(Math.max(0, empty))
  const pctText = showPercentage ? ` ${Math.round(percentage)}%` : ""

  const displayLabel = label ? `${label} ` : ""
  const overText = isOver ? ` [+${current - max} OVER]` : ""

  return (
    <box style={{ flexDirection: "row", gap: 1 }}>
      {label && <text fg="#7aa2f7">{displayLabel}</text>}
      <text fg={barColor}>{filledStr}</text>
      <text fg={emptyColor}>{emptyStr}</text>
      <text fg={isOver ? overColor : "#e2e8f0"}>
        {pctText}
        {overText}
      </text>
    </box>
  )
}
