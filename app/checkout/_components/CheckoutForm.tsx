"use client";

import { FormEvent, useMemo, useState } from "react";
import { fmt, getImageUrl } from "@/types";
import { prepareCheckoutPayment } from "@/lib/actions/prepare-checkout-payment";
import StripePaymentStep from "./StripePaymentStep";

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
  image: string | null;
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
  stripePublishableKey: string | null;
};

export default function CheckoutForm({
  cart,
  shippingMethods,
  subtotal,
  subtotalAfterDiscount,
  coupon,
  stripePublishableKey,
}: CheckoutFormProps) {
  const [selectedMethodId, setSelectedMethodId] = useState(
    () => shippingMethods[0]?.id ?? 0
  );
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const [paymentData, setPaymentData] = useState<{
    clientSecret: string;
    customerSessionClientSecret: string | null;
    orderId: number;
  } | null>(null);

  const selectedMethod = useMemo(
    () => shippingMethods.find((method) => method.id === selectedMethodId) ?? shippingMethods[0],
    [shippingMethods, selectedMethodId]
  );

  const shippingCost = selectedMethod?.price ?? 0;
  const total = subtotalAfterDiscount + shippingCost;

  const handlePreparePayment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!stripePublishableKey) {
      setErrorMessage("Stripe no está configurado. Añade NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY en .env.local.");
      return;
    }

    setIsPreparing(true);

    const formData = new FormData();
    formData.set("shipping_method_id", String(selectedMethodId));
    formData.set("shipping_address", shippingAddress);
    formData.set("shipping_city", shippingCity);
    formData.set("shipping_phone", shippingPhone);
    if (coupon) {
      formData.set("coupon_code", coupon.code);
    }

    const result = await prepareCheckoutPayment(formData);
    setIsPreparing(false);

    if (!result || "error" in result) {
      setErrorMessage(result?.error ?? "No se pudo preparar el pago. Inténtalo nuevamente.");
      return;
    }

    setPaymentData({
      clientSecret: result.clientSecret,
      customerSessionClientSecret: result.customerSessionClientSecret,
      orderId: result.orderId,
    });
  };

  const handleBackToShipping = () => {
    setPaymentData(null);
    setErrorMessage(null);
  };

  return (
    <div className="row g-4">
      <div className="col-lg-5 order-first order-lg-last checkout-col-right">
        <div className="card border-0 shadow-sm checkout-summary-sticky" style={{ top: 80 }}>
          <div className="card-header fw-bold">Resumen del pedido</div>
          <div className="card-body">
            {cart.map((item) => {
              const imgSrc = getImageUrl(item.image, item.name);

              return (
                <div key={item.id} className="checkout-item d-flex gap-2 mb-2">
                  <img
                    src={imgSrc}
                    alt={item.name}
                    className="checkout-item-thumb flex-shrink-0"
                  />
                  <div className="flex-grow-1 min-w-0">
                    <div className="d-flex justify-content-between gap-2 checkout-item-line small">
                      <span className="text-truncate">
                        {item.name} × {item.quantity}
                      </span>
                      <span className="flex-shrink-0">${fmt(item.price * item.quantity)}</span>
                    </div>
                    <small className="text-muted d-block">${fmt(item.price)} c/u</small>
                  </div>
                </div>
              );
            })}
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
          </div>
        </div>
      </div>

      <div className="col-lg-7 order-last order-lg-first checkout-col-left">
        {!paymentData ? (
          <form onSubmit={handlePreparePayment}>
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header fw-bold">Datos de envío</div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label" htmlFor="shipping_address">
                    Dirección
                  </label>
                  <input
                    id="shipping_address"
                    type="text"
                    className="form-control"
                    value={shippingAddress}
                    onChange={(event) => setShippingAddress(event.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="shipping_city">
                    Ciudad
                  </label>
                  <input
                    id="shipping_city"
                    type="text"
                    className="form-control"
                    value={shippingCity}
                    onChange={(event) => setShippingCity(event.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="shipping_phone">
                    Teléfono
                  </label>
                  <input
                    id="shipping_phone"
                    type="text"
                    className="form-control"
                    value={shippingPhone}
                    onChange={(event) => setShippingPhone(event.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="card border-0 shadow-sm mb-4">
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

            {errorMessage && (
              <div className="alert alert-danger" role="alert">
                {errorMessage}
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-lg w-100" disabled={isPreparing}>
              <i className="bi bi-credit-card me-1"></i>
              {isPreparing ? "Preparando pago..." : "Continuar al pago"}
            </button>
          </form>
        ) : (
          <div className="card border-0 shadow-sm">
            <div className="card-header fw-bold">Pago seguro</div>
            <div className="card-body">
              <p className="text-muted small mb-3">
                Completa el pago sin salir de BitMark. El pedido #{paymentData.orderId} quedará pendiente
                hasta confirmar el cobro.
              </p>
              <StripePaymentStep
                publishableKey={stripePublishableKey!}
                clientSecret={paymentData.clientSecret}
                customerSessionClientSecret={paymentData.customerSessionClientSecret}
                total={total}
                onBack={handleBackToShipping}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
