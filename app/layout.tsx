import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { CartItem, SessionUser } from "@/types";
import "./globals.css";
import { logoutAction } from "@/lib/actions/auth";
import HamburgerButton from "./components/HamburgerButton";

export const metadata: Metadata = {
  title: "BitMark — Marketplace",
  description: "Tu marketplace de confianza para productos tecnológicos.",
};

export const viewport: Viewport = {
  themeColor: "#6366f1",
};

async function getCartCount(): Promise<number> {
  const cookieStore = await cookies();
  const cartCookie = cookieStore.get("cart");
  if (!cartCookie?.value) return 0;
  try {
    const cart: CartItem[] = JSON.parse(cartCookie.value);
    return Array.isArray(cart) ? cart.length : 0;
  } catch {
    return 0;
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const cartCount = await getCartCount();
  const user = session?.user as SessionUser | undefined;

  return (
    <html lang="es">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
          rel="stylesheet"
        />
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css"
          rel="stylesheet"
        />
        <style>{`
          :root {
            --bg:           #0f172a;
            --surface:      rgba(15,23,42,.75);
            --surface-solid:#1e293b;
            --border:       rgba(255,255,255,.10);
            --accent:       #818cf8;
            --accent2:      #c084fc;
            --btn-from:     #6366f1;
            --btn-to:       #8b5cf6;
            --btn-shadow:   rgba(99,102,241,.35);
            --text:         #ffffff;
            --text-muted:   #cbd5e1;
            --danger:       #f87171;
            --success:      #34d399;
            --warning:      #fbbf24;
          }
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            background: var(--bg);
            color: var(--text);
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            min-height: 100vh;
            -webkit-font-smoothing: antialiased;
          }
          .navbar {
            background: var(--surface) !important;
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border-bottom: 1px solid var(--border);
            padding: 14px 0;
            transition: box-shadow .4s;
          }
          .navbar.scrolled { box-shadow: 0 4px 30px rgba(99,102,241,.25); }
          .navbar-brand {
            font-size: 1.6rem; font-weight: bold;
            color: var(--text) !important;
            animation: fadeInDown .5s ease both;
            transition: transform .4s, color .4s !important;
          }
          .navbar-brand:hover { transform: scale(1.08); color: var(--accent) !important; }
          .navbar .nav-link {
            color: var(--text) !important; font-size: 15px;
            padding: 8px 4px !important; position: relative;
            transition: color .4s ease !important;
            display: flex; align-items: center; gap: 5px;
          }
          .navbar .nav-link::before {
            content: ''; position: absolute; bottom: -2px; left: 50%;
            transform: translateX(-50%); width: 0; height: 2px;
            background: var(--accent); transition: width .4s ease; border-radius: 10px;
          }
          .navbar .nav-link:hover::before { width: 100%; }
          .navbar .nav-link:hover { color: var(--accent) !important; text-shadow: 0 0 10px var(--accent), 0 0 20px var(--accent); }
          .navbar .nav-link i { transition: transform .4s; }
          .navbar .nav-link:hover i { transform: rotate(180deg); }
          .navbar .dropdown-menu {
            background: var(--surface-solid);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: .5rem;
            box-shadow: 0 12px 32px rgba(0,0,0,.35);
          }
          .navbar .dropdown-item {
            color: var(--text);
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: .5rem;
          }
          .navbar .dropdown-item:hover,
          .navbar .dropdown-item:focus {
            background: rgba(255,255,255,.08);
            color: var(--accent);
          }
          .navbar .dropdown-divider { border-color: var(--border); }
          .navbar .badge.bg-danger {
            background: linear-gradient(45deg, var(--btn-from), var(--btn-to)) !important;
            animation: pulse-badge 1.8s ease-in-out infinite;
          }
          .navbar-toggler { border-color: var(--border); outline: none !important; box-shadow: none !important; }
          .navbar-toggler:focus { box-shadow: 0 0 0 2px rgba(129,140,248,.35) !important; }
          .btn {
            position: relative; overflow: hidden; border-radius: 12px; font-size: 15px;
            transition: transform .4s, box-shadow .4s, background-position .4s !important;
          }
          .btn:active { transform: scale(.96) !important; }
          .btn-primary, .btn-primary:focus {
            background: linear-gradient(45deg, var(--btn-from), var(--btn-to)) !important;
            border: none !important; color: #fff !important;
            box-shadow: 0 10px 20px var(--btn-shadow);
          }
          .btn-primary:hover { transform: translateY(-5px) scale(1.05) !important; box-shadow: 0 15px 30px rgba(99,102,241,.55) !important; }
          .btn-success, .btn-success:focus {
            background: linear-gradient(45deg, #059669, #10b981) !important;
            border: none !important; color: #fff !important; box-shadow: 0 10px 20px rgba(16,185,129,.25);
          }
          .btn-success:hover { transform: translateY(-5px) scale(1.05) !important; box-shadow: 0 15px 30px rgba(16,185,129,.45) !important; }
          .btn-danger, .btn-danger:focus {
            background: linear-gradient(45deg, #dc2626, #f87171) !important;
            border: none !important; color: #fff !important;
          }
          .btn-danger:hover { transform: translateY(-4px) scale(1.04) !important; box-shadow: 0 12px 24px rgba(220,38,38,.4) !important; }
          .btn-outline-primary { color: var(--accent) !important; border-color: var(--accent) !important; background: transparent !important; }
          .btn-outline-primary:hover { background: rgba(129,140,248,.15) !important; transform: translateY(-3px) scale(1.03) !important; box-shadow: 0 8px 20px rgba(129,140,248,.3) !important; }
          .btn-outline-light { color: var(--text) !important; border-color: var(--border) !important; }
          .btn-outline-light:hover { background: rgba(255,255,255,.1) !important; transform: translateY(-3px) !important; }
          .btn-outline-secondary { color: var(--text-muted) !important; border-color: var(--border) !important; background: transparent !important; }
          .btn-outline-secondary:hover { background: rgba(255,255,255,.08) !important; transform: translateY(-2px) !important; }
          .btn-outline-danger { color: var(--danger) !important; border-color: var(--danger) !important; background: transparent !important; }
          .btn-outline-danger:hover { background: rgba(248,113,113,.15) !important; transform: translateY(-2px) !important; }
          .btn .ripple {
            position: absolute; border-radius: 50%;
            background: rgba(255,255,255,.3); width: 10px; height: 10px;
            pointer-events: none; animation: ripple-spread .55s linear forwards;
          }
          .card {
            background: var(--surface) !important; backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px); border: 1px solid var(--border) !important;
            color: var(--text) !important; border-radius: 14px !important;
            transition: transform .4s cubic-bezier(.25,.8,.25,1), box-shadow .4s cubic-bezier(.25,.8,.25,1);
            will-change: transform;
          }
          .card:hover { transform: translateY(-8px) scale(1.015); box-shadow: 0 20px 40px rgba(99,102,241,.25) !important; }
          .card-header { background: rgba(99,102,241,.12) !important; border-bottom: 1px solid var(--border) !important; color: var(--text) !important; font-weight: bold; }
          .card-footer { background: transparent !important; border-top: 1px solid var(--border) !important; }
          .card-text, .card-body { color: var(--text) !important; }
          .form-control, .form-select {
            background: rgba(15,23,42,.8) !important; border: 1px solid var(--border) !important;
            color: var(--text) !important; border-radius: 10px !important; transition: border-color .3s, box-shadow .3s;
          }
          .form-control:focus, .form-select:focus {
            border-color: var(--accent) !important; box-shadow: 0 0 0 3px rgba(129,140,248,.25) !important;
            background: rgba(15,23,42,.95) !important; color: var(--text) !important;
          }
          .form-control::placeholder { color: #64748b !important; }
          .form-select option { background: var(--surface-solid); color: var(--text); }
          .form-label { color: var(--text-muted); }
          .form-check-input { background-color: rgba(15,23,42,.8) !important; border-color: var(--border) !important; }
          .form-check-input:checked { background-color: var(--btn-from) !important; border-color: var(--btn-from) !important; }
          .table { color: var(--text) !important; border-color: var(--border) !important; }
          .table > :not(caption) > * > * { background-color: transparent !important; border-bottom-color: var(--border) !important; color: var(--text) !important; }
          .table-hover > tbody > tr:hover > * { background-color: rgba(129,140,248,.08) !important; }
          .table-dark > * > tr > * { background: rgba(99,102,241,.2) !important; color: var(--text) !important; }
          .table-responsive { border-radius: 14px; overflow: hidden; }
          .badge.bg-secondary { background: rgba(129,140,248,.25) !important; color: var(--accent) !important; border: 1px solid rgba(129,140,248,.3); }
          .badge.bg-warning  { background: rgba(251,191,36,.2) !important; color: var(--warning) !important; }
          .badge.bg-info     { background: rgba(56,189,248,.2) !important; color: #38bdf8 !important; }
          .badge.bg-primary  { background: rgba(99,102,241,.3) !important; color: var(--accent) !important; }
          .badge.bg-success  { background: rgba(52,211,153,.2) !important; color: var(--success) !important; }
          .badge.bg-danger   { background: rgba(248,113,113,.2) !important; color: var(--danger) !important; }
          .alert { animation: slideAlert .4s ease both; border-radius: 12px !important; border: 1px solid var(--border) !important; }
          .alert-success { background: rgba(52,211,153,.12) !important; color: var(--success) !important; }
          .alert-danger  { background: rgba(248,113,113,.12) !important; color: var(--danger) !important; }
          .alert-warning { background: rgba(251,191,36,.12) !important; color: var(--warning) !important; }
          .btn-close { filter: invert(1); }
          .breadcrumb { background: transparent !important; }
          .breadcrumb-item a { color: var(--accent); text-decoration: none; }
          .breadcrumb-item a:hover { text-shadow: 0 0 10px var(--accent), 0 0 20px var(--accent); }
          .breadcrumb-item.active { color: var(--text-muted); }
          .breadcrumb-item + .breadcrumb-item::before { color: var(--text-muted); }
          .pagination .page-link { background: var(--surface) !important; border-color: var(--border) !important; color: var(--accent) !important; border-radius: 8px !important; transition: .3s; }
          .pagination .page-link:hover { background: rgba(129,140,248,.2) !important; color: #fff !important; }
          .pagination .page-item.active .page-link { background: linear-gradient(45deg, var(--btn-from), var(--btn-to)) !important; border-color: transparent !important; color: #fff !important; }
          .pagination .page-item.disabled .page-link { opacity: .4; }
          .text-muted { color: var(--text-muted) !important; }
          .text-primary { color: var(--accent) !important; }
          .text-success { color: var(--success) !important; }
          .text-danger  { color: var(--danger) !important; }
          .text-warning { color: var(--warning) !important; }
          h1,h2,h3,h4,h5,h6 { color: var(--text) !important; }
          strong, b { color: var(--text); }
          p { color: var(--text-muted); }
          label { color: var(--text-muted); }
          hr { border-color: var(--border) !important; opacity: 1 !important; }
          footer { background: rgba(15,23,42,.96); border-top: 1px solid var(--border); color: var(--text-muted); }
          footer p { color: var(--text-muted) !important; }
          .footer-heading { font-size: .7rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--accent) !important; }
          .footer-link { color: var(--text-muted); text-decoration: none; font-size: .875rem; transition: color .25s; }
          .footer-link:hover { color: var(--accent); }
          .footer-icon-link { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--border); color: var(--text-muted); text-decoration: none; font-size: 1rem; transition: color .25s, border-color .25s, background .25s; }
          .footer-icon-link:hover { color: var(--accent); border-color: var(--accent); background: rgba(129,140,248,.1); }
          .invalid-feedback { color: var(--danger) !important; }
          .is-invalid { border-color: var(--danger) !important; }
          .form-check.border { border-color: var(--border) !important; border-radius: 10px !important; background: rgba(15,23,42,.5); transition: background .3s, border-color .3s; }
          .form-check.border:hover { background: rgba(129,140,248,.08) !important; border-color: var(--accent) !important; }
          .form-check-label { color: var(--text) !important; }
          @media (max-width: 575.98px) {
            main.container { padding-left: 14px; padding-right: 14px; }
            .navbar-collapse { border-top: 1px solid var(--border); margin-top: 10px; padding-top: 10px; }
            .navbar .navbar-nav .nav-link { padding: 10px 4px !important; }
            .navbar-collapse .btn { width: 100%; text-align: center; margin-top: 4px; }
            .navbar-collapse .navbar-nav.ms-auto { gap: 0 !important; padding-bottom: 8px; }
            .card-body { padding: 1rem !important; }
            .card-header { padding: .65rem 1rem !important; }
          }
          @media (max-width: 400px) { .btn { font-size: 14px; } }
          .logo-nav-link { position: relative; display: flex; align-items: center; cursor: pointer; text-decoration: none !important; }
          .logo-wrapper { position: relative; display: inline-block; padding: 0 6px; }
          .logo-img { height: 96px; width: auto; display: block; position: relative; z-index: 5; transition: 0.35s; object-fit: contain; }
          .logo-ring-1, .logo-ring-2 { position: absolute; inset: -10px; border-radius: 14px; border: 1px solid rgba(138,60,255,.3); opacity: 0; transform: scale(0.8); transition: 0.35s; pointer-events: none; }
          .logo-ring-2 { inset: -18px; border: 1px solid rgba(0,229,255,.2); }
          .logo-scan { position: absolute; left: 0; top: 0; width: 100%; height: 2px; opacity: 0; z-index: 4; pointer-events: none; background: linear-gradient(90deg, transparent, rgb(138,60,255), rgb(0,229,255), transparent); }
          @keyframes logo-scan-sweep { 0% { top: 0; opacity: .9; } 50% { top: 100%; opacity: .5; } 100% { top: 0; opacity: 0; } }
          .logo-nav-link:hover .logo-scan { opacity: 1; animation: logo-scan-sweep 1s ease-in-out infinite; }
          .logo-nav-link:hover .logo-img { filter: brightness(1.15) drop-shadow(0 0 8px rgba(138,60,255,.7)) drop-shadow(0 0 20px rgba(0,229,255,.3)); transform: scale(1.04); }
          .logo-nav-link:hover .logo-ring-1, .logo-nav-link:hover .logo-ring-2 { opacity: 1; transform: scale(1); }
          .logo-nav-link:hover { transform: none !important; color: white !important; letter-spacing: normal !important; }
          .modal-content { background: var(--surface-solid) !important; border: 1px solid var(--border) !important; border-radius: 14px !important; }
          .modal-header { border-bottom: 1px solid var(--border) !important; }
          .modal-footer { border-top: 1px solid var(--border) !important; }
          .modal-title { color: var(--text) !important; }
          .btn-wish { background: transparent; border: 1px solid rgba(248,113,113,.35); color: #f87171; border-radius: 12px; cursor: pointer; transition: background .25s, border-color .25s, transform .25s, box-shadow .25s; }
          .btn-wish:hover { background: rgba(248,113,113,.15); border-color: #f87171; transform: scale(1.08); }
          .btn-wish.just-added { background: rgba(248,113,113,.2); border-color: #f87171; box-shadow: 0 4px 14px rgba(248,113,113,.35); }
          .btn-wish i { transition: transform .3s; }
          .btn-wish:hover i { transform: scale(1.2); }
          .btn-wish-card { background: transparent; border: 1px solid rgba(248,113,113,.3); color: #f87171; border-radius: 10px; padding: 5px 9px; font-size: .85rem; line-height: 1; cursor: pointer; transition: background .25s, border-color .25s, transform .2s; }
          .btn-wish-card:hover { background: rgba(248,113,113,.18); border-color: #f87171; }
          .btn-wish-card.just-added { background: rgba(248,113,113,.2); border-color: #f87171; box-shadow: 0 2px 8px rgba(248,113,113,.25); }
        `}</style>
      </head>
      <body>
        <nav className="navbar navbar-expand-lg navbar-dark sticky-top">
          <div className="container">
            <a className="navbar-brand logo-nav-link" href="/productos">
              <div className="logo-wrapper">
                <img src="/logo.png" alt="BitMark" className="logo-img" />
                <div className="logo-ring-1"></div>
                <div className="logo-ring-2"></div>
                <div className="logo-scan"></div>
              </div>
            </a>
            <HamburgerButton />
            <div className="collapse navbar-collapse" id="navMenu">
              <ul className="navbar-nav me-auto">
                <li className="nav-item">
                  <a className="nav-link" href="/productos">
                    <i className="bi bi-grid"></i> Productos
                  </a>
                </li>
              </ul>
              <ul className="navbar-nav ms-auto align-items-center gap-2">
                <li className="nav-item">
                  <a className="nav-link" href="/carrito">
                    <i className="bi bi-cart3"></i>
                    {cartCount > 0 && (
                      <span className="badge bg-danger">{cartCount}</span>
                    )}
                    {" "}Carrito
                  </a>
                </li>
                {user ? (
                  <>
                    <li className="nav-item dropdown">
                      <a
                        className="nav-link dropdown-toggle"
                        href="#"
                        role="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        <i className="bi bi-person-circle"></i> {user.name}
                      </a>
                      <ul className="dropdown-menu dropdown-menu-end">
                        <li>
                          <a className="dropdown-item" href="/favoritos">
                            <i className="bi bi-heart-fill" style={{ color: "var(--danger)" }}></i> Mis favoritos
                          </a>
                        </li>
                        <li>
                          <a className="dropdown-item" href="/mis-pedidos">
                            <i className="bi bi-box"></i> Mis pedidos
                          </a>
                        </li>
                        <li>
                          <a className="dropdown-item" href="/perfil">
                            <i className="bi bi-person-circle"></i> Mi perfil
                          </a>
                        </li>
                        <li><hr className="dropdown-divider" /></li>
                        <li>
                          <form action={logoutAction}>
                            <button className="dropdown-item" type="submit">
                              <i className="bi bi-box-arrow-right"></i> Salir
                            </button>
                          </form>
                        </li>
                      </ul>
                    </li>
                    {user.role === "admin" && (
                      <li className="nav-item">
                        <a className="nav-link" style={{ color: "var(--warning)" }} href="/admin">
                          <i className="bi bi-speedometer2"></i> Admin
                        </a>
                      </li>
                    )}
                  </>
                ) : (
                  <>
                    <li className="nav-item">
                      <a className="btn btn-sm btn-outline-light" href="/login">Iniciar sesión</a>
                    </li>
                    <li className="nav-item">
                      <a className="btn btn-sm btn-primary" href="/register">Registrarse</a>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </nav>

        <main className="container py-4">
          {children}
        </main>

        <footer className="pt-5 pb-3 mt-5">
          <div className="container">
            <div className="row g-4 mb-4">
              <div className="col-md-4">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <svg width="26" height="26" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="28" height="28" rx="7" fill="url(#bm-f)" />
                    <path d="M8 7h7.5a3.5 3.5 0 0 1 0 7H8V7z" fill="white" opacity=".95" />
                    <path d="M8 14h8a3.5 3.5 0 0 1 0 7H8v-7z" fill="white" opacity=".75" />
                    <defs>
                      <linearGradient id="bm-f" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#6366f1" />
                        <stop offset="1" stopColor="#a855f7" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <span className="fw-bold fs-5" style={{ color: "var(--text)" }}>BitMark</span>
                </div>
                <p className="small mb-3" style={{ color: "var(--text-muted)", lineHeight: 1.7 }}>
                  Tu marketplace de confianza para productos tecnológicos. Calidad y servicio en cada compra.
                </p>
                <div className="d-flex gap-2">
                  <a href="#" className="footer-icon-link" title="Twitter/X"><i className="bi bi-twitter-x"></i></a>
                  <a href="#" className="footer-icon-link" title="Instagram"><i className="bi bi-instagram"></i></a>
                  <a href="#" className="footer-icon-link" title="GitHub"><i className="bi bi-github"></i></a>
                </div>
              </div>
              <div className="col-6 col-md-4">
                <h6 className="footer-heading mb-3">Navegar</h6>
                <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
                  <li><a href="/productos" className="footer-link"><i className="bi bi-grid me-1"></i>Productos</a></li>
                  <li><a href="/carrito" className="footer-link"><i className="bi bi-cart3 me-1"></i>Carrito</a></li>
                  {user && <li><a href="/favoritos" className="footer-link"><i className="bi bi-heart me-1"></i>Mis favoritos</a></li>}
                  {user && <li><a href="/mis-pedidos" className="footer-link"><i className="bi bi-box me-1"></i>Mis pedidos</a></li>}
                </ul>
              </div>
              <div className="col-6 col-md-4">
                <h6 className="footer-heading mb-3">Cuenta</h6>
                <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
                  {!user ? (
                    <>
                      <li><a href="/login" className="footer-link"><i className="bi bi-box-arrow-in-right me-1"></i>Iniciar sesión</a></li>
                      <li><a href="/register" className="footer-link"><i className="bi bi-person-plus me-1"></i>Registrarse</a></li>
                    </>
                  ) : (
                    <>
                      <li><a href="/favoritos" className="footer-link"><i className="bi bi-heart me-1"></i>Mis favoritos</a></li>
                      <li><a href="/mis-pedidos" className="footer-link"><i className="bi bi-receipt me-1"></i>Mis pedidos</a></li>
                      <li><a href="/perfil" className="footer-link"><i className="bi bi-person-circle me-1"></i>Mi perfil</a></li>
                    </>
                  )}
                </ul>
              </div>
            </div>
            <hr style={{ borderColor: "var(--border)", opacity: 1 }} />
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
              <p className="mb-0 small" style={{ color: "var(--text-muted)" }}>
                &copy; {new Date().getFullYear()} BitMark. Todos los derechos reservados.
              </p>
              <div className="d-flex gap-3">
                <a href="#" className="footer-link small">Privacidad</a>
                <a href="#" className="footer-link small">Términos</a>
              </div>
            </div>
          </div>
        </footer>

        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" async></script>
        <script dangerouslySetInnerHTML={{ __html: `
          window.addEventListener('scroll', () => {
            document.querySelector('.navbar')?.classList.toggle('scrolled', window.scrollY > 40);
          }, { passive: true });
          document.addEventListener('click', e => {
            const btn = e.target.closest('.btn');
            if (!btn) return;
            const r = document.createElement('span');
            r.classList.add('ripple');
            const rect = btn.getBoundingClientRect();
            r.style.left = (e.clientX - rect.left - 5) + 'px';
            r.style.top  = (e.clientY - rect.top  - 5) + 'px';
            btn.appendChild(r);
            r.addEventListener('animationend', () => r.remove());
          });
          const _obs = new IntersectionObserver(entries => {
            entries.forEach(en => {
              if (en.isIntersecting) { en.target.classList.add('visible'); _obs.unobserve(en.target); }
            });
          }, { threshold: 0.08 });
          document.querySelectorAll('.aos-item').forEach(el => _obs.observe(el));
          document.querySelectorAll('[data-stagger]').forEach(parent => {
            const delay = parseFloat(parent.dataset.stagger) || 0.08;
            const offset = parseFloat(parent.dataset.staggerOffset) || 0;
            [...parent.children].forEach((child, i) => { child.style.transitionDelay = (offset + i * delay) + 's'; });
          });
        ` }} />
      </body>
    </html>
  );
}
