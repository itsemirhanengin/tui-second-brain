import { useState, useCallback } from "react"

interface ListNavigationOptions {
  initialIndex?: number
  wrap?: boolean
}

export function useListNavigation(length: number, options: ListNavigationOptions = {}) {
  const { initialIndex = 0, wrap = false } = options
  const [selectedIndex, setSelectedIndex] = useState(initialIndex)

  const moveUp = useCallback(() => {
    setSelectedIndex((i) => {
      if (i <= 0) return wrap ? length - 1 : 0
      return i - 1
    })
  }, [length, wrap])

  const moveDown = useCallback(() => {
    setSelectedIndex((i) => {
      if (i >= length - 1) return wrap ? 0 : length - 1
      return i + 1
    })
  }, [length, wrap])

  const reset = useCallback((index = 0) => {
    setSelectedIndex(index)
  }, [])

  const clamp = useCallback(() => {
    setSelectedIndex((i) => Math.min(i, Math.max(0, length - 1)))
  }, [length])

  return {
    selectedIndex,
    setSelectedIndex,
    moveUp,
    moveDown,
    reset,
    clamp,
  }
}
