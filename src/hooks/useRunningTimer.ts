import { useEffect } from "react"
import { useTimerStore } from "../stores/useTimerStore"

export function useRunningTimer() {
  const { runningTimer, elapsed, refresh, start, stop } = useTimerStore()

  useEffect(() => {
    const interval = setInterval(refresh, 1000)
    return () => clearInterval(interval)
  }, [])

  return { runningTimer, elapsed, startTimer: start, stopTimer: stop }
}
