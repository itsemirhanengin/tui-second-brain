import { formatDuration } from "../../utils/date"

interface WorkHoursChartProps {
  data: { date: string; minutes: number }[]
}

export function WorkHoursChart({ data }: WorkHoursChartProps) {
  const maxMin = Math.max(...data.map((d) => d.minutes), 1)
  if (data.every((d) => d.minutes === 0)) return null

  return (
    <box style={{ flexDirection: "column", borderStyle: "single", borderColor: "#292e42", padding: 1 }}>
      <text fg="#565f89">Work Hours (Last {data.length} Days):</text>
      {data.map((d) => {
        const barW = 20
        const filled = Math.round((d.minutes / maxMin) * barW)
        const dayName = new Date(d.date).toLocaleDateString("en-US", { weekday: "short" })
        return (
          <box key={d.date} style={{ flexDirection: "row", gap: 1 }}>
            <text fg="#565f89" style={{ width: 5 }}>{dayName}</text>
            <text fg="#7aa2f7">{"█".repeat(filled)}{"░".repeat(barW - filled)}</text>
            <text fg="#e2e8f0">{formatDuration(d.minutes)}</text>
          </box>
        )
      })}
    </box>
  )
}
