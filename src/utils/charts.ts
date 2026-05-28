export function asciiPieChart(
  slices: { label: string; value: number; color: string }[],
  width = 20,
): { label: string; bar: string; pct: number; color: string }[] {
  const total = slices.reduce((s, sl) => s + sl.value, 0)
  if (total === 0) return []
  return slices
    .filter((s) => s.value > 0)
    .map((s) => {
      const pct = (s.value / total) * 100
      const filled = Math.max(1, Math.round((pct / 100) * width))
      return { label: s.label, bar: "█".repeat(filled), pct, color: s.color }
    })
}

export function asciiBarChart(
  data: { label: string; value: number }[],
  width = 20,
  fillChar = "█",
): { label: string; bar: string; value: number }[] {
  const max = Math.max(...data.map((d) => d.value), 1)
  return data.map((d) => {
    const filled = Math.round((d.value / max) * width)
    return { label: d.label, bar: fillChar.repeat(filled) + "░".repeat(width - filled), value: d.value }
  })
}

export function asciiHeatmap(
  grid: number[][],
  maxVal: number,
): string[][] {
  const chars = [" ", "░", "▒", "▓", "█"]
  return grid.map((row) =>
    row.map((val) => {
      if (maxVal === 0) return chars[0]
      const idx = Math.min(chars.length - 1, Math.round((val / maxVal) * (chars.length - 1)))
      return chars[idx]
    }),
  )
}
