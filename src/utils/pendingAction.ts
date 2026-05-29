import { useUIStore } from "../stores/useUIStore"

export function setPendingAction(action: string): void {
  useUIStore.getState().setPendingAction(action)
}

export function consumePendingAction(): string | null {
  return useUIStore.getState().consumePendingAction()
}
