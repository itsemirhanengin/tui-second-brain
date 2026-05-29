import { create } from "zustand"
import {
  getRoutines,
  createRoutine,
  deleteRoutine,
  toggleRoutineActive,
  logRoutine,
  getTodayRoutinesWithStatus,
  getCompletionRate,
  getLogsByRoutine,
  getWeeklyCompletionGrid,
  type Routine,
  type RoutineLog,
} from "../modules/routines/routinesStore"

interface TodayRoutineEntry {
  routine: Routine
  log: RoutineLog | null
  isDue: boolean
}

interface RoutineState {
  todayRoutines: TodayRoutineEntry[]
  allRoutines: Routine[]

  refresh: () => void
  addRoutine: (name: string, description: string, frequency: string, days: number[], timeOfDay: string | null) => void
  removeRoutine: (id: number) => void
  toggleActive: (id: number) => void
  log: (routineId: number, status: "completed" | "skipped" | "missed", note: string) => void
  getCompletionRate: (routineId: number, days: number) => number
  getLogsByRoutine: (routineId: number, limit: number) => RoutineLog[]
  getWeeklyCompletionGrid: (weeks: number) => { grid: number[][] }
}

export const useRoutineStore = create<RoutineState>((set, get) => ({
  todayRoutines: getTodayRoutinesWithStatus(),
  allRoutines: getRoutines(false),

  refresh: () => set({
    todayRoutines: getTodayRoutinesWithStatus(),
    allRoutines: getRoutines(false),
  }),

  addRoutine: (name, description, frequency, days, timeOfDay) => {
    createRoutine(name, description, frequency, days, timeOfDay)
    get().refresh()
  },

  removeRoutine: (id) => {
    deleteRoutine(id)
    get().refresh()
  },

  toggleActive: (id) => {
    toggleRoutineActive(id)
    get().refresh()
  },

  log: (routineId, status: "completed" | "skipped" | "missed", note) => {
    logRoutine(routineId, status, note)
    get().refresh()
  },

  getCompletionRate,
  getLogsByRoutine,
  getWeeklyCompletionGrid,
}))
