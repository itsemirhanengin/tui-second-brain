import { create } from "zustand"

interface UIState {
  inputFocused: boolean
  pendingAction: string | null

  setInputFocused: (focused: boolean) => void
  setPendingAction: (action: string) => void
  consumePendingAction: () => string | null
}

export const useUIStore = create<UIState>((set, get) => ({
  inputFocused: false,
  pendingAction: null,

  setInputFocused: (focused) => set({ inputFocused: focused }),
  setPendingAction: (action) => set({ pendingAction: action }),
  consumePendingAction: () => {
    const action = get().pendingAction
    if (action) set({ pendingAction: null })
    return action
  },
}))
