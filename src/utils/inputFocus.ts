import { useUIStore } from "../stores/useUIStore"

export function setGlobalInputFocus(focused: boolean): void {
  useUIStore.getState().setInputFocused(focused)
}

export function isGlobalInputFocused(): boolean {
  return useUIStore.getState().inputFocused
}
