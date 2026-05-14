import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { finalizeStripeOrder, finalizeStripePaymentFromIntent } from "@/lib/payments/finalize-stripe-order";
import { getStatusLabel, getStatusColor, fmt, getImageUrl } from "@/types";

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{
    success?: string;
    session_id?: string;
    payment_intent?: string;
    redirect_status?: string;
  }>;
}) {
  const sp = await searchParams;
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const userId = parseInt((session.user as { id: string }).id);
  let orderId: number | null = null;

  if (sp.payment_intent) {
    const result = await finalizeStripePaymentFromIntent(sp.payment_intent, userId);

    if (!result.ok) {
      if (result.reason === "forbidden") {
        redirect("/productos");
      }
      redirect("/checkout?error=No+se+pudo+confirmar+el+pago.+Inténtalo+nuevamente.");
    }

    orderId = result.orderId;
  } else if (sp.session_id) {
    const result = await finalizeStripeOrder(sp.session_id, userId);

    if (!result.ok) {
      if (result.reason === "forbidden") {
        redirect("/productos");
      }
      redirect("/checkout?error=No+se+pudo+confirmar+el+pago.+Inténtalo+nuevamente.");
    }

    orderId = result.orderId;
  } else {
    const cookieStore = await cookies();
    const orderIdCookie = cookieStore.get("last_order_id");
    if (orderIdCookie?.value) {
      orderId = parseInt(orderIdCookie.value);
    }
  }

  if (!orderId) {
    redirect("/productos");
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { product: true } },
      shippingMethod: true,
      user: true,
    },
  });

  if (!order || order.userId !== userId) {
    redirect("/productos");
  }

  return (
    <>
      <style>{`
        .confirmation-icon { animation: popIn .6s ease both; color: var(--success); }
        .confirmation-card { animation: fadeInUp .5s .15s ease both; }
        .order-total-big { background: linear-gradient(45deg, #818cf8, #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-size: 1.8rem; font-weight: 800; }
      `}</style>

      <div className="text-center mb-5" style={{ animation: "fadeInDown .5s ease both" }}>
        <i className="bi bi-bag-check-fill display-2 confirmation-icon"></i>
        <h2 className="fw-bold mt-3">
          {sp.success ? decodeURIComponent(sp.success) : "¡Pedido confirmado!"}
        </h2>
        <p className="text-muted">
          Tu pedido <strong style={{ color: "var(--accent)" }}>#{order.id}</strong> ha sido recibido y está siendo procesado.
        </p>
      </div>

      <div className="row g-4 justify-content-center">
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm confirmation-card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <span><i className="bi bi-receipt me-2"></i>Pedido #{order.id}</span>
              <span className={`badge bg-${getStatusColor(order.status)}`}>
                {getStatusLabel(order.status)}
              </span>
            </div>
            <div className="card-body">
              {order.items.map((item) => (
                <div key={item.id} className="d-flex align-items-center gap-3 mb-3">
                  <img
                    src={getImageUrl(item.product.image, item.product.name)}
                    alt={item.product.name}
                    style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 8 }}
                  />
                  <div className="flex-grow-1">
                    <p className="mb-0 fw-semibold">{item.product.name}</p>
                    <small className="text-muted">× {item.quantity} — ${fmt(item.unitPrice)} c/u</small>
                  </div>
                  <span className="fw-bold" style={{ color: "var(--accent)" }}>${fmt(item.subtotal)}</span>
                </div>
              ))}
              <hr />
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted">Subtotal</span>
                <span>${fmt(order.subtotal)}</span>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted">Envío ({order.shippingMethod.name})</span>
                <span>{order.shippingCost > 0 ? `$${fmt(order.shippingCost)}` : "Gratis"}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-bold fs-5">Total</span>
                <span className="order-total-big">${fmt(order.total)}</span>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm mt-3 confirmation-card" style={{ animationDelay: ".25s" }}>
            <div className="card-header"><i className="bi bi-truck me-2"></i>Dirección de envío</div>
            <div className="card-body">
              <p className="mb-1"><strong>{order.shippingAddress}</strong></p>
              <p className="mb-1 text-muted">{order.shippingCity}</p>
              <p className="mb-0 text-muted"><i className="bi bi-telephone me-1"></i>{order.shippingPhone}</p>
            </div>
          </div>

          <div className="d-flex gap-3 mt-4 flex-wrap">
            <a href="/mis-pedidos" className="btn btn-primary flex-fill">
              <i className="bi bi-box me-1"></i>Ver mis pedidos
            </a>
            <a href="/productos" className="btn btn-outline-secondary flex-fill">
              <i className="bi bi-grid me-1"></i>Seguir comprando
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
