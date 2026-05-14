import { prisma } from "@/lib/prisma";
import { fmt } from "@/types";
import { createCoupon, toggleCoupon, deleteCoupon } from "@/lib/actions/coupons";

export default async function AdminCouponsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });

  const now = new Date();

  return (
    <>
      <style>{`
        .coupon-row td { vertical-align: middle; }
        .coupon-code { font-family: monospace; font-size: 1rem; letter-spacing: .05em; background: rgba(99,102,241,.15); color: #818cf8; border-radius: 6px; padding: 2px 8px; }
        .create-form .form-section { animation: fadeInUp .4s ease both; }
      `}</style>

      <div className="d-flex justify-content-between align-items-center mb-4" style={{ animation: "fadeInLeft .5s ease both" }}>
        <h2 className="fw-bold">
          <i className="bi bi-ticket-perforated me-2"></i>Cupones de descuento
        </h2>
      </div>

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

      {/* Formulario de creación */}
      <div className="card border-0 shadow-sm mb-4 create-form">
        <div className="card-header fw-bold">
          <i className="bi bi-plus-circle me-2"></i>Nuevo cupón
        </div>
        <div className="card-body">
          <form action={createCoupon}>
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label">Código <span className="text-danger">*</span></label>
                <input
                  type="text"
                  name="code"
                  className="form-control"
                  placeholder="VERANO20"
                  required
                  maxLength={50}
                  style={{ textTransform: "uppercase", fontFamily: "monospace" }}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Tipo de descuento <span className="text-danger">*</span></label>
                <select name="discount_type" className="form-select" required>
                  <option value="percentage">Porcentaje (%)</option>
                  <option value="fixed">Monto fijo ($)</option>
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label">Valor <span className="text-danger">*</span></label>
                <input
                  type="number"
                  name="discount_value"
                  className="form-control"
                  placeholder="20"
                  required
                  min="0.01"
                  step="0.01"
                />
              </div>
              <div className="col-md-2">
                <label className="form-label">Compra mínima ($)</label>
                <input
                  type="number"
                  name="min_purchase"
                  className="form-control"
                  placeholder="0"
                  min="0"
                  step="0.01"
                  defaultValue="0"
                />
              </div>
              <div className="col-md-2">
                <label className="form-label">Máx. usos</label>
                <input
                  type="number"
                  name="max_uses"
                  className="form-control"
                  placeholder="Sin límite"
                  min="1"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Descripción</label>
                <input
                  type="text"
                  name="description"
                  className="form-control"
                  placeholder="Ej: Descuento de verano"
                  maxLength={200}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Fecha de expiración</label>
                <input
                  type="datetime-local"
                  name="expires_at"
                  className="form-control"
                />
              </div>
              <div className="col-md-3 d-flex align-items-end">
                <button type="submit" className="btn btn-primary w-100">
                  <i className="bi bi-plus-lg me-1"></i>Crear cupón
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Tabla de cupones */}
      <div className="card border-0 shadow-sm" style={{ animation: "fadeInUp .5s .1s ease both" }}>
        <div className="card-header fw-bold">
          <i className="bi bi-list-ul me-2"></i>Cupones registrados ({coupons.length})
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-dark">
              <tr>
                <th>Código</th>
                <th>Tipo</th>
                <th>Valor</th>
                <th>Mín. compra</th>
                <th>Usos</th>
                <th>Expira</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-muted py-4">
                    <i className="bi bi-ticket-perforated display-6 d-block mb-2"></i>
                    No hay cupones creados todavía.
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => {
                  const isExpired = coupon.expiresAt ? coupon.expiresAt < now : false;
                  const isFull = coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses;
                  const effectivelyInactive = !coupon.active || isExpired || isFull;

                  return (
                    <tr key={coupon.id} className="coupon-row">
                      <td>
                        <span className="coupon-code">{coupon.code}</span>
                        {coupon.description && (
                          <div className="text-muted small mt-1">{coupon.description}</div>
                        )}
                      </td>
                      <td>
                        {coupon.discountType === "percentage" ? (
                          <span className="badge" style={{ background: "rgba(99,102,241,.2)", color: "#818cf8" }}>
                            <i className="bi bi-percent me-1"></i>Porcentaje
                          </span>
                        ) : (
                          <span className="badge" style={{ background: "rgba(16,185,129,.2)", color: "#34d399" }}>
                            <i className="bi bi-currency-dollar me-1"></i>Monto fijo
                          </span>
                        )}
                      </td>
                      <td className="fw-bold">
                        {coupon.discountType === "percentage"
                          ? `${coupon.discountValue}%`
                          : `$${fmt(coupon.discountValue)}`}
                      </td>
                      <td>
                        {coupon.minPurchase > 0 ? `$${fmt(coupon.minPurchase)}` : (
                          <span className="text-muted small">Sin mínimo</span>
                        )}
                      </td>
                      <td>
                        <span className={isFull ? "text-danger fw-bold" : ""}>
                          {coupon.usedCount}
                          {coupon.maxUses !== null ? ` / ${coupon.maxUses}` : ""}
                        </span>
                        {isFull && <span className="badge bg-danger ms-1 small">Agotado</span>}
                      </td>
                      <td>
                        {coupon.expiresAt ? (
                          <span className={isExpired ? "text-danger small" : "text-muted small"}>
                            {isExpired && <i className="bi bi-clock-history me-1"></i>}
                            {coupon.expiresAt.toLocaleDateString("es-ES", {
                              day: "2-digit", month: "2-digit", year: "numeric",
                            })}
                            {isExpired && " (expirado)"}
                          </span>
                        ) : (
                          <span className="text-muted small">Sin límite</span>
                        )}
                      </td>
                      <td>
                        {effectivelyInactive ? (
                          <span className="badge bg-secondary">Inactivo</span>
                        ) : (
                          <span className="badge bg-success">Activo</span>
                        )}
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <form action={toggleCoupon}>
                            <input type="hidden" name="coupon_id" value={coupon.id} />
                            <button
                              type="submit"
                              className={`btn btn-sm ${coupon.active ? "btn-outline-warning" : "btn-outline-success"}`}
                              title={coupon.active ? "Desactivar" : "Activar"}
                            >
                              <i className={`bi ${coupon.active ? "bi-pause-fill" : "bi-play-fill"}`}></i>
                            </button>
                          </form>
                          <form action={deleteCoupon}>
                            <input type="hidden" name="coupon_id" value={coupon.id} />
                            <button
                              type="submit"
                              className="btn btn-sm btn-outline-danger"
                              title="Eliminar cupón"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
