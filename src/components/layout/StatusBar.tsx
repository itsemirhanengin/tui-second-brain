import { getRunningTimer } from "../../modules/work/workStore"
import { useState, useEffect } from "react"
import { formatDuration } from "../../utils/date"

interface StatusBarProps {
  message?: string
}

export function StatusBar({ message }: StatusBarProps) {
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
    <box style={{ height: 1, backgroundColor: "#1a1b26", paddingLeft: 1, paddingRight: 1, flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
      <text fg="#565f89">{message ?? "⇧1..5: Navigate | Tab: Sub-module | ESC: Back | ?: Help"}</text>
      {timerText && <text fg="#f39c12">{timerText}</text>}
    </box>
  )
}
