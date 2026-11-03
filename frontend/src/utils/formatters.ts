import { CurrencyMode } from '@/types';

export const PKR_USD_EXCHANGE_RATE = 280.0;

/**
 * Format large monetary sums (e.g. TAM, SAM, SOM, funding, valuations)
 * with abbreviations (M, B, K) and active currency conversion (benchmark 280 PKR/USD).
 */
export function formatMoney(
  valueInPKR: number | string | null | undefined,
  currency: CurrencyMode = 'PKR'
): string {
  if (valueInPKR == null) {
    return currency === 'USD' ? '$0' : 'PKR 0';
  }

  const numStr = String(valueInPKR).replace(/[^0-9.-]/g, '');
  const val = parseFloat(numStr);
  if (isNaN(val)) {
    return currency === 'USD' ? '$0' : 'PKR 0';
  }
  if (currency === 'USD') {
    const usd = val / PKR_USD_EXCHANGE_RATE;
    if (usd >= 1_000_000_000) {
      return `$${(usd / 1_000_000_000).toFixed(2)}B`;
    }
    if (usd >= 1_000_000) {
      return `$${(usd / 1_000_000).toFixed(2)}M`;
    }
    if (usd >= 1_000) {
      return `$${(usd / 1_000).toFixed(1)}K`;
    }
    return `$${usd.toFixed(2)}`;
  }

  // PKR
  if (val >= 1_000_000_000) {
    return `PKR ${(val / 1_000_000_000).toFixed(2)}B`;
  }
  if (val >= 1_000_000) {
    return `PKR ${(val / 1_000_000).toFixed(1)}M`;
  }
  if (val >= 1_000) {
    return `PKR ${(val / 1_000).toFixed(0)}K`;
  }
  return `PKR ${val.toLocaleString()}`;
}

/**
 * Format unit product price or service fees (e.g. PKR 12,500 or $44.60)
 */
export function formatPrice(
  valueInPKR: number | string | null | undefined,
  currency: CurrencyMode = 'PKR'
): string {
  if (valueInPKR == null) {
    return currency === 'USD' ? '$0.00' : 'PKR 0';
  }

  const numStr = String(valueInPKR).replace(/[^0-9.-]/g, '');
  const val = parseFloat(numStr);
  if (isNaN(val)) {
    return currency === 'USD' ? '$0.00' : 'PKR 0';
  }
  if (currency === 'USD') {
    const usd = val / PKR_USD_EXCHANGE_RATE;
    return `$${usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  return `PKR ${val.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}
