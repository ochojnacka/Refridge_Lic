/**
 * Format price/cost to 2 decimal places
 * Example: 123.456 → "123.46"
 */
export const formatPrice = (price: number | null | undefined): string => {
  if (!price && price !== 0) return '0.00';
  return parseFloat(price.toString()).toFixed(2);
};

/**
 * Format quantity to 2 decimal places
 * Example: 10.5 → "10.50"
 */
export const formatQty = (qty: number | null | undefined): string => {
  if (!qty && qty !== 0) return '0.00';
  return parseFloat(qty.toString()).toFixed(2);
};

/**
 * Format percentage to 2 decimal places
 * Example: 71.734 → "71.73"
 */
export const formatPercent = (percent: number | null | undefined): string => {
  if (!percent && percent !== 0) return '0.00';
  return parseFloat(percent.toString()).toFixed(2);
};

/**
 * Format any number to 2 decimal places
 * Example: 1234.5678 → "1234.57"
 */
export const formatNumber = (num: number | null | undefined): string => {
  if (!num && num !== 0) return '0.00';
  return parseFloat(num.toString()).toFixed(2);
};

/**
 * Format number as integer (no decimals)
 * Example: 10.5 → "10"
 */
export const formatInteger = (num: number | null | undefined): string => {
  if (!num && num !== 0) return '0';
  return Math.round(parseFloat(num.toString())).toString();
};
