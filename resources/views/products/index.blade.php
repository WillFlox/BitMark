@extends('layouts.app')
@section('title', 'Productos')

@push('styles')
<style>
    /* ── Hero ── */
    .hero-section {
        position: relative;
        border-radius: 20px;
        overflow: hidden;
        padding: clamp(28px, 5vw, 56px) clamp(20px, 4vw, 40px);
        background: linear-gradient(135deg, rgba(99,102,241,.18) 0%, rgba(168,85,247,.14) 50%, rgba(15,23,42,0) 100%),
                    var(--surface-solid);
        border: 1px solid var(--border);
        animation: fadeInUp .5s ease both;
    }
    .hero-section::before {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse 60% 80% at 80% 50%, rgba(129,140,248,.12), transparent);
        pointer-events: none;
    }
    .hero-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 12px;
        border-radius: 999px;
        background: rgba(129,140,248,.15);
        border: 1px solid rgba(129,140,248,.3);
        font-size: .75rem;
        font-weight: 600;
        letter-spacing: .04em;
        color: var(--accent);
        margin-bottom: 16px;
    }
    .hero-title {
        font-size: clamp(1.75rem, 4vw, 2.6rem);
        font-weight: 800;
        line-height: 1.15;
        background: linear-gradient(45deg, #818cf8, #c084fc);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin-bottom: 12px;
    }
    .hero-subtitle {
        font-size: 1rem;
        color: var(--text-muted);
        max-width: 480px;
        line-height: 1.65;
        margin-bottom: 0;
    }
    .hero-decoration {
        position: absolute;
        right: 40px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 7rem;
        opacity: .06;
        line-height: 1;
        pointer-events: none;
        animation: float 4s ease-in-out infinite;
    }
    @media (max-width: 575.98px) {
        .hero-decoration { display: none; }
        .hero-subtitle { font-size: .9rem; }
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
    .search-bar-wrap { animation: fadeInUp .5s .1s ease both; }
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

    /* ── Category chips ── */
    .category-chips { animation: fadeInUp .45s .15s ease both; }
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
        transition: color .2s, border-color .2s, background .2s, transform .2s;
        white-space: nowrap;
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

{{-- Hero section (solo sin filtros activos) --}}
@if(!request()->hasAny(['search','category']))
<div class="hero-section mb-5">
    <span class="hero-badge"><i class="bi bi-lightning-charge-fill"></i> Marketplace tech</span>
    <h1 class="hero-title">Encuentra lo que necesitas,<br>al mejor precio.</h1>
    <p class="hero-subtitle">Explora nuestra selección de productos tecnológicos con envío rápido y garantía de calidad.</p>
    <div class="hero-decoration" aria-hidden="true"><i class="bi bi-shop"></i></div>
</div>
@endif

{{-- Encabezado + búsqueda --}}
<div class="products-header row g-3 mb-3">
    <div class="col-12 d-flex align-items-center justify-content-between flex-wrap gap-2">
        <h2 class="fw-bold mb-0">Nuestros Productos</h2>
        @if($products->total() > 0)
            <span class="text-muted small">{{ $products->total() }} {{ $products->total() == 1 ? 'producto' : 'productos' }}</span>
        @endif
    </div>
    <div class="col-12 search-bar-wrap">
        <form action="{{ route('products.index') }}" method="GET" class="d-flex gap-2 flex-wrap">
            <input type="hidden" name="category" value="{{ request('category') }}">
            <div class="search-input-group flex-grow-1" style="min-width:200px">
                <i class="bi bi-search"></i>
                <input type="text" name="search" class="form-control" placeholder="Buscar producto..." value="{{ request('search') }}">
            </div>
            <button class="btn btn-primary px-3"><i class="bi bi-search me-1"></i><span class="d-none d-sm-inline">Buscar</span></button>
            @if(request()->hasAny(['search','category']))
                <a href="{{ route('products.index') }}" class="btn btn-outline-secondary" title="Limpiar filtros">
                    <i class="bi bi-x-lg"></i>
                </a>
            @endif
        </form>
    </div>
</div>

{{-- Chips de categoría --}}
<div class="category-chips d-flex flex-wrap gap-2 mb-4">
    <a href="{{ route('products.index', request('search') ? ['search' => request('search')] : []) }}"
       class="chip {{ !request('category') ? 'active' : '' }}">
        <i class="bi bi-grid-3x3-gap-fill"></i> Todas
    </a>
    @foreach($categories as $cat)
        <a href="{{ route('products.index', array_filter(['category' => $cat->slug, 'search' => request('search')])) }}"
           class="chip {{ request('category') == $cat->slug ? 'active' : '' }}">
            {{ $cat->name }}
        </a>
    @endforeach
</div>

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
