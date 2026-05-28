import { useState, useCallback } from "react"

export type MainModule = "dashboard" | "life" | "routines" | "work" | "settings"
export type LifeSubModule = "water" | "notes" | "budget" | "liabilities"
export type WorkSubModule = "projects" | "clients" | "timetracker" | "workdashboard"
export type RoutineSubModule = "list" | "stats"
export type SettingsSubModule = "general" | "water" | "budget" | "export"

export type SubModule = LifeSubModule | WorkSubModule | RoutineSubModule | SettingsSubModule | null

export interface NavigationState {
  module: MainModule
  subModule: SubModule
  viewStack: string[]
}

export function useNavigation() {
  const [state, setState] = useState<NavigationState>({
    module: "dashboard",
    subModule: null,
    viewStack: [],
  })

  const navigate = useCallback((module: MainModule, subModule: SubModule = null) => {
    setState({ module, subModule, viewStack: [] })
  }, [])

  const setSubModule = useCallback((subModule: SubModule) => {
    setState((prev) => ({ ...prev, subModule, viewStack: [] }))
  }, [])

  const pushView = useCallback((view: string) => {
    setState((prev) => ({ ...prev, viewStack: [...prev.viewStack, view] }))
  }, [])

  const popView = useCallback(() => {
    setState((prev) => {
      if (prev.viewStack.length > 0) {
        return { ...prev, viewStack: prev.viewStack.slice(0, -1) }
      }
      if (prev.subModule) {
        return { ...prev, subModule: null }
      }
      return { ...prev, module: "dashboard" }
    })
  }, [])

  const currentView = state.viewStack[state.viewStack.length - 1] ?? null

  return {
    ...state,
    currentView,
    navigate,
    setSubModule,
    pushView,
    popView,
  }
}

export type Navigation = ReturnType<typeof useNavigation>
