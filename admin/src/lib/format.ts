export function formatCurrency(amount: number, currency = 'KES') {
  const formatted = Number(amount || 0).toLocaleString('en-KE', { maximumFractionDigits: 0 });
  return currency === 'KES' ? `KSh ${formatted}` : `${currency} ${formatted}`;
}

export function formatDate(iso?: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-KE');
}
