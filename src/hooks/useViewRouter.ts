import { useState, useEffect } from "react"
import { useUIStore } from "../stores/useUIStore"

interface ViewRouterOptions<T extends string> {
  propView: T
  defaultView?: T
}

export function useViewRouter<T extends string>(options: ViewRouterOptions<T>) {
  const { propView, defaultView } = options
  const [view, setView] = useState<T>(propView)
  const { setInputFocused } = useUIStore()

  useEffect(() => {
    setView(propView)
    setInputFocused(false)
  }, [propView])

  const navigate = (target: T, focus = false) => {
    setView(target)
    if (focus) setInputFocused(true)
  }

  const goBack = () => {
    setView(defaultView ?? propView)
    setInputFocused(false)
  }

  return { view, setView, navigate, goBack }
}
