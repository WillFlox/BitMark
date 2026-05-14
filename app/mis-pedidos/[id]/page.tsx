import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStatusLabel, getStatusColor, fmt, getImageUrl } from "@/types";

export default async function OrderShowPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const orderId = parseInt(id);
  const userId = parseInt((session.user as { id: string }).id);

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { product: true } },
      shippingMethod: true,
      coupon: true,
    },
  });

  if (!order || order.userId !== userId) notFound();

  return (
    <>
      <style>{`
        .order-total-grad { background: linear-gradient(45deg, #818cf8, #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-weight: bold; font-size: 1.4rem; }
      `}</style>

      <nav aria-label="breadcrumb" style={{ animation: "fadeInDown .4s ease both" }}>
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><a href="/mis-pedidos">Mis pedidos</a></li>
          <li className="breadcrumb-item active">Pedido #{order.id}</li>
        </ol>
      </nav>

      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4">
        <h2 className="fw-bold mb-0" style={{ animation: "fadeInLeft .5s ease both", background: "linear-gradient(45deg, #818cf8, #c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
          <i className="bi bi-receipt"></i> Pedido #{order.id}
        </h2>
        <span className={`badge bg-${getStatusColor(order.status)} fs-6`}>{getStatusLabel(order.status)}</span>
      </div>

      <div className="row g-4">
        <div className="col-lg-8" style={{ animation: "fadeInLeft .5s .1s ease both" }}>
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header"><i className="bi bi-bag me-2"></i>Productos</div>
            <div className="card-body">
              {order.items.map((item) => (
                <div key={item.id} className="d-flex align-items-center gap-3 mb-3">
                  <img
                    src={getImageUrl(item.product.image, item.product.name)}
                    alt={item.product.name}
                    style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8 }}
                  />
                  <div className="flex-grow-1">
                    <a href={`/productos/${item.product.slug}`} className="fw-semibold text-decoration-none" style={{ color: "var(--text)" }}>
                      {item.product.name}
                    </a>
                    <p className="text-muted small mb-0">× {item.quantity} — ${fmt(item.unitPrice)} c/u</p>
                  </div>
                  <span className="fw-bold" style={{ color: "var(--accent)" }}>${fmt(item.subtotal)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-lg-4" style={{ animation: "fadeInRight .5s .15s ease both" }}>
          <div className="card border-0 shadow-sm mb-3" style={{ position: "sticky", top: 80 }}>
            <div className="card-header"><i className="bi bi-calculator me-2"></i>Resumen</div>
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Subtotal</span>
                <span>${fmt(order.subtotal)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="d-flex justify-content-between mb-2" style={{ color: "#34d399" }}>
                  <span>
                    <i className="bi bi-tag-fill me-1"></i>
                    Descuento{order.coupon ? ` (${order.coupon.code})` : ""}
                  </span>
                  <span>-${fmt(order.discountAmount)}</span>
                </div>
              )}
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Envío</span>
                <span>{order.shippingCost > 0 ? `$${fmt(order.shippingCost)}` : "Gratis"}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-bold">Total</span>
                <span className="order-total-grad">${fmt(order.total)}</span>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm mb-3">
            <div className="card-header"><i className="bi bi-truck me-2"></i>Envío</div>
            <div className="card-body">
              <p className="fw-semibold mb-1">{order.shippingMethod.name}</p>
              <p className="text-muted small mb-2">{order.shippingMethod.description}</p>
              <p className="mb-1"><i className="bi bi-geo-alt me-1 text-muted"></i>{order.shippingAddress}</p>
              <p className="mb-1 text-muted">{order.shippingCity}</p>
              <p className="mb-0 text-muted"><i className="bi bi-telephone me-1"></i>{order.shippingPhone}</p>
            </div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-header"><i className="bi bi-info-circle me-2"></i>Detalles</div>
            <div className="card-body">
              <p className="small text-muted mb-1">
                <i className="bi bi-calendar3 me-1"></i>
                {new Date(order.createdAt).toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}
              </p>
              <p className="small text-muted mb-0">
                <i className="bi bi-hash me-1"></i>Pedido #{order.id}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
