"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { loginAction } from "@/lib/actions/auth";

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction, null);
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error") ?? undefined;

  return (
    <>
      <style>{`
        .auth-card { animation: fadeInUp .45s ease both; max-width: 440px; }
        .auth-logo { animation: popIn .5s ease both; }
        .auth-title { background: linear-gradient(45deg, #818cf8, #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .divider-text { position: relative; text-align: center; color: var(--text-muted); font-size: .8rem; }
        .divider-text::before, .divider-text::after { content: ''; position: absolute; top: 50%; width: 42%; height: 1px; background: var(--border); }
        .divider-text::before { left: 0; }
        .divider-text::after { right: 0; }
      `}</style>

      <div className="d-flex justify-content-center py-3">
        <div className="auth-card w-100">
          <div className="text-center mb-4 auth-logo">
            <a href="/productos" className="text-decoration-none d-inline-flex align-items-center gap-2 justify-content-center mb-3">
              <svg width="36" height="36" viewBox="0 0 28 28" fill="none">
                <rect width="28" height="28" rx="7" fill="url(#bm-login)" />
                <path d="M8 7h7.5a3.5 3.5 0 0 1 0 7H8V7z" fill="white" opacity=".95" />
                <path d="M8 14h8a3.5 3.5 0 0 1 0 7H8v-7z" fill="white" opacity=".75" />
                <defs>
                  <linearGradient id="bm-login" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#6366f1" /><stop offset="1" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="fw-bold fs-4" style={{ color: "var(--text)" }}>BitMark</span>
            </a>
            <h1 className="fw-bold fs-4 auth-title mb-1">Bienvenido de vuelta</h1>
            <p className="text-muted small mb-0">Inicia sesión para continuar comprando</p>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              {(state?.error || urlError) && (
                <div className="alert alert-danger py-2 mb-3">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {state?.error || decodeURIComponent(urlError!)}
                </div>
              )}

              <form action={action}>
                <div className="mb-3">
                  <label className="form-label" htmlFor="email">Correo electrónico</label>
                  <input
                    id="email" type="email" name="email"
                    className="form-control"
                    required autoFocus autoComplete="username"
                    placeholder="tu@email.com"
                  />
                </div>

                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="form-label mb-0" htmlFor="password">Contraseña</label>
                  </div>
                  <input
                    id="password" type="password" name="password"
                    className="form-control"
                    required autoComplete="current-password"
                    placeholder="••••••••"
                  />
                </div>

                <div className="mb-4">
                  <div className="form-check">
                    <input id="remember_me" type="checkbox" name="remember" className="form-check-input" />
                    <label htmlFor="remember_me" className="form-check-label small">Recordarme</label>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary w-100 btn-lg" disabled={pending}>
                  {pending ? (
                    <><span className="spinner-border spinner-border-sm me-2"></span>Iniciando sesión...</>
                  ) : (
                    <><i className="bi bi-box-arrow-in-right me-2"></i>Iniciar sesión</>
                  )}
                </button>
              </form>

              <div className="divider-text my-4">o</div>

              <p className="text-center small text-muted mb-0">
                ¿No tienes cuenta?{" "}
                <a href="/register" className="text-decoration-none fw-semibold" style={{ color: "var(--accent)" }}>
                  Regístrate gratis
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
