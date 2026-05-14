<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Marketplace') — BitMark</title>

    {{-- SEO & Open Graph --}}
    <meta name="description" content="@yield('meta_description', 'BitMark — Tu marketplace de productos tecnológicos. Encuentra electrónica, accesorios y más con envío rápido.')">
    <meta property="og:title"       content="@yield('title', 'BitMark Marketplace')">
    <meta property="og:description" content="@yield('meta_description', 'Tu marketplace de confianza para productos tecnológicos.')">
    <meta property="og:type"        content="website">
    <meta property="og:site_name"   content="BitMark">
    <meta name="theme-color"        content="#6366f1">

    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">
    <style>
        /* ══════════════════════════════════════
           CURSOR PERSONALIZADO
        ══════════════════════════════════════ */
        * {
            cursor: url('https://cdn.cursors-4u.net/previews/arrow-825426cd-preview-32.webp') 0 0, auto !important;
        }

        /* ══════════════════════════════════════
           VARIABLES — paleta de deco.css
        ══════════════════════════════════════ */
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

        /* ══════════════════════════════════════
           BASE
        ══════════════════════════════════════ */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            background: var(--bg);
            color: var(--text);
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            min-height: 100vh;
            -webkit-font-smoothing: antialiased;
        }

        /* ══════════════════════════════════════
           KEYFRAMES (de deco.css + extras)
        ══════════════════════════════════════ */
        @keyframes float {
            0%, 100% { transform: translateY(0); }
            50%       { transform: translateY(-12px); }
        }
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(28px); }
            to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInLeft {
            from { opacity: 0; transform: translateX(-40px); }
            to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInRight {
            from { opacity: 0; transform: translateX(40px); }
            to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInDown {
            from { opacity: 0; transform: translateY(-20px); }
            to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
            0%   { opacity: 0; transform: scale(.85); }
            70%  { transform: scale(1.05); }
            100% { opacity: 1; transform: scale(1); }
        }
        @keyframes ripple-spread {
            to { transform: scale(4); opacity: 0; }
        }
        @keyframes slideAlert {
            from { opacity: 0; transform: translateX(30px); }
            to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse-badge {
            0%, 100% { transform: scale(1); }
            50%       { transform: scale(1.4); }
        }
        @keyframes gradientShift {
            0%   { background-position: 0% 50%; }
            50%  { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }

        /* ══════════════════════════════════════
           PAGE ENTER
        ══════════════════════════════════════ */
        main.container { animation: fadeInUp .45s ease both; }

        /* ══════════════════════════════════════
           NAVBAR — glassmorphism de deco.css
        ══════════════════════════════════════ */
        .navbar {
            background: var(--surface) !important;
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border-bottom: 1px solid var(--border);
            padding: 14px 0;
            transition: box-shadow .4s;
        }
        .navbar.scrolled {
            box-shadow: 0 4px 30px rgba(99,102,241,.25);
        }

        /* Logo */
        .navbar-brand {
            font-size: 1.6rem;
            font-weight: bold;
            color: var(--text) !important;
            animation: fadeInDown .5s ease both;
            transition: transform .4s, color .4s !important;
        }
        .navbar-brand:hover {
            transform: scale(1.08);
            color: var(--accent) !important;
        }

        /* Nav links */
        .navbar .nav-link {
            color: var(--text) !important;
            font-size: 15px;
            padding: 8px 4px !important;
            position: relative;
            transition: color .4s ease !important;
            display: flex;
            align-items: center;
            gap: 5px;
        }
        /* Underline desde el centro — igual que deco.css */
        .navbar .nav-link::before {
            content: '';
            position: absolute;
            bottom: -2px; left: 50%;
            transform: translateX(-50%);
            width: 0; height: 2px;
            background: var(--accent);
            transition: width .4s ease;
            border-radius: 10px;
        }
        .navbar .nav-link:hover::before { width: 100%; }
        /* Glow en hover — igual que deco.css */
        .navbar .nav-link:hover {
            color: var(--accent) !important;
            text-shadow: 0 0 10px var(--accent), 0 0 20px var(--accent);
        }
        /* Icono rota 180° — igual que deco.css */
        .navbar .nav-link i { transition: transform .4s; }
        .navbar .nav-link:hover i { transform: rotate(180deg); }

        /* Badge carrito */
        .navbar .badge.bg-danger {
            background: linear-gradient(45deg, var(--btn-from), var(--btn-to)) !important;
            animation: pulse-badge 1.8s ease-in-out infinite;
            display: inline-block;
        }

        /* Toggler */
        .navbar-toggler { border-color: var(--border); }
        .navbar-toggler-icon {
            filter: invert(1);
        }

        /* ══════════════════════════════════════
           BOTONES — gradiente de deco.css
        ══════════════════════════════════════ */
        .btn {
            position: relative;
            overflow: hidden;
            border-radius: 12px;
            font-size: 15px;
            transition: transform .4s, box-shadow .4s, background-position .4s !important;
        }
        .btn:active { transform: scale(.96) !important; }

        /* Primary = gradiente deco.css */
        .btn-primary, .btn-primary:focus {
            background: linear-gradient(45deg, var(--btn-from), var(--btn-to)) !important;
            border: none !important;
            color: #fff !important;
            box-shadow: 0 10px 20px var(--btn-shadow);
        }
        .btn-primary:hover {
            transform: translateY(-5px) scale(1.05) !important;
            box-shadow: 0 15px 30px rgba(99,102,241,.55) !important;
        }

        /* Success */
        .btn-success, .btn-success:focus {
            background: linear-gradient(45deg, #059669, #10b981) !important;
            border: none !important;
            color: #fff !important;
            box-shadow: 0 10px 20px rgba(16,185,129,.25);
        }
        .btn-success:hover {
            transform: translateY(-5px) scale(1.05) !important;
            box-shadow: 0 15px 30px rgba(16,185,129,.45) !important;
        }

        /* Danger */
        .btn-danger, .btn-danger:focus {
            background: linear-gradient(45deg, #dc2626, #f87171) !important;
            border: none !important;
            color: #fff !important;
        }
        .btn-danger:hover {
            transform: translateY(-4px) scale(1.04) !important;
            box-shadow: 0 12px 24px rgba(220,38,38,.4) !important;
        }

        /* Outline primary */
        .btn-outline-primary {
            color: var(--accent) !important;
            border-color: var(--accent) !important;
            background: transparent !important;
        }
        .btn-outline-primary:hover {
            background: rgba(129,140,248,.15) !important;
            transform: translateY(-3px) scale(1.03) !important;
            box-shadow: 0 8px 20px rgba(129,140,248,.3) !important;
        }

        /* Outline light / secondary */
        .btn-outline-light {
            color: var(--text) !important;
            border-color: var(--border) !important;
        }
        .btn-outline-light:hover {
            background: rgba(255,255,255,.1) !important;
            transform: translateY(-3px) !important;
        }
        .btn-outline-secondary {
            color: var(--text-muted) !important;
            border-color: var(--border) !important;
            background: transparent !important;
        }
        .btn-outline-secondary:hover {
            background: rgba(255,255,255,.08) !important;
            transform: translateY(-2px) !important;
        }
        .btn-outline-danger {
            color: var(--danger) !important;
            border-color: var(--danger) !important;
            background: transparent !important;
        }
        .btn-outline-danger:hover {
            background: rgba(248,113,113,.15) !important;
            transform: translateY(-2px) !important;
        }

        /* Ripple */
        .btn .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255,255,255,.3);
            width: 10px; height: 10px;
            pointer-events: none;
            animation: ripple-spread .55s linear forwards;
        }

        /* ══════════════════════════════════════
           CARDS — glassmorphism
        ══════════════════════════════════════ */
        .card {
            background: var(--surface) !important;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 1px solid var(--border) !important;
            color: var(--text) !important;
            border-radius: 14px !important;
            transition: transform .4s cubic-bezier(.25,.8,.25,1),
                        box-shadow .4s cubic-bezier(.25,.8,.25,1);
            will-change: transform;
        }
        .card:hover {
            transform: translateY(-8px) scale(1.015);
            box-shadow: 0 20px 40px rgba(99,102,241,.25) !important;
        }
        .card-header {
            background: rgba(99,102,241,.12) !important;
            border-bottom: 1px solid var(--border) !important;
            color: var(--text) !important;
            font-weight: bold;
        }
        .card-footer {
            background: transparent !important;
            border-top: 1px solid var(--border) !important;
        }
        .card-text, .card-body { color: var(--text) !important; }

        /* ══════════════════════════════════════
           FORMULARIOS
        ══════════════════════════════════════ */
        .form-control, .form-select {
            background: rgba(15,23,42,.8) !important;
            border: 1px solid var(--border) !important;
            color: var(--text) !important;
            border-radius: 10px !important;
            transition: border-color .3s, box-shadow .3s;
        }
        .form-control:focus, .form-select:focus {
            border-color: var(--accent) !important;
            box-shadow: 0 0 0 3px rgba(129,140,248,.25) !important;
            background: rgba(15,23,42,.95) !important;
            color: var(--text) !important;
        }
        .form-control::placeholder { color: #64748b !important; }
        .form-select option { background: var(--surface-solid); color: var(--text); }
        .form-label { color: var(--text-muted); }
        .form-check-input {
            background-color: rgba(15,23,42,.8) !important;
            border-color: var(--border) !important;
        }
        .form-check-input:checked {
            background-color: var(--btn-from) !important;
            border-color: var(--btn-from) !important;
        }

        /* ══════════════════════════════════════
           TABLAS
        ══════════════════════════════════════ */
        .table {
            color: var(--text) !important;
            border-color: var(--border) !important;
        }
        .table > :not(caption) > * > * {
            background-color: transparent !important;
            border-bottom-color: var(--border) !important;
            color: var(--text) !important;
        }
        .table-hover > tbody > tr:hover > * {
            background-color: rgba(129,140,248,.08) !important;
        }
        .table-dark > * > tr > * {
            background: rgba(99,102,241,.2) !important;
            color: var(--text) !important;
        }
        .table-responsive { border-radius: 14px; overflow: hidden; }

        /* ══════════════════════════════════════
           BADGES
        ══════════════════════════════════════ */
        .badge.bg-secondary {
            background: rgba(129,140,248,.25) !important;
            color: var(--accent) !important;
            border: 1px solid rgba(129,140,248,.3);
        }
        .badge.bg-warning  { background: rgba(251,191,36,.2) !important; color: var(--warning) !important; }
        .badge.bg-info     { background: rgba(56,189,248,.2) !important; color: #38bdf8 !important; }
        .badge.bg-primary  { background: rgba(99,102,241,.3) !important; color: var(--accent) !important; }
        .badge.bg-success  { background: rgba(52,211,153,.2) !important; color: var(--success) !important; }
        .badge.bg-danger   { background: rgba(248,113,113,.2) !important; color: var(--danger) !important; }

        /* ══════════════════════════════════════
           ALERTAS
        ══════════════════════════════════════ */
        .alert {
            animation: slideAlert .4s ease both;
            border-radius: 12px !important;
            border: 1px solid var(--border) !important;
        }
        .alert-success {
            background: rgba(52,211,153,.12) !important;
            color: var(--success) !important;
        }
        .alert-danger {
            background: rgba(248,113,113,.12) !important;
            color: var(--danger) !important;
        }
        .btn-close { filter: invert(1); }

        /* ══════════════════════════════════════
           BREADCRUMB
        ══════════════════════════════════════ */
        .breadcrumb { background: transparent !important; }
        .breadcrumb-item a { color: var(--accent); text-decoration: none; }
        .breadcrumb-item a:hover { text-shadow: 0 0 10px var(--accent), 0 0 20px var(--accent); }
        .breadcrumb-item.active { color: var(--text-muted); }
        .breadcrumb-item + .breadcrumb-item::before { color: var(--text-muted); }

        /* ══════════════════════════════════════
           PAGINACIÓN
        ══════════════════════════════════════ */
        .pagination .page-link {
            background: var(--surface) !important;
            border-color: var(--border) !important;
            color: var(--accent) !important;
            border-radius: 8px !important;
            transition: .3s;
        }
        .pagination .page-link:hover {
            background: rgba(129,140,248,.2) !important;
            color: #fff !important;
        }
        .pagination .page-item.active .page-link {
            background: linear-gradient(45deg, var(--btn-from), var(--btn-to)) !important;
            border-color: transparent !important;
            color: #fff !important;
        }
        .pagination .page-item.disabled .page-link { opacity: .4; }

        /* ══════════════════════════════════════
           TEXT UTILITIES
        ══════════════════════════════════════ */
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

        /* ══════════════════════════════════════
           ANIMATE-ON-SCROLL UTILITY
        ══════════════════════════════════════ */
        .aos-item {
            opacity: 0;
            transform: translateY(24px);
            transition: opacity .5s ease, transform .5s ease;
        }
        .aos-item.visible { opacity: 1; transform: none; }

        /* Floating helper */
        .floating { animation: float 3s ease-in-out infinite; }

        /* ══════════════════════════════════════
           LOGO — logo.css
        ══════════════════════════════════════ */
        .logo-nav-link {
            position: relative;
            display: flex;
            align-items: center;
            cursor: pointer;
            text-decoration: none !important;
        }
        .logo-wrapper {
            position: relative;
            display: inline-block;
            padding: 10px 18px;
        }
        .logo-img {
            font-size: 28px;
            font-weight: 800;
            color: white !important;
            position: relative;
            z-index: 5;
            transition: 0.35s;
            -webkit-text-fill-color: white !important;
            letter-spacing: normal !important;
            text-shadow: none !important;
        }
        /* Rings (neon circles) */
        .logo-ring-1,
        .logo-ring-2 {
            position: absolute;
            inset: -10px;
            border-radius: 14px;
            border: 1px solid rgba(138,60,255,.3);
            opacity: 0;
            transform: scale(0.8);
            transition: 0.35s;
            pointer-events: none;
        }
        .logo-ring-2 {
            inset: -18px;
            border: 1px solid rgba(0,229,255,.2);
        }
        /* Scan line */
        .logo-scan {
            position: absolute;
            left: 0; top: 0;
            width: 100%; height: 2px;
            opacity: 0;
            z-index: 4;
            pointer-events: none;
            background: linear-gradient(
                90deg,
                transparent,
                rgb(138,60,255),
                rgb(0,229,255),
                transparent
            );
        }
        @keyframes logo-scan-sweep {
            0%   { top: 0;    opacity: .9; }
            50%  { top: 100%; opacity: .5; }
            100% { top: 0;    opacity: 0;  }
        }
        /* Hover effects — iguales a logo.css */
        .logo-nav-link:hover .logo-scan {
            opacity: 1;
            animation: logo-scan-sweep 1s ease-in-out infinite;
        }
        .logo-nav-link:hover .logo-img {
            filter:
                brightness(1.15)
                drop-shadow(0 0 8px  rgba(138,60,255,.7))
                drop-shadow(0 0 20px rgba(0,229,255,.3));
            transform: scale(1.04);
        }
        .logo-nav-link:hover .logo-ring-1,
        .logo-nav-link:hover .logo-ring-2 {
            opacity: 1;
            transform: scale(1);
        }
        /* Anular el hover genérico del navbar-brand para este logo */
        .logo-nav-link:hover {
            transform: none !important;
            color: white !important;
            letter-spacing: normal !important;
        }

        /* ══════════════════════════════════════
           FOOTER
        ══════════════════════════════════════ */
        footer {
            background: rgba(15,23,42,.96);
            border-top: 1px solid var(--border);
            color: var(--text-muted);
        }
        footer p { color: var(--text-muted) !important; }

        .footer-heading {
            font-size: .7rem;
            font-weight: 700;
            letter-spacing: .1em;
            text-transform: uppercase;
            color: var(--accent) !important;
        }
        .footer-link {
            color: var(--text-muted);
            text-decoration: none;
            font-size: .875rem;
            transition: color .25s;
        }
        .footer-link:hover { color: var(--accent); }

        .footer-icon-link {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 32px; height: 32px;
            border-radius: 8px;
            border: 1px solid var(--border);
            color: var(--text-muted);
            text-decoration: none;
            font-size: 1rem;
            transition: color .25s, border-color .25s, background .25s;
        }
        .footer-icon-link:hover {
            color: var(--accent);
            border-color: var(--accent);
            background: rgba(129,140,248,.1);
        }

        /* ══════════════════════════════════════
           FORM-CHECK BORDERS (shipping methods)
        ══════════════════════════════════════ */
        .form-check.border {
            border-color: var(--border) !important;
            border-radius: 10px !important;
            background: rgba(15,23,42,.5);
            transition: background .3s, border-color .3s;
        }
        .form-check.border:hover {
            background: rgba(129,140,248,.08) !important;
            border-color: var(--accent) !important;
        }
        .form-check-label { color: var(--text) !important; }

        /* Invalid */
        .invalid-feedback { color: var(--danger) !important; }
        .is-invalid { border-color: var(--danger) !important; }

        /* ══════════════════════════════════════
           RESPONSIVE — MOBILE FIRST
        ══════════════════════════════════════ */

        /* Contenedor con padding cómodo en mobile */
        @media (max-width: 575.98px) {
            main.container {
                padding-left: 14px;
                padding-right: 14px;
            }

            /* Navbar colapsado: mejor espaciado */
            .navbar-collapse {
                border-top: 1px solid var(--border);
                margin-top: 10px;
                padding-top: 10px;
            }
            .navbar .navbar-nav .nav-link {
                padding: 10px 4px !important;
            }
            /* Auth buttons ocupan ancho completo en mobile */
            .navbar-collapse .btn {
                width: 100%;
                text-align: center;
                margin-top: 4px;
            }
            /* Gap entre items del navbar */
            .navbar-collapse .navbar-nav.ms-auto {
                gap: 0 !important;
                padding-bottom: 8px;
            }

            /* Cards: menos padding en mobile */
            .card-body { padding: 1rem !important; }
            .card-header { padding: .65rem 1rem !important; }
        }

        /* Evitar overflow horizontal en toda la página */
        html, body { overflow-x: hidden; }

        /* Botones: no overflow en mobile */
        @media (max-width: 400px) {
            .btn { font-size: 14px; }
        }

        /* Checkout summary: quitar sticky en mobile */
        @media (max-width: 991.98px) {
            .checkout-summary-sticky {
                position: relative !important;
                top: auto !important;
            }
        }

        /* Footer: centrar columnas en mobile */
        @media (max-width: 575.98px) {
            footer .col-6 { width: 50%; }
        }
    </style>
    @stack('styles')
</head>
<body>

<nav class="navbar navbar-expand-lg navbar-dark sticky-top">
    <div class="container">
        <a class="navbar-brand logo-nav-link" href="{{ route('products.index') }}">
            <div class="logo-wrapper">
                <span class="logo-img">
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;margin-right:6px;flex-shrink:0">
                        <rect width="28" height="28" rx="7" fill="url(#bm-g)"/>
                        <path d="M8 7h7.5a3.5 3.5 0 0 1 0 7H8V7z" fill="white" opacity=".95"/>
                        <path d="M8 14h8a3.5 3.5 0 0 1 0 7H8v-7z" fill="white" opacity=".75"/>
                        <defs>
                            <linearGradient id="bm-g" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                                <stop stop-color="#6366f1"/>
                                <stop offset="1" stop-color="#a855f7"/>
                            </linearGradient>
                        </defs>
                    </svg>BitMark</span>
                <div class="logo-ring-1"></div>
                <div class="logo-ring-2"></div>
                <div class="logo-scan"></div>
            </div>
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navMenu">
            <ul class="navbar-nav me-auto">
                <li class="nav-item">
                    <a class="nav-link" href="{{ route('products.index') }}">
                        <i class="bi bi-grid"></i> Productos
                    </a>
                </li>
            </ul>
            <ul class="navbar-nav ms-auto align-items-center gap-2">
                <li class="nav-item">
                    <a class="nav-link" href="{{ route('cart.index') }}">
                        <i class="bi bi-cart3"></i>
                        @php $cartCount = count(session('cart', [])) @endphp
                        @if($cartCount > 0)
                            <span class="badge bg-danger">{{ $cartCount }}</span>
                        @endif
                        Carrito
                    </a>
                </li>
                @auth
                    <li class="nav-item">
                        <a class="nav-link" href="{{ route('orders.index') }}">
                            <i class="bi bi-box"></i> Mis pedidos
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="{{ route('profile.edit') }}">
                            <i class="bi bi-person-circle"></i> Mi perfil
                        </a>
                    </li>
                    @if(auth()->user()->role === 'admin')
                        <li class="nav-item">
                            <a class="nav-link" style="color:var(--warning)!important" href="{{ route('admin.dashboard') }}">
                                <i class="bi bi-speedometer2"></i> Admin
                            </a>
                        </li>
                    @endif
                    <li class="nav-item">
                        <form action="{{ route('logout') }}" method="POST" class="d-inline">
                            @csrf
                            <button class="btn btn-sm btn-outline-light">
                                <i class="bi bi-box-arrow-right"></i> Salir
                            </button>
                        </form>
                    </li>
                @else
                    <li class="nav-item">
                        <a class="btn btn-sm btn-outline-light" href="{{ route('login') }}">Iniciar sesión</a>
                    </li>
                    <li class="nav-item">
                        <a class="btn btn-sm btn-primary" href="{{ route('register') }}">Registrarse</a>
                    </li>
                @endauth
            </ul>
        </div>
    </div>
</nav>

<main class="container py-4">
    @if(session('success'))
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            <i class="bi bi-check-circle-fill me-2"></i>{{ session('success') }}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    @endif
    @if(session('error'))
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ session('error') }}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    @endif

    @yield('content')
</main>

<footer class="pt-5 pb-3 mt-5">
    <div class="container">
        <div class="row g-4 mb-4">

            {{-- Columna 1: Marca --}}
            <div class="col-md-4">
                <div class="d-flex align-items-center gap-2 mb-3">
                    <svg width="26" height="26" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="28" height="28" rx="7" fill="url(#bm-f)"/>
                        <path d="M8 7h7.5a3.5 3.5 0 0 1 0 7H8V7z" fill="white" opacity=".95"/>
                        <path d="M8 14h8a3.5 3.5 0 0 1 0 7H8v-7z" fill="white" opacity=".75"/>
                        <defs>
                            <linearGradient id="bm-f" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                                <stop stop-color="#6366f1"/>
                                <stop offset="1" stop-color="#a855f7"/>
                            </linearGradient>
                        </defs>
                    </svg>
                    <span class="fw-bold fs-5" style="color:var(--text)">BitMark</span>
                </div>
                <p class="small mb-3" style="color:var(--text-muted);line-height:1.7">
                    Tu marketplace de confianza para productos tecnológicos. Calidad y servicio en cada compra.
                </p>
                <div class="d-flex gap-2">
                    <a href="#" class="footer-icon-link" title="Twitter/X" aria-label="Twitter">
                        <i class="bi bi-twitter-x"></i>
                    </a>
                    <a href="#" class="footer-icon-link" title="Instagram" aria-label="Instagram">
                        <i class="bi bi-instagram"></i>
                    </a>
                    <a href="#" class="footer-icon-link" title="GitHub" aria-label="GitHub">
                        <i class="bi bi-github"></i>
                    </a>
                </div>
            </div>

            {{-- Columna 2: Navegar --}}
            <div class="col-6 col-md-4">
                <h6 class="footer-heading mb-3">Navegar</h6>
                <ul class="list-unstyled d-flex flex-column gap-2 mb-0">
                    <li><a href="{{ route('products.index') }}" class="footer-link"><i class="bi bi-grid me-1"></i>Productos</a></li>
                    <li><a href="{{ route('cart.index') }}"     class="footer-link"><i class="bi bi-cart3 me-1"></i>Carrito</a></li>
                    @auth
                    <li><a href="{{ route('orders.index') }}"   class="footer-link"><i class="bi bi-box me-1"></i>Mis pedidos</a></li>
                    @endauth
                </ul>
            </div>

            {{-- Columna 3: Cuenta --}}
            <div class="col-6 col-md-4">
                <h6 class="footer-heading mb-3">Cuenta</h6>
                <ul class="list-unstyled d-flex flex-column gap-2 mb-0">
                    @guest
                    <li><a href="{{ route('login') }}"    class="footer-link"><i class="bi bi-box-arrow-in-right me-1"></i>Iniciar sesión</a></li>
                    <li><a href="{{ route('register') }}" class="footer-link"><i class="bi bi-person-plus me-1"></i>Registrarse</a></li>
                    @endguest
                    @auth
                    <li><a href="{{ route('orders.index') }}"  class="footer-link"><i class="bi bi-receipt me-1"></i>Mis pedidos</a></li>
                    <li><a href="{{ route('profile.edit') }}"  class="footer-link"><i class="bi bi-person-circle me-1"></i>Mi perfil</a></li>
                    @endauth
                </ul>
            </div>

        </div>

        <hr style="border-color:var(--border);opacity:1">

        <div class="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
            <p class="mb-0 small" style="color:var(--text-muted)">&copy; {{ date('Y') }} BitMark. Todos los derechos reservados.</p>
            <div class="d-flex gap-3">
                <a href="#" class="footer-link small">Privacidad</a>
                <a href="#" class="footer-link small">Términos</a>
            </div>
        </div>
    </div>
</footer>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script>
    /* Navbar scroll glow */
    window.addEventListener('scroll', () => {
        document.querySelector('.navbar').classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });

    /* Ripple en botones */
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

    /* Intersection Observer para .aos-item */
    const _observer = new IntersectionObserver(entries => {
        entries.forEach(en => {
            if (en.isIntersecting) { en.target.classList.add('visible'); _observer.unobserve(en.target); }
        });
    }, { threshold: 0.08 });
    document.querySelectorAll('.aos-item').forEach(el => _observer.observe(el));

    /* Stagger: aplica transitionDelay escalonado a hijos directos */
    document.querySelectorAll('[data-stagger]').forEach(parent => {
        const delay  = parseFloat(parent.dataset.stagger) || 0.08;
        const offset = parseFloat(parent.dataset.staggerOffset) || 0;
        [...parent.children].forEach((child, i) => {
            child.style.transitionDelay = (offset + i * delay) + 's';
        });
    });
</script>
@stack('scripts')
</body>
</html>
