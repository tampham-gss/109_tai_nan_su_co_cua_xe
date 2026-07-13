/** Định dạng số tiền với dấu phẩy ngăn cách hàng nghìn (vd: 12,500,000). */
export function formatCurrency(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString("en-US");
}

export function parseCurrencyInput(raw: string): number {
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return 0;
  return Number(digits);
}
