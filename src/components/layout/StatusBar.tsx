import { getRunningTimer } from "../../modules/work/workStore"
import { getPomodoroState, formatPomodoroTime } from "../../modules/work/pomodoroStore"
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
  const [pomoText, setPomoText] = useState("")
  const [pomoPhase, setPomoPhase] = useState<"idle" | "work" | "break">("idle")
  const [alertCount, setAlertCount] = useState(0)
  const [tick, setTick] = useState(0)

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

      const pomo = getPomodoroState()
      if (pomo.phase !== "idle") {
        const label = pomo.phase === "work" ? "WORK" : "BREAK"
        const icon = pomo.phase === "work" ? "#" : "~"
        setPomoText(`${icon} ${label} ${formatPomodoroTime(pomo.remainingSeconds)} [${pomo.sessionCount}]`)
        setPomoPhase(pomo.phase)
      } else {
        setPomoText("")
        setPomoPhase("idle")
      }

      setTick((t) => t + 1)
      if (tick % 5 === 0) setAlertCount(getNotificationCount())
    }, 1000)
    return () => clearInterval(interval)
  }, [tick])

  const badgeText = alertCount > 0 ? `[${alertCount}!] ` : ""

  return (
    <box style={{ height: 1, backgroundColor: t.bg, paddingLeft: 1, paddingRight: 1, flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
      <text fg={t.textSecondary}>{message ?? "⇧1..5: Navigate | Tab: Sub-module | Ctrl+P: Commands | ?: Help"}</text>
      <box style={{ flexDirection: "row", gap: 1 }}>
        {alertCount > 0 && <text fg={t.error}>{badgeText}</text>}
        {pomoText && <text fg={pomoPhase === "work" ? t.error : t.success}>{pomoText}</text>}
        {timerText && <text fg={t.warning}>{timerText}</text>}
      </box>
    </box>
  )
}
