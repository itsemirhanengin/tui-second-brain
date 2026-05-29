import { asciiHeatmap } from "../../utils/charts"

interface HeatmapGridProps {
  grid: number[][]
  title?: string
  dayLabels?: string[]
}

export function HeatmapGrid({ grid, title, dayLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] }: HeatmapGridProps) {
  const maxVal = Math.max(...grid.flat(), 1)
  const heatChars = asciiHeatmap(grid, maxVal)

  return (
    <box style={{ flexDirection: "column", borderStyle: "single", borderColor: "#292e42", padding: 1 }}>
      {title && <text fg="#565f89">{title}</text>}
      <box style={{ flexDirection: "row", gap: 0 }}>
        <text fg="#414868">{"   "}</text>
        {heatChars.map((_, wi) => <text key={wi} fg="#414868">{String(wi + 1).padStart(2, " ")}</text>)}
      </box>
      {dayLabels.map((day, di) => (
        <box key={day} style={{ flexDirection: "row", gap: 0 }}>
          <text fg="#565f89">{day} </text>
          {heatChars.map((week, wi) => {
            const val = grid[wi]?.[di] ?? 0
            const color = val === 0 ? "#292e42" : val <= 1 ? "#565f89" : val <= 3 ? "#bb9af7" : "#16c79a"
            return <text key={wi} fg={color}>{` ${week[di]}`}</text>
          })}
        </box>
      ))}
    </box>
  )
}
