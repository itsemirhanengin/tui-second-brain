import { create } from "zustand"
import {
  getRunningTimer,
  startTimer as dbStartTimer,
  stopTimer as dbStopTimer,
  type TimeEntry,
} from "../modules/work/workStore"

interface TimerState {
  runningTimer: TimeEntry | null
  elapsed: number

  refresh: () => void
  start: (projectId: number | null, description: string) => void
  stop: () => void
}

export const useTimerStore = create<TimerState>((set, get) => ({
  runningTimer: getRunningTimer(),
  elapsed: 0,

  refresh: () => {
    const timer = getRunningTimer()
    const elapsed = timer
      ? Math.round((Date.now() - new Date(timer.start_time).getTime()) / 60000)
      : 0
    set({ runningTimer: timer, elapsed })
  },

  start: (projectId, description) => {
    dbStartTimer(projectId, description)
    get().refresh()
  },

  stop: () => {
    const timer = get().runningTimer
    if (timer) {
      dbStopTimer(timer.id)
      set({ runningTimer: null, elapsed: 0 })
    }
  },
}))
