import { getSetting } from "../modules/settings/settingsStore"
import { getThemeByKey, type Theme } from "../utils/themes"

export function useTheme(): Theme {
  const themeKey = getSetting("theme") ?? "tokyo_night"
  return getThemeByKey(themeKey)
}
