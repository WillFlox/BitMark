import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getStatusLabel, getStatusColor, fmt } from "@/types";

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = parseInt((session.user as { id: string }).id);
  const orders = await prisma.order.findMany({
    where: { userId },
    include: { shippingMethod: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <style>{`
        .orders-title { animation: fadeInLeft .5s ease both; background: linear-gradient(45deg, #818cf8, #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .orders-empty-icon { color: #818cf8 !important; animation: float 3s ease-in-out infinite; }
        .orders-table-wrap { animation: fadeInUp .5s .1s ease both; }
        .order-total { background: linear-gradient(45deg, #818cf8, #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-weight: bold; }
        .order-id { color: #818cf8; font-weight: bold; }
        .orders-table tbody tr { opacity: 0; transform: translateX(-12px); transition: opacity .4s ease, transform .4s ease, background .2s; }
        .orders-table tbody tr.visible { opacity: 1; transform: none; }
      `}</style>

      <h2 className="fw-bold mb-4 orders-title"><i className="bi bi-box"></i> Mis Pedidos</h2>

      {orders.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-box-seam display-1 orders-empty-icon"></i>
          <p className="text-muted mt-3">Aún no tienes pedidos.</p>
          <a href="/productos" className="btn btn-primary mt-2">Comprar ahora</a>
        </div>
      ) : (
        <>
          <div className="d-md-none">
            {orders.map((order) => (
              <div key={order.id} className="card mb-3 aos-item">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="order-id fw-bold fs-5">#{order.id}</span>
                    <span className={`badge bg-${getStatusColor(order.status)}`}>{getStatusLabel(order.status)}</span>
                  </div>
                  <div className="d-flex flex-column gap-1 mb-3">
                    <p className="small text-muted mb-0"><i className="bi bi-calendar3 me-1"></i>{new Date(order.createdAt).toLocaleDateString("es-ES")}</p>
                    <p className="small text-muted mb-0"><i className="bi bi-truck me-1"></i>{order.shippingMethod.name}</p>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="order-total fs-5">${fmt(order.total)}</span>
                    <a href={`/mis-pedidos/${order.id}`} className="btn btn-sm btn-outline-primary">
                      <i className="bi bi-eye me-1"></i>Ver detalle
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="d-none d-md-block table-responsive orders-table-wrap">
            <table className="table table-hover align-middle orders-table">
              <thead>
                <tr style={{ background: "rgba(99,102,241,.2)" }}>
                  <th>#Pedido</th><th>Fecha</th><th>Estado</th><th>Envío</th><th>Total</th><th></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td><span className="order-id">#{order.id}</span></td>
                    <td>{new Date(order.createdAt).toLocaleDateString("es-ES")}</td>
                    <td><span className={`badge bg-${getStatusColor(order.status)}`}>{getStatusLabel(order.status)}</span></td>
                    <td>{order.shippingMethod.name}</td>
                    <td><span className="order-total">${fmt(order.total)}</span></td>
                    <td>
                      <a href={`/mis-pedidos/${order.id}`} className="btn btn-sm btn-outline-primary">
                        <i className="bi bi-eye"></i> Ver
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <script dangerouslySetInnerHTML={{ __html: `
        document.querySelectorAll('.orders-table tbody tr').forEach((tr, i) => {
          tr.style.transitionDelay = (i * 0.07) + 's';
          requestAnimationFrame(() => tr.classList.add('visible'));
        });
      ` }} />
    </>
  );
}
