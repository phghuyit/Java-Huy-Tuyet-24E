export function formatCurrency(value) {
  const num = Number(value) || 0;
  return `${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(num)} ₫`;
}

export const currency = formatCurrency;

export function compactCurrency(value) {
  const num = Number(value) || 0;
  if (num >= 1_000_000_000) {
    const ty = num / 1_000_000_000;
    return `${ty.toFixed(ty < 10 ? 1 : 0).replace(".", ",")} tỷ`;
  }
  if (num >= 1_000_000) {
    const trieu = num / 1_000_000;
    return `${trieu.toFixed(trieu < 10 ? 1 : 0).replace(".", ",")} tr`;
  }
  if (num >= 1_000) {
    return `${Math.round(num / 1_000)}k`;
  }
  return String(num);
}

export function formatNumber(value, maxDigits = 0) {
  const num = Number(value) || 0;
  return num.toLocaleString("vi-VN", { maximumFractionDigits: maxDigits });
}

export function formatPercent(value, digits = 0) {
  const num = Number(value) || 0;
  return `${num.toLocaleString("vi-VN", { maximumFractionDigits: digits })}%`;
}

export const percent = formatPercent;

export function priceLabel(price, from = false) {
  return from ? `Từ ${formatCurrency(price)}` : formatCurrency(price);
}

const numberUtils = {
  formatCurrency,
  currency,
  compactCurrency,
  formatNumber,
  formatPercent,
  percent,
  priceLabel,
};

export default numberUtils;
