import { formatCurrency } from "../../utils/currency"

interface CurrencyDisplayProps {
  amount: number
  currency?: string
  colorize?: boolean
}

export function CurrencyDisplay({ amount, currency = "TRY", colorize = false }: CurrencyDisplayProps) {
  let color = "#e2e8f0"
  if (colorize) {
    color = amount > 0 ? "#16c79a" : amount < 0 ? "#e94560" : "#e2e8f0"
  }

  return <text fg={color}>{formatCurrency(amount, currency)}</text>
}
