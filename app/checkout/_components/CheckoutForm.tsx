"use client";

import { useMemo, useState } from "react";
import { fmt } from "@/types";

type ShippingMethod = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  estimatedDays: number;
};

type CartLine = {
  id: number;
  name: string;
  price: number;
  quantity: number;
};

type CouponSummary = {
  code: string;
  discountType: string;
  discountValue: number;
  description: string | null;
  discountAmount: number;
};

type CheckoutFormProps = {
  cart: CartLine[];
  shippingMethods: ShippingMethod[];
  subtotal: number;
  subtotalAfterDiscount: number;
  coupon: CouponSummary | null;
  checkoutAction: (formData: FormData) => Promise<void>;
};

export default function CheckoutForm({
  cart,
  shippingMethods,
  subtotal,
  subtotalAfterDiscount,
  coupon,
  checkoutAction,
}: CheckoutFormProps) {
  const [selectedMethodId, setSelectedMethodId] = useState(
    () => shippingMethods[0]?.id ?? 0
  );

  const selectedMethod = useMemo(
    () => shippingMethods.find((method) => method.id === selectedMethodId) ?? shippingMethods[0],
    [shippingMethods, selectedMethodId]
  );

  const shippingCost = selectedMethod?.price ?? 0;
  const total = subtotalAfterDiscount + shippingCost;

  return (
    <form action={checkoutAction}>
      {coupon && <input type="hidden" name="coupon_code" value={coupon.code} />}

      <div className="row g-4">
        <div className="col-lg-5 order-first order-lg-last checkout-col-right">
          <div className="card border-0 shadow-sm checkout-summary-sticky" style={{ top: 80 }}>
            <div className="card-header fw-bold">Resumen del pedido</div>
            <div className="card-body">
              {cart.map((item) => (
                <div key={item.id} className="d-flex justify-content-between small mb-1 gap-2">
                  <span className="text-truncate">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="flex-shrink-0">${fmt(item.price * item.quantity)}</span>
                </div>
              ))}
              <hr />
              <div className="d-flex justify-content-between mb-1">
                <span>Subtotal</span>
                <strong>${fmt(subtotal)}</strong>
              </div>
              {coupon && (
                <div className="mb-2">
                  <div className="d-flex justify-content-between discount-line small fw-bold">
                    <span>
                      <i className="bi bi-tag-fill me-1"></i>
                      Descuento ({coupon.code})
                    </span>
                    <span>-${fmt(coupon.discountAmount)}</span>
                  </div>
                  <div className="coupon-badge px-2 py-1 mt-1">
                    <small className="text-muted">
                      {coupon.discountType === "percentage"
                        ? `${coupon.discountValue}% de descuento`
                        : `$${fmt(coupon.discountValue)} de descuento fijo`}
                      {coupon.description ? ` — ${coupon.description}` : ""}
                    </small>
                  </div>
                </div>
              )}
              <div className="d-flex justify-content-between text-muted small mb-1">
                <span>Envío</span>
                <span>{shippingCost > 0 ? `$${fmt(shippingCost)}` : "Gratis"}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-bold fs-5">Total</span>
                <span className="checkout-total">${fmt(total)}</span>
              </div>
              <button type="submit" className="btn btn-success w-100 mt-3 btn-lg">
                <i className="bi bi-bag-check"></i> Confirmar pedido
              </button>
            </div>
          </div>
        </div>

        <div className="col-lg-7 order-last order-lg-first checkout-col-left">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header fw-bold">Datos de envío</div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Dirección</label>
                <input type="text" name="shipping_address" className="form-control" required />
              </div>
              <div className="mb-3">
                <label className="form-label">Ciudad</label>
                <input type="text" name="shipping_city" className="form-control" required />
              </div>
              <div className="mb-3">
                <label className="form-label">Teléfono</label>
                <input type="text" name="shipping_phone" className="form-control" required />
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-header fw-bold">Método de envío</div>
            <div className="card-body">
              {shippingMethods.map((method) => {
                const isSelected = selectedMethodId === method.id;

                return (
                  <div
                    key={method.id}
                    className={`method-option mb-2${isSelected ? " is-selected" : ""}`}
                    onClick={() => setSelectedMethodId(method.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedMethodId(method.id);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isSelected}
                  >
                    <input
                      className="method-radio"
                      type="radio"
                      name="shipping_method_id"
                      value={method.id}
                      checked={isSelected}
                      onChange={() => setSelectedMethodId(method.id)}
                      required
                      tabIndex={-1}
                      aria-hidden="true"
                    />
                    <div className="method-label">
                      <div className="d-flex justify-content-between align-items-center gap-2">
                        <div>
                          <strong>{method.name}</strong>
                          {method.description && (
                            <span className="text-muted ms-2">— {method.description}</span>
                          )}
                          <div>
                            <small className="text-muted">
                              {method.estimatedDays} día(s) hábil(es)
                            </small>
                          </div>
                        </div>
                        <span className="shipping-price fw-bold flex-shrink-0">
                          {method.price > 0 ? `$${fmt(method.price)}` : "Gratis"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
