let _pendingAction: string | null = null

export function setPendingAction(action: string): void {
  _pendingAction = action
}

export function consumePendingAction(): string | null {
  const action = _pendingAction
  _pendingAction = null
  return action
}
