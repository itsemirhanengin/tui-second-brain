const CURRENCY_SYMBOLS: Record<string, string> = {
  TRY: "₺",
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
}

export function getCurrencySymbol(code: string): string {
  return CURRENCY_SYMBOLS[code] ?? code
}

export function formatCurrency(amount: number, currency: string = "TRY"): string {
  const symbol = getCurrencySymbol(currency)
  const formatted = Math.abs(amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  const prefix = amount < 0 ? "-" : ""
  return `${prefix}${formatted} ${symbol}`
}
