let _focused = false

export function setGlobalInputFocus(focused: boolean): void {
  _focused = focused
}

export function isGlobalInputFocused(): boolean {
  return _focused
}
