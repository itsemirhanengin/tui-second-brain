import { useKeyboard } from "@opentui/react"
import type { Navigation } from "./useNavigation"

export function useKeyboardShortcuts(nav: Navigation, isInputFocused: boolean) {
  useKeyboard((key) => {
    if (isInputFocused) return

    if (key.name === "escape") {
      nav.popView()
      return
    }

    switch (key.name) {
      case "d":
        nav.navigate("dashboard")
        break
      case "l":
        nav.navigate("life", "water")
        break
      case "r":
        nav.navigate("routines", "list")
        break
      case "w":
        nav.navigate("work", "projects")
        break
      case "s":
        nav.navigate("settings", "general")
        break
    }
  })
}
