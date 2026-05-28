import { getRunningTimer } from "../../modules/work/workStore"
import { getNotificationCount } from "../../utils/notifications"
import { useState, useEffect } from "react"
import { formatDuration } from "../../utils/date"
import { useTheme } from "../../hooks/useTheme"

interface StatusBarProps {
  message?: string
}

export function StatusBar({ message }: StatusBarProps) {
  const t = useTheme()
  const [timerText, setTimerText] = useState("")
  const [alertCount, setAlertCount] = useState(0)

  useEffect(() => {
    setAlertCount(getNotificationCount())
    const interval = setInterval(() => {
      const running = getRunningTimer()
      if (running) {
        const elapsed = Math.round((Date.now() - new Date(running.start_time).getTime()) / 60000)
        setTimerText(`Timer: ${formatDuration(elapsed)} ${running.description ? `(${running.description})` : ""}`)
      } else {
        setTimerText("")
      }
      setAlertCount(getNotificationCount())
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const badgeText = alertCount > 0 ? `[${alertCount} alert${alertCount > 1 ? "s" : ""}] ` : ""

  return (
    <box style={{ height: 1, backgroundColor: t.bg, paddingLeft: 1, paddingRight: 1, flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
      <text fg={t.textSecondary}>{message ?? "⇧1..5: Navigate | Tab: Sub-module | Ctrl+P: Commands | ?: Help"}</text>
      <box style={{ flexDirection: "row" }}>
        {alertCount > 0 && <text fg={t.error}>{badgeText}</text>}
        {timerText && <text fg={t.warning}>{timerText}</text>}
      </box>
    </box>
  )
}
