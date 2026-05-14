import { prisma } from "@/lib/prisma";
import { getStatusLabel, getStatusColor, fmt } from "@/types";

const PER_PAGE = 20;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; success?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || "1") || 1);

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      include: { user: true, shippingMethod: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.order.count(),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4" style={{ animation: "fadeInLeft .5s ease both" }}>
        <h2 className="fw-bold"><i className="bi bi-bag me-2"></i>Pedidos</h2>
      </div>

      {sp.success && (
        <div className="alert alert-success alert-dismissible fade show">
          <i className="bi bi-check-circle-fill me-2"></i>{decodeURIComponent(sp.success)}
          <button type="button" className="btn-close" data-bs-dismiss="alert"></button>
        </div>
      )}

      <div className="table-responsive" style={{ animation: "fadeInUp .5s .1s ease both" }}>
        <table className="table table-hover align-middle">
          <thead className="table-dark">
            <tr>
              <th>#</th><th>Cliente</th><th>Estado</th><th>Envío</th><th>Total</th><th>Fecha</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>
                  <strong>{order.user.name}</strong>
                  <br />
                  <small className="text-muted">{order.user.email}</small>
                </td>
                <td>
                  <span className={`badge bg-${getStatusColor(order.status)}`}>{getStatusLabel(order.status)}</span>
                </td>
                <td>{order.shippingMethod.name}</td>
                <td>${fmt(order.total)}</td>
                <td>{new Date(order.createdAt).toLocaleDateString("es-ES")}</td>
                <td>
                  <a href={`/admin/orders/${order.id}`} className="btn btn-sm btn-outline-primary">
                    <i className="bi bi-eye"></i> Ver
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <nav className="mt-3">
          <ul className="pagination justify-content-center">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <li key={p} className={`page-item${p === page ? " active" : ""}`}>
                <a className="page-link" href={`/admin/orders?page=${p}`}>{p}</a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </>
  );
}
