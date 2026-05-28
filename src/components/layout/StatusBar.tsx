import { getRunningTimer } from "../../modules/work/workStore"
import { useState, useEffect } from "react"
import { formatDuration } from "../../utils/date"
import { useTheme } from "../../hooks/useTheme"

interface StatusBarProps {
  message?: string
}

export function StatusBar({ message }: StatusBarProps) {
  const t = useTheme()
  const [timerText, setTimerText] = useState("")

  useEffect(() => {
    const interval = setInterval(() => {
      const running = getRunningTimer()
      if (running) {
        const elapsed = Math.round((Date.now() - new Date(running.start_time).getTime()) / 60000)
        setTimerText(`Timer: ${formatDuration(elapsed)} ${running.description ? `(${running.description})` : ""}`)
      } else {
        setTimerText("")
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <box style={{ height: 1, backgroundColor: t.bg, paddingLeft: 1, paddingRight: 1, flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
      <text fg={t.textSecondary}>{message ?? "⇧1..5: Navigate | Tab: Sub-module | ESC: Back | ?: Help"}</text>
      {timerText && <text fg={t.warning}>{timerText}</text>}
    </box>
  )
}
