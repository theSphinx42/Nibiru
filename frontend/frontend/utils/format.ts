/**
 * Format price with proper currency symbol and decimals
 */
export const formatPrice = (price: number | string): string => {
  const numericPrice = typeof price === 'number' ? price : Number(price);
  return `$${numericPrice.toFixed(2)}`;
};

/**
 * Format currency (alias of formatPrice)
 */
export const formatCurrency = formatPrice;

/**
 * Format number with commas for thousands
 */
export const formatNumber = (num: number | string): string => {
  const numericValue = typeof num === 'number' ? num : Number(num);
  return numericValue.toLocaleString('en-US');
};

/**
 * Format date to locale string
 */
export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}; 