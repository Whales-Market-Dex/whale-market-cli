// Additional formatting utilities

export function formatAddress(address: string, length: number = 8): string {
  if (!address) return '-';
  if (address.length <= length) return address;
  return `${address.slice(0, length / 2)}...${address.slice(-length / 2)}`;
}

export function formatNumber(num: number | string, decimals: number = 2): string {
  const n = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(n)) return '-';
  return n.toFixed(decimals);
}

export function formatPercentage(num: number | string): string {
  const n = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(n)) return '-';
  return `${n.toFixed(2)}%`;
}
