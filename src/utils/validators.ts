export function isPositiveNumber(value: string): boolean {
  const n = Number(value)
  return !isNaN(n) && n > 0
}

export function isNonNegativeNumber(value: string): boolean {
  const n = Number(value)
  return !isNaN(n) && n >= 0
}

export function isValidDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !isNaN(new Date(value).getTime())
}

export function isNotEmpty(value: string): boolean {
  return value.trim().length > 0
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}
