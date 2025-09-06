import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(
  value: number | undefined | null,
  options: { currency?: string; locale?: string } = {}
) {
  const { currency = "USD", locale } = options
  const n = typeof value === "number" ? value : 0
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency }).format(n)
  } catch {
    // Fallback if currency code is invalid
    return new Intl.NumberFormat(locale).format(n)
  }
}
