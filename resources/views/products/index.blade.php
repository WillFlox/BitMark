@extends('layouts.app')
@section('title', 'Productos')

@push('styles')
<style>
    /* ══════════════════════════════════
       HERO CAROUSEL
    ══════════════════════════════════ */
    .hero-carousel {
        position: relative;
        border-radius: 20px;
        overflow: hidden;
        border: 1px solid var(--border);
        animation: fadeInUp .5s ease both;
    }

    /* Pista de slides */
    .hero-slides-track {
        display: flex;
        transition: transform .6s cubic-bezier(.25,.8,.25,1);
        will-change: transform;
    }

    /* Cada slide */
    .hero-slide {
        min-width: 100%;
        position: relative;
        padding: clamp(28px, 5vw, 56px) clamp(20px, 4vw, 40px);
        overflow: hidden;
    }

    /* Imagen de fondo del slide */
    .hero-slide-bg {
        position: absolute;
        inset: 0;
        background-size: cover;
        background-position: center;
        transition: transform 8s linear;
    }
    .hero-carousel:not(:hover) .hero-slide-bg {
        transform: scale(1.04);
    }

    /* Overlay oscuro para legibilidad */
    .hero-slide::before {
        content: '';
        position: absolute; inset: 0; z-index: 1;
        background: linear-gradient(135deg, rgba(10,15,35,.88) 0%, rgba(10,15,35,.65) 60%, transparent 100%);
    }
    /* Overlay de acento */
    .hero-slide::after {
        content: '';
        position: absolute; inset: 0; z-index: 1;
        background: radial-gradient(ellipse 70% 90% at 80% 50%, rgba(99,102,241,.15), transparent);
        pointer-events: none;
    }

    /* Contenido encima del overlay */
    .hero-slide-content { position: relative; z-index: 2; }

    /* Badge */
    .hero-badge {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 4px 12px; border-radius: 999px;
        background: rgba(129,140,248,.18);
        border: 1px solid rgba(129,140,248,.35);
        font-size: .75rem; font-weight: 600; letter-spacing: .04em;
        color: var(--accent); margin-bottom: 16px;
    }

    /* Título */
    .hero-title {
        font-size: clamp(1.75rem, 4vw, 2.6rem);
        font-weight: 800; line-height: 1.15;
        background: linear-gradient(45deg, #818cf8, #c084fc);
        -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        background-clip: text; margin-bottom: 12px;
    }

    /* Subtítulo */
    .hero-subtitle {
        font-size: 1rem; color: rgba(203,213,225,.9);
        max-width: 480px; line-height: 1.65; margin-bottom: 0;
    }

    /* Decoración flotante */
    .hero-decoration {
        position: absolute; right: 40px; top: 50%;
        transform: translateY(-50%); z-index: 2;
        font-size: 7rem; opacity: .07; line-height: 1;
        pointer-events: none; animation: float 4s ease-in-out infinite;
    }

    /* Botón CTA dentro del slide */
    .hero-cta {
        margin-top: 20px;
        display: inline-flex; align-items: center; gap: 7px;
        padding: 10px 22px; border-radius: 12px; font-size: .9rem; font-weight: 600;
        background: linear-gradient(45deg, var(--btn-from), var(--btn-to));
        color: #fff; text-decoration: none; border: none;
        box-shadow: 0 8px 20px rgba(99,102,241,.35);
        transition: transform .25s, box-shadow .25s;
    }
    .hero-cta:hover {
        transform: translateY(-3px);
        box-shadow: 0 14px 28px rgba(99,102,241,.5);
        color: #fff;
    }

    /* ── Flechas ── */
    .hero-arrow {
        position: absolute; top: 50%; transform: translateY(-50%);
        z-index: 10; width: 42px; height: 42px; border-radius: 50%;
        border: 1px solid transparent;
        background: transparent; backdrop-filter: blur(0px);
        color: transparent; font-size: 1rem; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        transition: background .25s, border-color .25s, color .25s,
                    backdrop-filter .25s, transform .25s;
        outline: none;
    }
    .hero-arrow:hover {
        background: rgba(99,102,241,.5);
        border-color: var(--accent);
        color: #fff;
        backdrop-filter: blur(8px);
        transform: translateY(-50%) scale(1.1);
    }
    .hero-arrow-left  { left: 14px; }
    .hero-arrow-right { right: 14px; }

    /* ── Dots ── */
    .hero-dots {
        position: absolute; bottom: 14px; left: 50%;
        transform: translateX(-50%); z-index: 10;
        display: flex; gap: 6px; align-items: center;
    }
    .hero-dot {
        width: 6px; height: 6px; border-radius: 999px;
        background: rgba(255,255,255,.35); cursor: pointer;
        border: none; padding: 0;
        transition: width .35s ease, background .35s ease;
    }
    .hero-dot.active { width: 22px; background: var(--accent); }

    /* Responsive */
    @media (max-width: 575.98px) {
        .hero-decoration { display: none; }
        .hero-subtitle  { font-size: .875rem; }
        .hero-arrow     { width: 34px; height: 34px; font-size: .8rem; }
        .hero-arrow-left  { left: 8px; }
        .hero-arrow-right { right: 8px; }
    }

    /* ── Título sección ── */
    .products-header h2 {
        animation: fadeInLeft .5s ease both;
        background: linear-gradient(45deg, #818cf8, #c084fc);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        font-size: 1.5rem;
    }

    /* ── Barra de búsqueda ── */
    .search-input-group {
        position: relative;
        flex: 1;
    }
    .search-input-group .bi-search {
        position: absolute;
        left: 14px;
        top: 50%;
        transform: translateY(-50%);
        color: #64748b;
        pointer-events: none;
        font-size: .95rem;
    }
    .search-input-group .form-control {
        padding-left: 38px;
    }

    /* ── Panel de filtros unificado ── */
    .filter-panel {
        background: rgba(255,255,255,.03);
        border: 1px solid var(--border);
        border-radius: 16px;
        overflow: hidden;
        animation: fadeInUp .45s .1s ease both;
        margin-bottom: 1.5rem;
    }
    .filter-search-row {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        align-items: center;
        padding: 14px 16px;
        border-bottom: 1px solid var(--border);
    }
    .filter-body {
        display: flex;
        align-items: flex-start;
        gap: 0;
    }
    .filter-section {
        flex: 1;
        padding: 14px 18px;
    }
    .filter-section + .filter-section {
        border-left: 1px solid var(--border);
    }
    .filter-label {
        display: block;
        font-size: .7rem;
        font-weight: 700;
        letter-spacing: .08em;
        text-transform: uppercase;
        color: var(--text-muted);
        margin-bottom: 10px;
    }

    /* ── Chips ── */
    .chip {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 5px 14px;
        border-radius: 999px;
        font-size: .8125rem;
        font-weight: 500;
        border: 1px solid var(--border);
        background: transparent;
        color: var(--text-muted);
        text-decoration: none;
        cursor: pointer;
        transition: color .2s, border-color .2s, background .2s, transform .2s;
        white-space: nowrap;
        line-height: 1.4;
    }
    .chip:hover {
        color: var(--accent);
        border-color: var(--accent);
        background: rgba(129,140,248,.1);
        transform: translateY(-1px);
    }
    .chip.active {
        background: linear-gradient(45deg, var(--btn-from), var(--btn-to));
        border-color: transparent;
        color: #fff;
        box-shadow: 0 4px 14px rgba(99,102,241,.35);
    }
    .chip.active:hover { transform: translateY(-1px); color: #fff; }

    /* ── Precio ── */
    .price-inputs {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: nowrap;
    }
    .price-inputs .price-sep {
        color: var(--text-muted);
        font-size: .85rem;
        white-space: nowrap;
    }
    .price-inputs .form-control {
        width: 110px;
        min-width: 72px;
    }
    .price-inputs .price-icon {
        color: #818cf8;
        font-size: .9rem;
        flex-shrink: 0;
    }

    /* ── Responsive ── */
    @media (max-width: 767.98px) {
        .filter-body { flex-direction: column; }
        .filter-section + .filter-section { border-left: none; border-top: 1px solid var(--border); }
        .price-inputs .form-control { width: 90px; }
    }

    /* ── Imagen con overflow para zoom ── */
    .product-card .img-wrap {
        overflow: hidden;
        height: 200px;
        position: relative;
        border-radius: 13px 13px 0 0;
    }
    @media (max-width: 575.98px) {
        .product-card .img-wrap { height: 150px; }
        .product-card .card-body { padding: .75rem !important; }
        .product-card .card-footer { padding: .6rem .75rem !important; }
    }
    .product-card .img-wrap img {
        width: 100%; height: 100%;
        object-fit: cover;
        transition: transform .45s ease;
    }
    .product-card:hover .img-wrap img { transform: scale(1.09); }
    .product-card .img-wrap::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(to bottom, transparent 60%, rgba(99,102,241,.35));
        opacity: 0;
        transition: opacity .35s;
    }
    .product-card:hover .img-wrap::after { opacity: 1; }

    /* ── Precio con gradiente ── */
    .price-tag {
        background: linear-gradient(45deg, #818cf8, #c084fc);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        font-size: 1.2rem !important;
    }

    /* ── Descripción truncada ── */
    .desc-clamp {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        line-height: 1.5;
        min-height: 3em;
    }

    /* ── Wiggle icono carrito ── */
    @keyframes wiggle {
        0%, 100% { transform: rotate(0); }
        25%       { transform: rotate(-14deg); }
        75%       { transform: rotate(14deg); }
    }
    .btn-cart:hover i { animation: wiggle .35s ease; }

    /* ── Vacío flotante ── */
    .empty-icon {
        color: #818cf8 !important;
        animation: float 3s ease-in-out infinite;
    }

</style>
@endpush

@section('content')

{{-- ══ HERO CAROUSEL (solo sin filtros activos) ══ --}}
@if(!request()->hasAny(['search','category','min_price','max_price']))
<div class="hero-carousel mb-5" id="heroCarousel" aria-label="Banner promocional">

    {{-- Pista de slides --}}
    <div class="hero-slides-track" id="heroTrack">

        {{-- ── Slide 1: General ── --}}
        <div class="hero-slide" role="group" aria-label="Slide 1 de 4">
            <div class="hero-slide-bg"
                 style="background-image:url('https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=500&fit=crop&auto=format')">
            </div>
            <div class="hero-slide-content">
                <span class="hero-badge"><i class="bi bi-lightning-charge-fill"></i> Marketplace tech</span>
                <h1 class="hero-title">Encuentra lo que necesitas,<br>al mejor precio.</h1>
                <p class="hero-subtitle">Explora nuestra selección de productos tecnológicos con envío rápido y garantía de calidad.</p>
                <a href="#productos" class="hero-cta">
                    <i class="bi bi-grid"></i> Ver catálogo
                </a>
            </div>
            <div class="hero-decoration" aria-hidden="true"><i class="bi bi-shop"></i></div>
        </div>

        {{-- ── Slide 2: Electrónica ── --}}
        <div class="hero-slide" role="group" aria-label="Slide 2 de 4">
            <div class="hero-slide-bg"
                 style="background-image:url('https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200&h=500&fit=crop&auto=format')">
            </div>
            <div class="hero-slide-content">
                <span class="hero-badge"><i class="bi bi-cpu-fill"></i> Electrónica</span>
                <h1 class="hero-title">Lo último en<br>tecnología.</h1>
                <p class="hero-subtitle">Auriculares, smartwatches, teclados mecánicos y más. La mejor selección al mejor precio.</p>
                <a href="{{ route('products.index', ['category' => 'electronica']) }}" class="hero-cta">
                    <i class="bi bi-arrow-right-circle"></i> Ver electrónica
                </a>
            </div>
            <div class="hero-decoration" aria-hidden="true"><i class="bi bi-cpu"></i></div>
        </div>

        {{-- ── Slide 3: Deportes & Moda ── --}}
        <div class="hero-slide" role="group" aria-label="Slide 3 de 4">
            <div class="hero-slide-bg"
                 style="background-image:url('https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1200&h=500&fit=crop&auto=format')">
            </div>
            <div class="hero-slide-content">
                <span class="hero-badge"><i class="bi bi-lightning-fill"></i> Deportes & Moda</span>
                <h1 class="hero-title">Equípate y<br>marca tendencia.</h1>
                <p class="hero-subtitle">Zapatillas, ropa premium y mochilas para rendir al máximo dentro y fuera del gimnasio.</p>
                <a href="{{ route('products.index', ['category' => 'deportes']) }}" class="hero-cta">
                    <i class="bi bi-arrow-right-circle"></i> Ver deportes
                </a>
            </div>
            <div class="hero-decoration" aria-hidden="true"><i class="bi bi-trophy"></i></div>
        </div>

        {{-- ── Slide 4: Hogar & Libros ── --}}
        <div class="hero-slide" role="group" aria-label="Slide 4 de 4">
            <div class="hero-slide-bg"
                 style="background-image:url('https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&h=500&fit=crop&auto=format')">
            </div>
            <div class="hero-slide-content">
                <span class="hero-badge"><i class="bi bi-house-heart-fill"></i> Hogar & Cultura</span>
                <h1 class="hero-title">Tu espacio,<br>tu inspiración.</h1>
                <p class="hero-subtitle">Lámparas, utensilios de cocina y los mejores libros de programación para crecer cada día.</p>
                <a href="{{ route('products.index', ['category' => 'hogar']) }}" class="hero-cta">
                    <i class="bi bi-arrow-right-circle"></i> Ver hogar
                </a>
            </div>
            <div class="hero-decoration" aria-hidden="true"><i class="bi bi-book"></i></div>
        </div>

    </div>{{-- /hero-slides-track --}}

    {{-- Flechas de navegación --}}
    <button class="hero-arrow hero-arrow-left"  id="heroPrev" aria-label="Slide anterior">&#10094;</button>
    <button class="hero-arrow hero-arrow-right" id="heroNext" aria-label="Siguiente slide">&#10095;</button>

    {{-- Indicadores de puntos --}}
    <div class="hero-dots" role="tablist" aria-label="Slides">
        <button class="hero-dot active" data-index="0" aria-label="Ir al slide 1" role="tab"></button>
        <button class="hero-dot"        data-index="1" aria-label="Ir al slide 2" role="tab"></button>
        <button class="hero-dot"        data-index="2" aria-label="Ir al slide 3" role="tab"></button>
        <button class="hero-dot"        data-index="3" aria-label="Ir al slide 4" role="tab"></button>
    </div>

</div>
@endif

{{-- Encabezado --}}
<div class="products-header d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3" id="productos">
    <h2 class="fw-bold mb-0">Nuestros Productos</h2>
    @if($products->total() > 0)
        <span class="text-muted small">{{ $products->total() }} {{ $products->total() == 1 ? 'producto' : 'productos' }}</span>
    @endif
</div>

{{-- Panel de filtros unificado --}}
<form action="{{ route('products.index') }}" method="GET" class="filter-panel mb-4">

    {{-- Fila de búsqueda --}}
    <div class="filter-search-row">
        <div class="search-input-group flex-grow-1" style="min-width:200px">
            <i class="bi bi-search"></i>
            <input type="text" name="search" class="form-control"
                   placeholder="Buscar producto..." value="{{ request('search') }}">
        </div>
        <button class="btn btn-primary px-3">
            <i class="bi bi-search me-1"></i><span class="d-none d-sm-inline">Buscar</span>
        </button>
        @if(request()->hasAny(['search','category','min_price','max_price']))
            <a href="{{ route('products.index') }}" class="btn btn-outline-secondary" title="Limpiar filtros">
                <i class="bi bi-x-lg"></i>
            </a>
        @endif
    </div>

    {{-- Cuerpo: categorías + precio --}}
    <div class="filter-body">

        {{-- Categorías --}}
        <div class="filter-section">
            <span class="filter-label"><i class="bi bi-grid me-1"></i>Categoría</span>
            <div class="d-flex flex-wrap gap-2">
                <button type="submit" name="category" value=""
                        class="chip {{ !request('category') ? 'active' : '' }}">
                    <i class="bi bi-grid-3x3-gap-fill"></i> Todas
                </button>
                @foreach($categories as $cat)
                    <button type="submit" name="category" value="{{ $cat->slug }}"
                            class="chip {{ request('category') == $cat->slug ? 'active' : '' }}">
                        {{ $cat->name }}
                    </button>
                @endforeach
            </div>
        </div>

        {{-- Precio --}}
        <div class="filter-section" style="flex: 0 0 auto; min-width: 260px;">
            <span class="filter-label"><i class="bi bi-tag me-1"></i>Rango de precio</span>
            <div class="price-inputs">
                <i class="bi bi-currency-dollar price-icon"></i>
                <input type="number" name="min_price" class="form-control"
                       placeholder="Mín" value="{{ request('min_price') }}"
                       min="0" step="0.01" title="Precio mínimo">
                <span class="price-sep">—</span>
                <input type="number" name="max_price" class="form-control"
                       placeholder="Máx" value="{{ request('max_price') }}"
                       min="0" step="0.01" title="Precio máximo">
            </div>
        </div>

    </div>
</form>

@if($products->isEmpty())
    <div class="text-center py-5">
        <i class="bi bi-box-seam display-1 text-muted empty-icon"></i>
        <p class="text-muted mt-3">No se encontraron productos.</p>
    </div>
@else
    <div class="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-3 g-md-4" data-stagger="0.07" data-stagger-offset="0.05">
        @foreach($products as $product)
            <div class="col aos-item">
                <div class="card product-card h-100 border-0 shadow-sm">
                    <div class="img-wrap">
                        <img src="{{ $product->image_url }}" alt="{{ $product->name }}">
                    </div>
                    <div class="card-body d-flex flex-column gap-1">
                        <span class="badge bg-secondary mb-1 align-self-start">{{ $product->category->name }}</span>
                        <h6 class="card-title fw-bold mb-1">{{ $product->name }}</h6>
                        @if($product->description)
                            <p class="card-text small text-muted desc-clamp mb-1">{{ $product->description }}</p>
                        @endif
                        <p class="card-text price-tag fw-bold fs-5 mb-1 mt-auto">${{ number_format($product->price, 2) }}</p>
                        <p class="card-text small text-muted mb-0">
                            @if($product->stock > 0)
                                <i class="bi bi-check-circle-fill text-success"></i> {{ $product->stock }} en stock
                            @else
                                <i class="bi bi-x-circle-fill text-danger"></i> Sin stock
                            @endif
                        </p>
                    </div>
                    <div class="card-footer bg-transparent border-0 d-flex gap-2">
                        <a href="{{ route('products.show', $product) }}" class="btn btn-outline-primary btn-sm flex-fill">Ver detalle</a>
                        @if($product->stock > 0)
                            <form action="{{ route('cart.add', $product) }}" method="POST">
                                @csrf
                                <button class="btn btn-primary btn-sm btn-cart" title="Agregar al carrito">
                                    <i class="bi bi-cart-plus"></i>
                                </button>
                            </form>
                        @else
                            <button class="btn btn-secondary btn-sm" disabled>Agotado</button>
                        @endif
                    </div>
                </div>
            </div>
        @endforeach
    </div>
    <div class="mt-4 aos-item">{{ $products->links() }}</div>
@endif
@endsection

@push('scripts')
<script>
(function () {
    const track  = document.getElementById('heroTrack');
    if (!track) return;                     // no mostrar si hay filtros activos

    const dots   = document.querySelectorAll('.hero-dot');
    const total  = dots.length;
    let   idx    = 0;
    let   timer  = null;

    /* ── Render: mueve la pista y activa el dot ── */
    function render() {
        track.style.transform = `translateX(-${idx * 100}%)`;
        dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    }

    /* ── Avanzar ── */
    function next() {
        idx = (idx + 1) % total;
        render();
    }

    /* ── Navegar manualmente ── */
    function go(dir) {
        idx = (idx + dir + total) % total;
        render();
        resetTimer();
    }

    /* ── Reiniciar temporizador ── */
    function resetTimer() {
        clearInterval(timer);
        timer = setInterval(next, 4000);
    }

    /* ── Botones de flecha ── */
    document.getElementById('heroPrev')?.addEventListener('click', () => go(-1));
    document.getElementById('heroNext')?.addEventListener('click', () => go(1));

    /* ── Dots ── */
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            idx = parseInt(dot.dataset.index, 10);
            render();
            resetTimer();
        });
    });

    /* ── Swipe táctil ── */
    let touchX = 0;
    track.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend',   e => {
        const diff = touchX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) go(diff > 0 ? 1 : -1);
    }, { passive: true });

    /* ── Pausar al hover ── */
    const carousel = document.getElementById('heroCarousel');
    carousel?.addEventListener('mouseenter', () => clearInterval(timer));
    carousel?.addEventListener('mouseleave', resetTimer);

    /* ── Init ── */
    render();
    resetTimer();
})();
</script>
@endpush
