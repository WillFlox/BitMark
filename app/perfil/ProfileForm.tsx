"use client";

import { useActionState } from "react";
import { updateProfileAction, updatePasswordAction, deleteAccountAction } from "@/lib/actions/profile";

interface Props {
  user: {
    name: string;
    email: string;
    role: string;
    createdAt: string;
    orderCount: number;
  };
}

export default function ProfileForm({ user }: Props) {
  const [profileState, profileAction, profilePending] = useActionState(updateProfileAction, null);
  const [passwordState, passwordAction, passwordPending] = useActionState(updatePasswordAction, null);
  const [deleteState, deleteAction, deletePending] = useActionState(deleteAccountAction, null);

  const memberSince = new Date(user.createdAt).toLocaleDateString("es-ES", {
    month: "short",
    year: "numeric",
  });

  return (
    <>
      <div className="d-flex align-items-center gap-3 mb-4 flex-wrap" style={{ animation: "fadeInDown .4s ease both" }}>
        <div className="profile-avatar">{user.name.charAt(0).toUpperCase()}</div>
        <div>
          <h2 className="fw-bold mb-0 profile-title">Mi Perfil</h2>
          <div className="d-flex align-items-center gap-2 mt-1 flex-wrap">
            <span className="text-muted small">{user.email}</span>
            <span className={`role-badge${user.role === "admin" ? " admin" : ""}`}>
              <i className={`bi bi-${user.role === "admin" ? "shield-check" : "person-check"}`}></i>
              {user.role === "admin" ? "Administrador" : "Cliente"}
            </span>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm profile-card mb-4">
            <div className="card-header">
              <p className="section-label mb-0"><i className="bi bi-person me-1"></i>Información personal</p>
            </div>
            <div className="card-body">
              <p className="text-muted small mb-4">Actualiza tu nombre y correo electrónico.</p>
              {profileState?.success && (
                <div className="alert alert-success alert-dismissible fade show py-2">
                  <i className="bi bi-check-circle-fill me-2"></i>{profileState.success}
                  <button type="button" className="btn-close" data-bs-dismiss="alert"></button>
                </div>
              )}
              {profileState?.error && (
                <div className="alert alert-danger alert-dismissible fade show py-2">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>{profileState.error}
                  <button type="button" className="btn-close" data-bs-dismiss="alert"></button>
                </div>
              )}
              <form action={profileAction}>
                <div className="row g-3">
                  <div className="col-sm-6">
                    <label className="form-label" htmlFor="name">Nombre completo</label>
                    <input id="name" type="text" name="name" className="form-control" defaultValue={user.name} required autoFocus />
                  </div>
                  <div className="col-sm-6">
                    <label className="form-label" htmlFor="email">Correo electrónico</label>
                    <input id="email" type="email" name="email" className="form-control" defaultValue={user.email} required />
                  </div>
                </div>
                <div className="mt-4">
                  <button type="submit" className="btn btn-primary" disabled={profilePending}>
                    {profilePending ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-floppy me-1"></i>}
                    Guardar cambios
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="card border-0 shadow-sm profile-card mb-4">
            <div className="card-header">
              <p className="section-label mb-0"><i className="bi bi-lock me-1"></i>Contraseña</p>
            </div>
            <div className="card-body">
              <p className="text-muted small mb-4">Usa una contraseña larga y aleatoria para mantener tu cuenta segura.</p>
              {passwordState?.success && (
                <div className="alert alert-success alert-dismissible fade show py-2">
                  <i className="bi bi-check-circle-fill me-2"></i>{passwordState.success}
                  <button type="button" className="btn-close" data-bs-dismiss="alert"></button>
                </div>
              )}
              {passwordState?.error && (
                <div className="alert alert-danger alert-dismissible fade show py-2">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>{passwordState.error}
                  <button type="button" className="btn-close" data-bs-dismiss="alert"></button>
                </div>
              )}
              <form action={passwordAction}>
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label" htmlFor="current_password">Contraseña actual</label>
                    <input id="current_password" type="password" name="current_password" className="form-control" autoComplete="current-password" />
                  </div>
                  <div className="col-sm-6">
                    <label className="form-label">Nueva contraseña</label>
                    <input type="password" name="password" className="form-control" autoComplete="new-password" />
                  </div>
                  <div className="col-sm-6">
                    <label className="form-label">Confirmar contraseña</label>
                    <input type="password" name="password_confirmation" className="form-control" autoComplete="new-password" />
                  </div>
                </div>
                <div className="mt-4">
                  <button type="submit" className="btn btn-primary" disabled={passwordPending}>
                    {passwordPending ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-shield-lock me-1"></i>}
                    Actualizar contraseña
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="card border-0 shadow-sm profile-card danger-zone">
            <div className="card-header">
              <p className="section-label mb-0" style={{ color: "var(--danger)" }}>
                <i className="bi bi-exclamation-triangle me-1"></i>Zona de peligro
              </p>
            </div>
            <div className="card-body">
              <p className="text-muted small mb-3">
                Una vez que elimines tu cuenta, todos tus datos serán eliminados permanentemente.
              </p>
              <button type="button" className="btn btn-outline-danger btn-sm" data-bs-toggle="modal" data-bs-target="#deleteAccountModal">
                <i className="bi bi-trash3 me-1"></i>Eliminar mi cuenta
              </button>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm profile-card" style={{ position: "sticky", top: 80 }}>
            <div className="card-header">
              <p className="section-label mb-0"><i className="bi bi-person-circle me-1"></i>Resumen de cuenta</p>
            </div>
            <div className="card-body d-flex flex-column gap-3">
              <div className="text-center py-2">
                <div className="profile-avatar mx-auto mb-2" style={{ width: 64, height: 64, fontSize: "1.6rem" }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <p className="fw-bold mb-0">{user.name}</p>
                <p className="text-muted small mb-0">{user.email}</p>
              </div>
              <hr />
              <div className="d-flex justify-content-between align-items-center">
                <span className="small text-muted"><i className="bi bi-box me-1"></i>Pedidos realizados</span>
                <span className="fw-bold" style={{ color: "var(--accent)" }}>{user.orderCount}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="small text-muted"><i className="bi bi-calendar3 me-1"></i>Miembro desde</span>
                <span className="fw-bold small">{memberSince}</span>
              </div>
              <hr />
              <a href="/mis-pedidos" className="btn btn-outline-primary btn-sm w-100">
                <i className="bi bi-receipt me-1"></i>Ver mis pedidos
              </a>
              <a href="/productos" className="btn btn-outline-secondary btn-sm w-100">
                <i className="bi bi-grid me-1"></i>Explorar productos
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="modal fade" id="deleteAccountModal" tabIndex={-1} aria-labelledby="deleteModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title fw-bold" id="deleteModalLabel" style={{ color: "var(--danger)" }}>
                <i className="bi bi-exclamation-triangle-fill me-2"></i>¿Eliminar cuenta?
              </h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div className="modal-body">
              <p className="text-muted small mb-3">
                Esta acción es <strong style={{ color: "var(--danger)" }}>irreversible</strong>.
              </p>
              {deleteState?.error && (
                <div className="alert alert-danger py-2 mb-3">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>{deleteState.error}
                </div>
              )}
              <form id="deleteAccountForm" action={deleteAction}>
                <label className="form-label" htmlFor="delete_password">Confirma tu contraseña</label>
                <input id="delete_password" type="password" name="password" className="form-control" placeholder="Tu contraseña actual" />
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary btn-sm" data-bs-dismiss="modal">Cancelar</button>
              <button type="submit" form="deleteAccountForm" className="btn btn-danger btn-sm" disabled={deletePending}>
                <i className="bi bi-trash3 me-1"></i>Sí, eliminar mi cuenta
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
