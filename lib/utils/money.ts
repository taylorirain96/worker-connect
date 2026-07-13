export function normalizeCurrencyAmount(amount: number) {
  return Math.round(amount * 100) / 100
}
