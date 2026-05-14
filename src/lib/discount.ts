export function calcDiscount(
  discountType: string,
  discountValue: number,
  subtotal: number
): number {
  if (discountType === "percentage") {
    return Math.min((subtotal * discountValue) / 100, subtotal);
  }
  return Math.min(discountValue, subtotal);
}
