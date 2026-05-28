interface BadgeProps {
  text: string
  color?: string
  bg?: string
}

const PRESETS: Record<string, { fg: string; bg: string }> = {
  overdue: { fg: "#ffffff", bg: "#e94560" },
  warning: { fg: "#1a1b26", bg: "#f39c12" },
  success: { fg: "#1a1b26", bg: "#16c79a" },
  info: { fg: "#1a1b26", bg: "#3498db" },
  active: { fg: "#1a1b26", bg: "#7aa2f7" },
  paused: { fg: "#1a1b26", bg: "#f39c12" },
  completed: { fg: "#1a1b26", bg: "#16c79a" },
  archived: { fg: "#e2e8f0", bg: "#414868" },
}

export function Badge({ text, color, bg }: BadgeProps) {
  const preset = PRESETS[text.toLowerCase()]
  const fg = color ?? preset?.fg ?? "#e2e8f0"
  const bgColor = bg ?? preset?.bg ?? "#414868"

  return (
    <text fg={fg} bg={bgColor}>
      {` ${text} `}
    </text>
  )
}
