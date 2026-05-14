import { prisma } from "@/lib/prisma";
import { getStatusLabel, getStatusColor, fmt } from "@/types";

export default async function AdminDashboardPage() {
  const [products, totalOrders, pendingOrders, revenueResult, lowStock, recentOrders] =
    await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.count({ where: { status: "pending" } }),
      prisma.order.aggregate({
        where: { status: { not: "cancelled" } },
        _sum: { total: true },
      }),
      prisma.product.count({ where: { stock: { lt: 5 }, active: true } }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { user: true, shippingMethod: true },
      }),
    ]);

  const revenue = revenueResult._sum.total ?? 0;
  // Note: 'Cupones' stat is a static navigation card, no extra query needed

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold" style={{ animation: "fadeInLeft .5s ease both" }}>
          <i className="bi bi-speedometer2"></i> Panel de Administración
        </h2>
      </div>

      <div className="row g-3 mb-5">
        {[
          { icon: "bi-box-seam", color: "text-primary", value: products, label: "Productos", href: "/admin/products" },
          { icon: "bi-bag", color: "text-success", value: totalOrders, label: "Pedidos totales", href: "/admin/orders" },
          { icon: "bi-clock-history", color: "text-warning", value: pendingOrders, label: "Pedidos pendientes", href: undefined },
          { icon: "bi-currency-dollar", color: "text-info", value: `$${fmt(revenue)}`, label: "Ingresos totales", href: undefined },
          { icon: "bi-ticket-perforated", color: "text-secondary", value: "Cupones", label: "Gestionar descuentos", href: "/admin/coupons" },
        ].map((stat, i) => (
          <div key={i} className="col-sm-6 col-lg-3">
            <div className="card border-0 shadow-sm text-center p-3 aos-item" style={{ cursor: stat.href ? "pointer" : "default" }}>
              <i className={`bi ${stat.icon} display-6 ${stat.color}`}></i>
              <h3 className="fw-bold mt-2">{stat.value}</h3>
              <p className="text-muted mb-0">{stat.label}</p>
              {stat.href && <a href={stat.href} className="stretched-link"></a>}
            </div>
          </div>
        ))}
      </div>

      {lowStock > 0 && (
        <div className="alert alert-warning">
          <i className="bi bi-exclamation-triangle"></i>{" "}
          Hay <strong>{lowStock}</strong> producto(s) con stock bajo (menos de 5 unidades).{" "}
          <a href="/admin/products" className="alert-link">Revisar inventario</a>
        </div>
      )}

      <h5 className="fw-bold mb-3">Últimos pedidos</h5>
      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-dark">
            <tr>
              <th>#</th><th>Cliente</th><th>Estado</th><th>Envío</th><th>Total</th><th>Fecha</th><th></th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order) => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{order.user.name}</td>
                <td>
                  <span className={`badge bg-${getStatusColor(order.status)}`}>{getStatusLabel(order.status)}</span>
                </td>
                <td>{order.shippingMethod.name}</td>
                <td>${fmt(order.total)}</td>
                <td>{new Date(order.createdAt).toLocaleDateString("es-ES")} {new Date(order.createdAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}</td>
                <td>
                  <a href={`/admin/orders/${order.id}`} className="btn btn-sm btn-outline-primary">Ver</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
