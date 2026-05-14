import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CartItem, fmt, getImageUrl } from "@/types";
import { addToCart, updateCartItem, removeFromCart, clearCart } from "@/lib/actions/cart";
import { applyCoupon, removeCoupon } from "@/lib/actions/coupons";
import { calcDiscount } from "@/lib/discount";

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

async function getAppliedCouponData(subtotal: number) {
  const cookieStore = await cookies();
  const couponCookie = cookieStore.get("applied_coupon");
  if (!couponCookie?.value) return null;

  const coupon = await prisma.coupon.findUnique({
    where: { code: couponCookie.value },
  });

  if (!coupon || !coupon.active) return null;
  if (coupon.expiresAt && coupon.expiresAt < new Date()) return null;
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) return null;
  if (subtotal < coupon.minPurchase) return null;

  const discountAmount = calcDiscount(coupon.discountType, coupon.discountValue, subtotal);
  return { ...coupon, discountAmount };
}

export default async function CartPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const cart = await getCart();
  const session = await auth();
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const coupon = await getAppliedCouponData(subtotal);
  const discountAmount = coupon?.discountAmount ?? 0;
  const totalAfterDiscount = subtotal - discountAmount;

  return (
    <>
      <style>{`
        .cart-title { animation: fadeInLeft .45s ease both; }
        .cart-item { opacity: 0; transform: translateX(-20px); transition: opacity .4s ease, transform .4s ease, background .25s; }
        .cart-item.visible { opacity: 1; transform: none; }
        .cart-item:hover { background: rgba(129,140,248,.07) !important; }
        .cart-item img { transition: transform .3s ease; border-radius: 8px; }
        .cart-item:hover img { transform: scale(1.08); }
        .summary-card { animation: fadeInRight .5s .15s ease both; position: sticky; top: 80px; }
        .summary-total { animation: popIn .5s .4s ease both; font-size: 1.5rem; background: linear-gradient(45deg, #818cf8, #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .cart-empty-icon { color: #818cf8 !important; animation: float 3s ease-in-out infinite; }
        .item-line-total { background: linear-gradient(45deg, #818cf8, #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .coupon-badge { background: rgba(52,211,153,.12); border: 1px solid rgba(52,211,153,.3); border-radius: 8px; padding: 6px 10px; }
        .discount-line { color: #34d399 !important; }
      `}</style>

      <h2 className="fw-bold mb-4 cart-title"><i className="bi bi-cart3"></i> Mi Carrito</h2>

      {sp.success && (
        <div className="alert alert-success alert-dismissible fade show">
          <i className="bi bi-check-circle-fill me-2"></i>{decodeURIComponent(sp.success)}
          <button type="button" className="btn-close" data-bs-dismiss="alert"></button>
        </div>
      )}
      {sp.error && (
        <div className="alert alert-danger alert-dismissible fade show">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>{decodeURIComponent(sp.error)}
          <button type="button" className="btn-close" data-bs-dismiss="alert"></button>
        </div>
      )}

      {cart.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-cart-x display-1 text-muted cart-empty-icon"></i>
          <p className="text-muted mt-3">Tu carrito está vacío.</p>
          <a href="/productos" className="btn btn-primary mt-2">Ver productos</a>
        </div>
      ) : (
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm">
              <div className="d-none d-md-flex px-3 py-2 border-bottom" style={{ background: "rgba(99,102,241,.08)" }}>
                <div style={{ width: 80 }} className="text-muted small fw-semibold"></div>
                <div className="flex-grow-1 text-muted small fw-semibold ms-3">Producto</div>
                <div style={{ width: 140 }} className="text-muted small fw-semibold text-center">Cantidad</div>
                <div style={{ width: 90 }} className="text-muted small fw-semibold text-end">Subtotal</div>
                <div style={{ width: 40 }}></div>
              </div>
              <div className="card-body p-0">
                {cart.map((item) => {
                  const imgSrc = getImageUrl(item.image, item.name);
                  return (
                    <div key={item.id} className="cart-item border-bottom mx-0 px-3 py-3">
                      <div className="d-flex align-items-start gap-3">
                        <a href="#" className="flex-shrink-0">
                          <img src={imgSrc} alt={item.name} style={{ width: 72, height: 72, objectFit: "cover" }} className="rounded" />
                        </a>
                        <div className="flex-grow-1 min-w-0">
                          <p className="fw-bold mb-0 lh-sm">{item.name}</p>
                          <p className="text-muted small mb-0">${fmt(item.price)} c/u</p>
                          <div className="d-flex align-items-center gap-2 mt-2 flex-wrap">
                            <form action={updateCartItem} className="d-flex align-items-center gap-1">
                              <input type="hidden" name="product_id" value={item.id} />
                              <input type="number" name="quantity" defaultValue={item.quantity} min="1" className="form-control form-control-sm" style={{ width: 64 }} />
                              <button className="btn btn-sm btn-outline-secondary" title="Actualizar">
                                <i className="bi bi-arrow-clockwise"></i>
                              </button>
                            </form>
                            <span className="fw-bold item-line-total ms-auto">
                              ${fmt(item.price * item.quantity)}
                            </span>
                            <form action={removeFromCart}>
                              <input type="hidden" name="product_id" value={item.id} />
                              <button className="btn btn-sm btn-outline-danger" title="Eliminar">
                                <i className="bi bi-trash"></i>
                              </button>
                            </form>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <form action={clearCart} className="mt-2 text-end">
              <button className="btn btn-sm btn-outline-danger">
                <i className="bi bi-trash3"></i> Vaciar carrito
              </button>
            </form>
          </div>

          <div className="col-lg-4">
            <div className="card border-0 shadow-sm summary-card">
              <div className="card-body">
                <h5 className="fw-bold">Resumen del pedido</h5>
                <hr />

                <div className="d-flex justify-content-between mb-2 align-items-center">
                  <span className="text-muted">Subtotal</span>
                  <strong>${fmt(subtotal)}</strong>
                </div>

                {coupon ? (
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="discount-line small">
                        <i className="bi bi-tag-fill me-1"></i>
                        Descuento ({coupon.code})
                      </span>
                      <span className="discount-line fw-bold">-${fmt(discountAmount)}</span>
                    </div>
                    <div className="coupon-badge d-flex justify-content-between align-items-center">
                      <small className="text-muted">
                        {coupon.discountType === "percentage"
                          ? `${coupon.discountValue}% de descuento`
                          : `$${fmt(coupon.discountValue)} de descuento fijo`}
                        {coupon.description ? ` — ${coupon.description}` : ""}
                      </small>
                      <form action={removeCoupon} className="ms-2">
                        <button className="btn btn-sm btn-outline-danger py-0 px-1" title="Quitar cupón" style={{ fontSize: "0.7rem" }}>
                          <i className="bi bi-x"></i>
                        </button>
                      </form>
                    </div>
                    <hr className="my-2" />
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="fw-bold">Total productos</span>
                      <strong className="summary-total">${fmt(totalAfterDiscount)}</strong>
                    </div>
                    <small className="text-muted d-block mt-1">* No incluye costo de envío</small>
                  </div>
                ) : (
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="fw-bold">Total productos</span>
                      <strong className="summary-total">${fmt(subtotal)}</strong>
                    </div>
                    <small className="text-muted d-block mt-1">* No incluye costo de envío</small>
                  </div>
                )}

                <div className="mb-3">
                  {!coupon ? (
                    <form action={applyCoupon} className="d-flex gap-2">
                      <input
                        type="text"
                        name="coupon_code"
                        placeholder="Código de cupón"
                        className="form-control form-control-sm"
                        style={{ textTransform: "uppercase" }}
                        maxLength={50}
                      />
                      <button className="btn btn-sm btn-outline-primary flex-shrink-0">
                        <i className="bi bi-tag"></i> Aplicar
                      </button>
                    </form>
                  ) : (
                    <div className="text-center">
                      <span className="badge" style={{ background: "rgba(52,211,153,.2)", color: "#34d399", border: "1px solid rgba(52,211,153,.3)", fontSize: "0.85rem", padding: "6px 12px" }}>
                        <i className="bi bi-check-circle-fill me-1"></i> Cupón aplicado
                      </span>
                    </div>
                  )}
                </div>

                <hr />

                {session?.user ? (
                  <a
                    href={coupon ? `/checkout?coupon=${encodeURIComponent(coupon.code)}` : "/checkout"}
                    className="btn btn-primary w-100 btn-lg text-white"
                  >
                    <i className="bi bi-credit-card"></i> Ir al checkout
                  </a>
                ) : (
                  <a href="/login" className="btn btn-primary w-100">
                    Inicia sesión para comprar
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <script dangerouslySetInnerHTML={{ __html: `
        document.querySelectorAll('.cart-item').forEach((el, i) => {
          el.style.transitionDelay = (i * 0.07) + 's';
          requestAnimationFrame(() => el.classList.add('visible'));
        });
      ` }} />
    </>
  );
}
