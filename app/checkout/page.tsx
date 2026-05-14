import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CartItem } from "@/types";
import { checkoutAction } from "@/lib/actions/checkout";
import { calcDiscount } from "@/lib/discount";
import CheckoutForm from "./_components/CheckoutForm";

async function getCart(): Promise<CartItem[]> {
  const cookieStore = await cookies();
  const cartCookie = cookieStore.get("cart");
  if (!cartCookie?.value) return [];
  try {
    return JSON.parse(cartCookie.value);
  } catch {
    return [];
  }
}

async function getAppliedCouponData(subtotal: number, code: string) {
  try {
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!coupon || !coupon.active) return null;
    if (coupon.expiresAt && coupon.expiresAt < new Date()) return null;
    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) return null;
    if (subtotal < coupon.minPurchase) return null;

    const discountAmount = calcDiscount(coupon.discountType, coupon.discountValue, subtotal);
    return { ...coupon, discountAmount };
  } catch {
    return null;
  }
}

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; coupon?: string }>;
}) {
  const sp = await searchParams;
  const cart = await getCart();

  if (cart.length === 0) {
    redirect("/carrito?error=Tu+carrito+está+vacío");
  }

  const shippingMethods = await prisma.shippingMethod.findMany({
    where: { active: true },
    orderBy: { price: "asc" },
  });

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const cookieStore = await cookies();
  const couponCodeRaw =
    sp.coupon?.toUpperCase().trim() ||
    cookieStore.get("applied_coupon")?.value ||
    null;
  const coupon = couponCodeRaw ? await getAppliedCouponData(subtotal, couponCodeRaw) : null;
  const discountAmount = coupon?.discountAmount ?? 0;
  const subtotalAfterDiscount = subtotal - discountAmount;

  return (
    <>
      <style>{`
        .checkout-title { animation: fadeInLeft .5s ease both; background: linear-gradient(45deg, #818cf8, #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .checkout-col-left  { animation: fadeInLeft .5s .1s ease both; }
        .checkout-col-right { animation: fadeInRight .5s .15s ease both; }
        .checkout-total { background: linear-gradient(45deg, #818cf8, #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-size: 1.4rem; }
        .method-option { position: relative; border: 1px solid rgba(255,255,255,.1); border-radius: 10px; background: rgba(15,23,42,.5); transition: background .3s, border-color .3s, transform .2s; cursor: pointer; }
        .method-option:hover { background: rgba(129,140,248,.1); border-color: #818cf8; transform: translateX(4px); }
        .method-option.is-selected { background: rgba(99,102,241,.15); border-color: #818cf8; box-shadow: 0 0 15px rgba(129,140,248,.2); }
        .method-label { display: block; padding: 1rem; margin: 0; width: 100%; pointer-events: none; }
        .method-radio { position: absolute; opacity: 0; width: 0; height: 0; pointer-events: none; }
        .shipping-price { color: #818cf8 !important; }
        .discount-line { color: #34d399 !important; }
        .coupon-badge { background: rgba(52,211,153,.12); border: 1px solid rgba(52,211,153,.3); border-radius: 8px; }
        @media (max-width: 991.98px) { .checkout-summary-sticky { position: relative !important; top: auto !important; } }
      `}</style>

      <h2 className="fw-bold mb-4 checkout-title"><i className="bi bi-credit-card"></i> Checkout</h2>

      {sp.error && (
        <div className="alert alert-danger alert-dismissible fade show">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>{decodeURIComponent(sp.error)}
          <button type="button" className="btn-close" data-bs-dismiss="alert"></button>
        </div>
      )}

      <CheckoutForm
        cart={cart}
        shippingMethods={shippingMethods}
        subtotal={subtotal}
        subtotalAfterDiscount={subtotalAfterDiscount}
        coupon={
          coupon
            ? {
                code: coupon.code,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
                description: coupon.description,
                discountAmount,
              }
            : null
        }
        checkoutAction={checkoutAction}
      />
    </>
  );
}
