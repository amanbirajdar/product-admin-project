/**
 * Currency formatting utilities for INR (Indian Rupees)
 */

/**
 * Convert USD to INR using a fixed exchange rate
 * Note: This is a fixed conversion for display purposes only
 * In a real application, you might fetch this from an API
 */
const USD_TO_INR_RATE = 83.45; // Fixed exchange rate as of 2026-09-24

/**
 * Convert USD amount to INR
 * @param usdAmount - Amount in USD
 * @returns Amount in INR
 */
export function usdToInr(usdAmount: number): number {
  return usdAmount * USD_TO_INR_RATE;
}

/**
 * Format a number as Indian Rupees (INR) currency
 * @param amount - Amount in INR
 * @returns Formatted currency string (e.g., "₹ 1,234.56")
 */
export function formatInr(amount: number): string {
  // Format with Indian Rupee symbol and Indian number formatting
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Convert USD to INR and format as currency
 * @param usdAmount - Amount in USD
 * @returns Formatted INR currency string (e.g., "₹ 83,450.00")
 */
export function formatUsdToInr(usdAmount: number): string {
  const inrAmount = usdToInr(usdAmount);
  return formatInr(inrAmount);
}

/**
 * Get the currency symbol for display
 */
export const CURRENCY_SYMBOL = '₹';