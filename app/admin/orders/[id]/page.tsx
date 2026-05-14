import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getStatusLabel, getStatusColor, fmt, getImageUrl } from "@/types";

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

async function updateOrderStatus(formData: FormData) {
  "use server";
  const id = parseInt(formData.get("order_id") as string);
  const status = formData.get("status") as string;
  await prisma.order.update({ where: { id }, data: { status } });
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
  redirect(`/admin/orders/${id}?success=Estado+actualizado`);
}

export default async function AdminOrderShowPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const orderId = parseInt(id);

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { product: true } },
      shippingMethod: true,
      user: true,
      coupon: true,
    },
  });

  if (!order) notFound();

  return (
    <>
      <nav aria-label="breadcrumb" style={{ animation: "fadeInDown .4s ease both" }}>
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><a href="/admin">Admin</a></li>
          <li className="breadcrumb-item"><a href="/admin/orders">Pedidos</a></li>
          <li className="breadcrumb-item active">Pedido #{order.id}</li>
        </ol>
      </nav>

      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4">
        <h2 className="fw-bold mb-0" style={{ animation: "fadeInLeft .5s ease both" }}>
          <i className="bi bi-receipt me-2"></i>Pedido #{order.id}
        </h2>
        <span className={`badge bg-${getStatusColor(order.status)} fs-6`}>{getStatusLabel(order.status)}</span>
      </div>

      {sp.success && (
        <div className="alert alert-success alert-dismissible fade show">
          <i className="bi bi-check-circle-fill me-2"></i>{decodeURIComponent(sp.success)}
          <button type="button" className="btn-close" data-bs-dismiss="alert"></button>
        </div>
      )}

      <div className="row g-4">
        <div className="col-lg-8" style={{ animation: "fadeInLeft .5s .1s ease both" }}>
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header"><i className="bi bi-bag me-2"></i>Productos del pedido</div>
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
                <span className="text-muted">Subtotal</span><span>${fmt(order.subtotal)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="d-flex justify-content-between mb-1" style={{ color: "#34d399" }}>
                  <span>
                    <i className="bi bi-tag-fill me-1"></i>
                    Descuento{order.coupon ? ` (${order.coupon.code})` : ""}
                  </span>
                  <span>-${fmt(order.discountAmount)}</span>
                </div>
              )}
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted">Envío</span>
                <span>{order.shippingCost > 0 ? `$${fmt(order.shippingCost)}` : "Gratis"}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between">
                <span className="fw-bold">Total</span>
                <span className="fw-bold" style={{ color: "var(--accent)", fontSize: "1.2rem" }}>${fmt(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4" style={{ animation: "fadeInRight .5s .15s ease both" }}>
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-header"><i className="bi bi-person me-2"></i>Cliente</div>
            <div className="card-body">
              <p className="fw-semibold mb-1">{order.user.name}</p>
              <p className="text-muted small mb-0">{order.user.email}</p>
            </div>
          </div>

          <div className="card border-0 shadow-sm mb-3">
            <div className="card-header"><i className="bi bi-truck me-2"></i>Envío</div>
            <div className="card-body">
              <p className="fw-semibold mb-1">{order.shippingMethod.name}</p>
              <p className="mb-1"><i className="bi bi-geo-alt me-1 text-muted"></i>{order.shippingAddress}</p>
              <p className="mb-1 text-muted">{order.shippingCity}</p>
              <p className="mb-0 text-muted"><i className="bi bi-telephone me-1"></i>{order.shippingPhone}</p>
            </div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-header"><i className="bi bi-gear me-2"></i>Cambiar estado</div>
            <div className="card-body">
              <form action={updateOrderStatus}>
                <input type="hidden" name="order_id" value={order.id} />
                <div className="mb-3">
                  <select name="status" className="form-select" defaultValue={order.status}>
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{getStatusLabel(s)}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="btn btn-primary w-100">
                  <i className="bi bi-check2 me-1"></i>Actualizar estado
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
